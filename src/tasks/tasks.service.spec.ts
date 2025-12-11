import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TasksService } from './tasks.service';
import { Task } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';

describe('TasksService', () => {
  let service: TasksService;
  let model: Model<Task>;

  const mockTask = {
    _id: 'mockId',
    title: 'Test Task',
    description: 'Test Description',
    status: 'TODO',
    dueDate: new Date(),
    priority: 1,
    assignedTo: 'test@example.com',
    isCompleted: false,
    createdBy: 'user-id',
  };

  const user = { userId: 'user-id', email: 'test@example.com', role: 'user' };
  const admin = { userId: 'admin-id', email: 'admin@example.com', role: 'admin' };

  const mockFindExec = jest.fn();
  const mockCountExec = jest.fn();
  const mockLeanExec = jest.fn();

  const mockModel = {
    new: jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockTask),
    })),
    constructor: jest.fn(),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnValue({ exec: mockFindExec }),
    }),
    countDocuments: jest.fn().mockReturnValue({ exec: mockCountExec }),
    findById: jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnValue({ exec: mockLeanExec }),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnValue({ exec: mockLeanExec }),
    }),
    deleteOne: jest.fn(),
  } as unknown as Model<Task>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    model = module.get<Model<Task>>(getModelToken(Task.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task and set completion based on status', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'DONE',
        dueDate: new Date(Date.now() + 1000),
        priority: 1,
        assignedTo: 'test@example.com',
      };

      const result = await service.create(createTaskDto, user as any);
      expect(result).toEqual(mockTask);
      expect(mockModel.new).toHaveBeenCalledWith(
        expect.objectContaining({ isCompleted: true, createdBy: user.userId }),
      );
    });
  });

  describe('findAll', () => {
    it('should return tasks with pagination data', async () => {
      mockFindExec.mockResolvedValue([mockTask]);
      mockCountExec.mockResolvedValue(1);

      const query: TaskQueryDto = { page: 1, limit: 10 };
      const result = await service.findAll(query, admin as any);
      expect(result.data).toEqual([mockTask]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      mockLeanExec.mockResolvedValue(mockTask);

      const result = await service.findOne('mockId', user as any);
      expect(result).toEqual(mockTask);
    });
  });
}); 