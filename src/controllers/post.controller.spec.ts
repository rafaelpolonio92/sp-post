import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from '../services/post.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostEntity } from '../entities/post.entity';
import { CommentEntity } from '../entities/comment.entity';
import { Repository } from 'typeorm';

describe('PostController', () => {
  let postController: PostController;
  let postService: PostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        PostService,
        {
          provide: getRepositoryToken(PostEntity),
          useClass: Repository, // Mock the PostEntity repository
        },
        {
          provide: getRepositoryToken(CommentEntity),
          useClass: Repository, // Mock the CommentEntity repository
        },
      ],
    }).compile();

    postController = module.get<PostController>(PostController);
    postService = module.get<PostService>(PostService);
  });

  describe('getAll', () => {
    it('should return an array of posts', async () => {
      const result = [new PostEntity()];
      jest.spyOn(postService, 'findAll').mockResolvedValue(result);

      expect(await postController.getAll()).toBe(result);
    });
  });

  describe('addComment', () => {
    it('should add a comment to a post and return the created comment', async () => {
      const newComment = new CommentEntity();
      jest.spyOn(postService, 'addComment').mockResolvedValue(newComment);

      const result = await postController.addComment(1, {
        body: 'Test comment',
        name: 'Test Name',
        email: 'test@example.com',
      });

      expect(result).toBe(newComment);
      expect(postService.addComment).toHaveBeenCalledWith(1, {
        body: 'Test comment',
        name: 'Test Name',
        email: 'test@example.com',
      });
    });
  });

  describe('moveComments', () => {
    it('should move comments from one post to another', async () => {
      jest.spyOn(postService, 'moveComments').mockResolvedValue(undefined);

      await postController.moveComments(1, 2);

      expect(postService.moveComments).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('softDeletePost', () => {
    it('should soft delete a post by id', async () => {
      jest.spyOn(postService, 'softDelete').mockResolvedValue(undefined);

      await postController.softDeletePost(1);

      expect(postService.softDelete).toHaveBeenCalledWith(1);
    });
  });
});
