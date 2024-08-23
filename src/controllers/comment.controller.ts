import { Controller, Get } from '@nestjs/common';
import { CommentService } from '../services/comment.service';
import { CommentEntity } from '../entities/comment.entity';

@Controller('comments')
export class CommentController { 
  constructor(private readonly commentService: CommentService) {}
  
  @Get()
  async getFromSource(): Promise<CommentEntity[]> {
    const response = await this.commentService.storeComments();
    return response;
  }
}