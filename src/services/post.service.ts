import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import axios from "axios";
import { PostEntity } from "../entities/post.entity";
import { CommentEntity } from "../entities/comment.entity";
import { CreateCommentDto } from '../dto/comment.dto';

const POST_URL = 'https://www.scalablepath.com/api/test/test-posts';

@Injectable()
export class PostService {
  private readonly postsUrl = POST_URL;

  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>
  ) {}

  async storePosts(): Promise<PostEntity[]> {
    const posts = await axios.get(this.postsUrl);
    const postsData = posts.data;
    return await this.postRepository.save(postsData);
  }

  async findAll(): Promise<PostEntity[]> { 
    return await this.postRepository.find();
  }

  async softDelete(id: number): Promise<void> { 
    await this.postRepository.update(id, { deletedAt: new Date() });
  }

  async fetchComments(id: number): Promise<CommentEntity[]> {
    const post = await this.postRepository.findOne({
      where: { id },
    });

    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return await this.commentRepository.find({ where: { postId: id } });
  }

  async moveComments(currentPostId: number, newPostId: number): Promise<void> {

    const newPost = await this.postRepository.findOne({
      where: { id: newPostId },
    });

    if (!newPost) {
      throw new HttpException('New post not found', HttpStatus.NOT_FOUND);
    }

    await this.commentRepository.update({ postId: currentPostId }, { postId: newPostId });
  }

  async addComment(postId: number, createCommentDto: CreateCommentDto): Promise<CommentEntity> {
    // Check if the post exists
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    // Create and save the new comment
    const newComment = this.commentRepository.create({ ...createCommentDto, postId });
    return await this.commentRepository.save(newComment);
  }
}