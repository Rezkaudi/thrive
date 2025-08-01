import { Post } from '../entities/Post';

export interface IPostRepository {
  create(post: Post): Promise<Post>;
  findById(id: string, currentUserId?: string): Promise<Post | null>; // Add optional currentUserId
  findAll(limit?: number, offset?: number, currentUserId?: string): Promise<{ posts: Post[]; total: number }>; // Add optional currentUserId
  findByUserId(userId: string, currentUserId?: string): Promise<Post[]>; // Add optional currentUserId
  findAnnouncements(currentUserId?: string): Promise<Post[]>; // Add optional currentUserId
  update(post: Post): Promise<Post>;
  delete(id: string): Promise<boolean>;
  incrementLikes(id: string): Promise<Post | null>;
  decrementLikes(id: string): Promise<Post | null>;
}
