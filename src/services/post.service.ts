import { Injectable, HttpException, HttpStatus, Inject, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import axios from "axios";
import { PostEntity } from "../entities/post.entity";
import { CommentEntity } from "../entities/comment.entity";
import { CreateCommentDto } from '../dto/comment.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const POST_URL = 'https://www.scalablepath.com/api/test/test-posts';

@Injectable()
export class PostService {
  private readonly postsUrl = POST_URL;
  private readonly logger = new Logger(PostService.name);

  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async storePosts(): Promise<PostEntity[]> {
    this.logger.log('Fetching posts from external API');
    try {
      const posts = await axios.get(this.postsUrl);
      const postsData = posts.data;
      this.logger.log(`Fetched ${postsData.length} posts`);
      return await this.postRepository.save(postsData);
    } catch (error) {
      this.logger.error('Failed to fetch posts from external API', error.stack);
      throw new HttpException('Failed to fetch posts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<PostEntity[]> { 
    const cacheKey = 'all_posts';
    this.logger.log('Fetching all posts');

    try {
      const cachedPosts = await this.cacheManager.get<PostEntity[]>(cacheKey);
      if (cachedPosts) {
        this.logger.log('Returning posts from cache');
        return cachedPosts;
      }

      const posts = await this.postRepository.find();
      this.logger.log(`Fetched ${posts.length} posts from the database`);
      await this.cacheManager.set(cacheKey, posts, 300);
      return posts;
    } catch (error) {
      this.logger.error('Failed to fetch all posts', error.stack);
      throw new HttpException('Failed to fetch posts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async softDelete(id: number): Promise<void> { 
    this.logger.log(`Soft deleting post with id ${id}`);
    try {
      await this.postRepository.update(id, { deletedAt: new Date() });
    } catch (error) {
      this.logger.error(`Failed to soft delete post with id ${id}`, error.stack);
      throw new HttpException('Failed to delete post', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async fetchComments(id: number): Promise<CommentEntity[]> {
    this.logger.log(`Fetching comments for post with id ${id}`);
    try {
      const post = await this.postRepository.findOne({ where: { id } });

      if (!post) {
        this.logger.warn(`Post with id ${id} not found`);
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }

      const comments = await this.commentRepository.find({ where: { postId: id } });
      this.logger.log(`Fetched ${comments.length} comments for post with id ${id}`);
      return comments;
    } catch (error) {
      this.logger.error(`Failed to fetch comments for post with id ${id}`, error.stack);
      throw new HttpException('Failed to fetch comments', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async moveComments(currentPostId: number, newPostId: number): Promise<void> {
    this.logger.log(`Moving comments from post ${currentPostId} to ${newPostId}`);
    try {
      const newPost = await this.postRepository.findOne({ where: { id: newPostId } });

      if (!newPost) {
        this.logger.warn(`New post with id ${newPostId} not found`);
        throw new HttpException('New post not found', HttpStatus.NOT_FOUND);
      }

      await this.commentRepository.update({ postId: currentPostId }, { postId: newPostId });
      this.logger.log(`Successfully moved comments from post ${currentPostId} to ${newPostId}`);
    } catch (error) {
      this.logger.error(`Failed to move comments from post ${currentPostId} to ${newPostId}`, error.stack);
      throw new HttpException('Failed to move comments', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async addComment(postId: number, createCommentDto: CreateCommentDto): Promise<CommentEntity> {
    this.logger.log(`Adding a comment to post with id ${postId}`);
    try {
      const post = await this.postRepository.findOne({ where: { id: postId } });
      if (!post) {
        this.logger.warn(`Post with id ${postId} not found`);
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }

      const newComment = this.commentRepository.create({ ...createCommentDto, postId });
      const savedComment = await this.commentRepository.save(newComment);
      this.logger.log('Successfully added a new comment');
      return savedComment;
    } catch (error) {
      this.logger.error(`Failed to add comment to post with id ${postId}`, error.stack);
      throw new HttpException('Failed to add comment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}