import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from '../controllers/comment.controller';
import { CommentEntity } from '../entities/comment.entity';
import { CommentService } from '../services/comment.service';
import { PostModule } from './post.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity]),
    PostModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
