import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TasksService } from './tasks.service';
import { Task } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';

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
  };

  const mockModel = {
    new: jest.fn().mockResolvedValue(mockTask),
    constructor: jest.fn().mockResolvedValue(mockTask),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    deleteOne: jest.fn(),
    exec: jest.fn(),
  };

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
    it('should create a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: 'TODO',
        dueDate: new Date(),
        priority: 1,
        assignedTo: 'test@example.com',
      };

      jest.spyOn(model, 'new').mockImplementation(() => mockTask as any);
      jest.spyOn(mockTask, 'save').mockResolvedValue(mockTask as any);

      const result = await service.create(createTaskDto);
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockTask]),
      } as any);

      const result = await service.findAll();
      expect(result).toEqual([mockTask]);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTask),
      } as any);

      const result = await service.findOne('mockId');
      expect(result).toEqual(mockTask);
    });
  });
}); 