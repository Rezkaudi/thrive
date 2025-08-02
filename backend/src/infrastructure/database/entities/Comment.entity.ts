import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { PostEntity } from "./Post.entity";
import { UserEntity } from "./User.entity";

@Entity('comment')
export class CommentEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  postId!: string;

  @ManyToOne(() => PostEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'postId' })
  post!: PostEntity;

  @Column()
  userId!: string

  @ManyToOne(() => UserEntity, {
    onDelete: "CASCADE",
    onUpdate: 'CASCADE'
  })
  @JoinColumn({name: "userId"})
  user!: UserEntity

  @Column()
  content!: string;

  @Column({ nullable: true })
  parentCommentId?: string;

  @ManyToOne(() => CommentEntity, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({ name: 'parentCommentId' })
  parentComment?: CommentEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}