import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from '../controllers/comment.controller';
import { CommentService } from '../services/comment.service';
import { CommentEntity } from '../entities/comment.entity';

describe('CommentController', () => {
  let commentController: CommentController;
  let commentService: CommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: {
            storeComments: jest.fn(),
          },
        },
      ],
    }).compile();

    commentController = module.get<CommentController>(CommentController);
    commentService = module.get<CommentService>(CommentService);
  });

  describe('getFromSource', () => {
    it('should call storeComments and return the result', async () => {
      const mockComments: CommentEntity[] = [new CommentEntity(), new CommentEntity()];
      jest.spyOn(commentService, 'storeComments').mockResolvedValue(mockComments);

      const result = await commentController.getFromSource();

      expect(commentService.storeComments).toHaveBeenCalled();
      expect(result).toBe(mockComments);
    });
  });
});
