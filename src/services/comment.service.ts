import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import axios from "axios";
import { CommentEntity } from "../entities/comment.entity";
import { PostEntity } from "../entities/post.entity";

const COMMENT_URL = 'https://www.scalablepath.com/api/test/test-comments';

@Injectable()
export class CommentService {
  private readonly commentsUrl = COMMENT_URL;

  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
  ) {}

  async storeComments(): Promise<CommentEntity[]> {
    const comments = await axios.get(this.commentsUrl);
    const commentData = comments.data;

    const postIds = commentData.map((comment: CommentEntity) => comment.postId);

    const existingPosts = await this.postRepository.find({
      where: { id: In(postIds) },
      select: ['id'], 
    });

    const existingPostIds = new Set(existingPosts.map(post => post.id));

    const validComments = commentData.filter((comment: CommentEntity) => existingPostIds.has(comment.postId));

    if (validComments.length > 0) {
      return await this.commentRepository.save(validComments);
    } else {
      throw new HttpException('No valid comments to store', HttpStatus.BAD_REQUEST);
    }
  }
}
