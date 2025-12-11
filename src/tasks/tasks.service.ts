import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { UsersService } from '../users/users.service';

type AuthUser = {
  userId: string;
  email: string;
  role: 'owner' | 'senior' | 'junior';
  orgId?: string;
};

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private usersService: UsersService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: AuthUser): Promise<Task> {
    this.ensureDueDateIsFuture(createTaskDto.dueDate);
    this.assertCanCreateTask(user);

    const assignee = await this.resolveAssignee(createTaskDto.assignedTo, user);

    const createdTask = new this.taskModel({
      ...createTaskDto,
      assignedTo: assignee?._id?.toString(),
      isCompleted: createTaskDto.status === 'DONE',
      createdBy: user.userId,
      orgId: user.orgId || '',
    });
    return createdTask.save();
  }

  async findAll(query: TaskQueryDto, user: AuthUser): Promise<{
    data: Task[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      status,
      assignedTo,
      page = 1,
      limit = 20,
      sortBy = 'dueDate',
      sortOrder = 'asc',
      search,
    } = query;

    const andFilters: FilterQuery<TaskDocument>[] = [{ orgId: user.orgId }];

    if (status) andFilters.push({ status });
    if (assignedTo) andFilters.push({ assignedTo });
    if (search) {
      andFilters.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      });
    }

    const accessFilter = await this.buildAccessFilter(user);
    if (accessFilter) {
      andFilters.push(accessFilter);
    }

    const filter: FilterQuery<TaskDocument> =
      andFilters.length > 0 ? { $and: andFilters } : {};

    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    const [data, total] = await Promise.all([
      this.taskModel
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.taskModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async findOne(id: string, user: AuthUser): Promise<Task> {
    const task = await this.taskModel.findById(id).lean().exec();
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    await this.assertCanAccess(task, user);
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: AuthUser): Promise<Task> {
    if (updateTaskDto.dueDate) {
      this.ensureDueDateIsFuture(updateTaskDto.dueDate);
    }

    const existing = await this.taskModel.findById(id).lean().exec();
    if (!existing) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    await this.assertCanAccess(existing, user);

    let assigneeId: string | undefined = existing.assignedTo;
    if (updateTaskDto.assignedTo) {
      const assignee = await this.resolveAssignee(updateTaskDto.assignedTo, user);
      if (!assignee) {
        throw new NotFoundException('Assignee not found');
      }
      assigneeId = String(assignee._id);
    }

    const update: Partial<Task> = {
      ...updateTaskDto,
      assignedTo: assigneeId,
    };
    if (updateTaskDto.status) {
      update.isCompleted = updateTaskDto.status === 'DONE';
    }

    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .lean()
      .exec();
    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return updatedTask;
  }

  async remove(id: string, user: AuthUser): Promise<void> {
    const existing = await this.taskModel.findById(id).lean().exec();
    if (!existing) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    await this.assertCanAccess(existing, user);

    const result = await this.taskModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }

  private ensureDueDateIsFuture(dueDate: Date) {
    const now = new Date();
    if (dueDate < now) {
      throw new BadRequestException('Due date cannot be in the past');
    }
  }

  private assertCanCreateTask(user: AuthUser) {
    if (user.role === 'owner' || user.role === 'senior') return;
    throw new ForbiddenException('Only owners or seniors can create tasks');
  }

  private async assertCanAccess(task: Task, user: AuthUser) {
    if (user.role === 'owner') {
      if (task.orgId !== user.orgId) {
        throw new ForbiddenException('Cross-organization access denied');
      }
      return;
    }

    if (user.role === 'junior') {
      if (task.assignedTo === user.userId) {
        return;
      }
      throw new ForbiddenException('You are not allowed to access this task');
    }

    // Senior can access tasks they created or that belong to their juniors
    if (task.orgId !== user.orgId) {
      throw new ForbiddenException('Cross-organization access denied');
    }
    if (task.createdBy?.toString() === user.userId) return;

    const juniors = await this.usersService.findJuniorsForSenior(user.userId, user.orgId || '');
    const juniorIds = juniors.map((j) => String(j._id));
    if (task.assignedTo && juniorIds.includes(task.assignedTo.toString())) {
      return;
    }

    throw new ForbiddenException('You are not allowed to access this task');
  }

  private async resolveAssignee(assigneeId: string | undefined, user: AuthUser) {
    if (!assigneeId) return null;

    const assignee = await this.usersService.findById(assigneeId);
    if (!assignee) {
      throw new NotFoundException('Assignee not found');
    }
    this.usersService.ensureUserInOrg(assignee, user.orgId || '');

    if (assignee.role !== 'junior') {
      throw new BadRequestException('Tasks can only be assigned to juniors');
    }

    if (user.role === 'senior' && assignee.managerId !== user.userId) {
      throw new ForbiddenException('Seniors can only assign tasks to their juniors');
    }

    return assignee;
  }

  private async buildAccessFilter(user: AuthUser): Promise<FilterQuery<TaskDocument> | null> {
    if (user.role === 'owner') {
      return { orgId: user.orgId };
    }

    if (user.role === 'junior') {
      return { assignedTo: user.userId };
    }

    // senior
    const juniors = await this.usersService.findJuniorsForSenior(user.userId, user.orgId || '');
    const juniorIds = juniors.map((j) => String(j._id));

    return {
      $or: [
        { createdBy: user.userId },
        { assignedTo: { $in: [...juniorIds, user.userId] } },
      ],
    };
  }

  async summary(user: AuthUser) {
    // Owner only enforced at controller, but keep org scope
    const orgFilter: FilterQuery<TaskDocument> = { orgId: user.orgId };
    const total = await this.taskModel.countDocuments(orgFilter);
    const done = await this.taskModel.countDocuments({ ...orgFilter, status: 'DONE' });
    const open = total - done;

    // per employee counts
    const perUser = await this.taskModel
      .aggregate([
        { $match: orgFilter },
        {
          $group: {
            _id: '$assignedTo',
            total: { $sum: 1 },
            done: { $sum: { $cond: [{ $eq: ['$status', 'DONE'] }, 1, 0] } },
          },
        },
      ])
      .exec();

    return { total, done, open, perUser };
  }
}

