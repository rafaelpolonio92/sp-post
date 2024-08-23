import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostController } from '../controllers/post.controller';
import { PostEntity } from '../entities/post.entity';
import { PostService } from '../services/post.service';
import { CommentEntity } from '../entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PostEntity, CommentEntity]),
  ],
  exports: [TypeOrmModule],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
