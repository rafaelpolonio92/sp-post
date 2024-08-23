import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('posts')
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  title: string;

  @Column()
  body: string;

  @Column({ type: 'timestamp', nullable: true})
  @Index()
  deletedAt: Date | null
}