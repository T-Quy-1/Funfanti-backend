import { Test, TestingModule } from '@nestjs/testing';
import { QuestionSetsController } from './question-sets.controller';
import { QuestionSetsService } from './question-sets.service';
import { QuestionSetSort } from './dto/query-question-sets.dto';

describe('QuestionSetsController', () => {
  let controller: QuestionSetsController;

  const mockQuestionSetsService = {
    findAll: jest.fn(),
    findTags: jest.fn(),
    findOne: jest.fn(),
    getQuestions: jest.fn(),
    bookmark: jest.fn(),
    removeBookmark: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionSetsController],
      providers: [
        { provide: QuestionSetsService, useValue: mockQuestionSetsService },
      ],
    }).compile();

    controller = module.get<QuestionSetsController>(QuestionSetsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate discovery to QuestionSetsService', async () => {
    const query = {
      topic: 'math',
      sort: QuestionSetSort.Popular,
      isFeatured: true,
      page: 1,
      limit: 10,
    };
    mockQuestionSetsService.findAll.mockResolvedValue([]);

    await expect(controller.findAll(query)).resolves.toEqual([]);
    expect(mockQuestionSetsService.findAll).toHaveBeenCalledWith(query);
  });

  it('should delegate tag lookups to QuestionSetsService', async () => {
    mockQuestionSetsService.findTags.mockResolvedValue(['History', 'Science']);

    await expect(controller.findTags()).resolves.toEqual([
      'History',
      'Science',
    ]);
    expect(mockQuestionSetsService.findTags).toHaveBeenCalledTimes(1);
  });

  it('should delegate detail and questions lookups', async () => {
    mockQuestionSetsService.findOne.mockResolvedValue({ id: 'set-uuid' });
    mockQuestionSetsService.getQuestions.mockResolvedValue({
      id: 'set-uuid',
      questions: [],
    });

    await expect(controller.findOne('set-uuid')).resolves.toEqual({
      id: 'set-uuid',
    });
    await expect(controller.getQuestions('set-uuid')).resolves.toEqual({
      id: 'set-uuid',
      questions: [],
    });
    expect(mockQuestionSetsService.findOne).toHaveBeenCalledWith('set-uuid');
    expect(mockQuestionSetsService.getQuestions).toHaveBeenCalledWith(
      'set-uuid',
    );
  });

  it('should delegate bookmark mutations', async () => {
    const user = { id: 'user-uuid' };
    mockQuestionSetsService.bookmark.mockResolvedValue({
      message: 'Bookmark created successfully',
    });
    mockQuestionSetsService.removeBookmark.mockResolvedValue({
      message: 'Bookmark removed successfully',
    });

    await expect(controller.bookmark(user, 'set-uuid')).resolves.toEqual({
      message: 'Bookmark created successfully',
    });
    await expect(controller.removeBookmark(user, 'set-uuid')).resolves.toEqual({
      message: 'Bookmark removed successfully',
    });
    expect(mockQuestionSetsService.bookmark).toHaveBeenCalledWith(
      'user-uuid',
      'set-uuid',
    );
    expect(mockQuestionSetsService.removeBookmark).toHaveBeenCalledWith(
      'user-uuid',
      'set-uuid',
    );
  });
});
