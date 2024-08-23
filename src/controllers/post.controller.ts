import { Controller, Get, Param, Post, Body, Put, Delete, ValidationPipe } from '@nestjs/common';
import { PostService } from '../services/post.service';
import { PostEntity } from '../entities/post.entity';
import { CommentEntity } from 'src/entities/comment.entity';
import { CreateCommentDto } from '../dto/comment.dto';

@Controller('posts')
export class PostController { 
  constructor(private readonly postService: PostService) {}
  
  @Get('source')
  async getFromSource(): Promise<PostEntity[]> {
    const response = await this.postService.storePosts();
    return response;
  }

  @Get()
  async getAll(): Promise<PostEntity[]> { 
    return await this.postService.findAll();
  }

  @Delete(':id')
  async softDeletePost(@Param('id') id: number): Promise<void> { 
    await this.postService.softDelete(id);
  }

  @Get(':id/comments')
  async fetchComments(@Param('id') id: number): Promise<CommentEntity[]> { 
    return await this.postService.fetchComments(id);
  }

  @Put(':id/comments/move/:newPostId')
  async moveComments(
    @Param('id') currentPostId: number, 
    @Param('newPostId') newPostId: number
  ): Promise<void> {
    await this.postService.moveComments(currentPostId, newPostId);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') postId: number, 
    @Body(new ValidationPipe({ whitelist: true })) createCommentDto: CreateCommentDto
  ): Promise<CommentEntity> {
    return await this.postService.addComment(postId, createCommentDto);
  }
}