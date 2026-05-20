import { Test, TestingModule } from '@nestjs/testing';
import { QuestionSetsService } from './question-sets.service';
import { PrismaService } from '../common/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { QuestionSetSort } from './dto/query-question-sets.dto';

describe('QuestionSetsService', () => {
  let service: QuestionSetsService;

  const mockQuestionSet = {
    id: 'qs-uuid',
    creatorId: 'creator-uuid',
    title: 'Math Quiz',
    description: 'Test your math skills',
    topic: 'math',
    mediaUrl: null,
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [{ tag: { id: 'tag-1', name: 'Math' } }],
    creator: { id: 'creator-uuid', displayName: 'Creator', avatarUrl: null },
    _count: { sessions: 5, questions: 3 },
  };

  const mockPrismaService = {
    questionSet: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    bookmark: {
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionSetsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<QuestionSetsService>(QuestionSetsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of question sets', async () => {
      mockPrismaService.questionSet.findMany.mockResolvedValue([
        mockQuestionSet,
      ]);

      const result = await service.findAll({});

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Math Quiz');
      expect(result[0].tags).toEqual(['Math']);
      expect(result[0].questionCount).toBe(3);
    });

    it('should filter by topic', async () => {
      mockPrismaService.questionSet.findMany.mockResolvedValue([
        mockQuestionSet,
      ]);

      await service.findAll({ topic: 'math' });

      expect(mockPrismaService.questionSet.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { topic: { equals: 'math', mode: 'insensitive' } },
        }),
      );
    });

    it('should filter by featured status', async () => {
      mockPrismaService.questionSet.findMany.mockResolvedValue([
        mockQuestionSet,
      ]);

      await service.findAll({ isFeatured: true });

      expect(mockPrismaService.questionSet.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isFeatured: true },
        }),
      );
    });

    it('should sort by popular (session count)', async () => {
      mockPrismaService.questionSet.findMany.mockResolvedValue([]);

      await service.findAll({ sort: QuestionSetSort.Popular });

      expect(mockPrismaService.questionSet.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { sessions: { _count: 'desc' } },
        }),
      );
    });

    it('should sort by latest', async () => {
      mockPrismaService.questionSet.findMany.mockResolvedValue([]);

      await service.findAll({ sort: QuestionSetSort.Latest });

      expect(mockPrismaService.questionSet.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should handle pagination', async () => {
      mockPrismaService.questionSet.findMany.mockResolvedValue([]);

      await service.findAll({ page: 2, limit: 10 });

      expect(mockPrismaService.questionSet.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a single question set', async () => {
      mockPrismaService.questionSet.findUnique.mockResolvedValue(
        mockQuestionSet,
      );

      const result = await service.findOne('qs-uuid');

      expect(result.id).toBe('qs-uuid');
      expect(result.creator).toBeDefined();
      expect(result.tags).toEqual(['Math']);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.questionSet.findUnique.mockResolvedValue(null);

      await expect(service.findOne('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getQuestions', () => {
    it('should return questions with choices', async () => {
      const qsWithQuestions = {
        ...mockQuestionSet,
        questions: [
          {
            id: 'q-1',
            text: 'What is 2+2?',
            mediaUrl: null,
            explanationText: '2+2=4',
            orderIndex: 0,
            choices: [
              { id: 'c-1', text: '3', isCorrect: false },
              { id: 'c-2', text: '4', isCorrect: true },
            ],
          },
        ],
      };
      mockPrismaService.questionSet.findUnique.mockResolvedValue(
        qsWithQuestions,
      );

      const result = await service.getQuestions('qs-uuid');

      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].choices).toHaveLength(2);
      expect(result.questions[0].text).toBe('What is 2+2?');
    });

    it('should throw NotFoundException if question set not found', async () => {
      mockPrismaService.questionSet.findUnique.mockResolvedValue(null);

      await expect(service.getQuestions('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('bookmark', () => {
    it('should create a bookmark', async () => {
      mockPrismaService.questionSet.findUnique.mockResolvedValue(
        mockQuestionSet,
      );
      mockPrismaService.bookmark.findFirst.mockResolvedValue(null);
      mockPrismaService.bookmark.create.mockResolvedValue({
        id: 'bm-1',
        questionSetId: 'qs-uuid',
        createdAt: new Date(),
      });

      const result = await service.bookmark('user-uuid', 'qs-uuid');

      expect(result.message).toBe('Bookmark created successfully');
    });

    it('should throw NotFoundException if question set not found', async () => {
      mockPrismaService.questionSet.findUnique.mockResolvedValue(null);

      await expect(service.bookmark('user-uuid', 'unknown')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if already bookmarked', async () => {
      mockPrismaService.questionSet.findUnique.mockResolvedValue(
        mockQuestionSet,
      );
      mockPrismaService.bookmark.findFirst.mockResolvedValue({ id: 'bm-1' });

      await expect(service.bookmark('user-uuid', 'qs-uuid')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('removeBookmark', () => {
    it('should remove a bookmark', async () => {
      mockPrismaService.bookmark.findFirst.mockResolvedValue({ id: 'bm-1' });
      mockPrismaService.bookmark.delete.mockResolvedValue({});

      const result = await service.removeBookmark('user-uuid', 'qs-uuid');

      expect(result.message).toBe('Bookmark removed successfully');
    });

    it('should throw NotFoundException if bookmark not found', async () => {
      mockPrismaService.bookmark.findFirst.mockResolvedValue(null);

      await expect(
        service.removeBookmark('user-uuid', 'qs-uuid'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
