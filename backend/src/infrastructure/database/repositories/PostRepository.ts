import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database.config';
import { PostEntity } from '../entities/Post.entity';
import { UserEntity } from '../entities/User.entity';
import { ProfileEntity } from '../entities/Profile.entity';
import { IPostRepository } from '../../../domain/repositories/IPostRepository';
import { Post, IAuthor } from '../../../domain/entities/Post';

export class PostRepository implements IPostRepository {
  private repository: Repository<PostEntity>;
  private userRepository: Repository<UserEntity>;
  private profileRepository: Repository<ProfileEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(PostEntity);
    this.userRepository = AppDataSource.getRepository(UserEntity);
    this.profileRepository = AppDataSource.getRepository(ProfileEntity);
  }

  async create(post: Post): Promise<Post> {
    const entity = this.toEntity(post);
    const saved = await this.repository.save(entity);
    
    // Fetch author info for the created post
    const author = await this.getAuthorInfo(saved.userId);
    return this.toDomain(saved, author);
  }

  async findById(id: string): Promise<Post | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    
    const author = await this.getAuthorInfo(entity.userId);
    return this.toDomain(entity, author);
  }

  async findAll(limit?: number, offset?: number): Promise<{ posts: Post[]; total: number }> {
    const [entities, total] = await this.repository.findAndCount({
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
    
    // Get author info for all posts
    const posts = await Promise.all(
      entities.map(async (entity) => {
        const author = await this.getAuthorInfo(entity.userId);
        return this.toDomain(entity, author);
      })
    );
    
    return { posts, total };
  }

  async findByUserId(userId: string): Promise<Post[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    
    const author = await this.getAuthorInfo(userId);
    return entities.map(e => this.toDomain(e, author));
  }

  async findAnnouncements(): Promise<Post[]> {
    const entities = await this.repository.find({
      where: { isAnnouncement: true },
      order: { createdAt: 'DESC' },
    });
    
    const posts = await Promise.all(
      entities.map(async (entity) => {
        const author = await this.getAuthorInfo(entity.userId);
        return this.toDomain(entity, author);
      })
    );
    
    return posts;
  }

  async update(post: Post): Promise<Post> {
    const entity = this.toEntity(post);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved, post.author);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }

  async incrementLikes(id: string): Promise<Post | null> {
    await this.repository.increment({ id }, 'likesCount', 1);
    return this.findById(id);
  }

  async decrementLikes(id: string): Promise<Post | null> {
    await this.repository.decrement({ id }, 'likesCount', 1);
    return this.findById(id);
  }

  private async getAuthorInfo(userId: string): Promise<IAuthor> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      const profile = await this.profileRepository.findOne({ where: { userId } });
      
      return {
        userId,
        name: profile?.name || user?.email?.split('@')[0] || 'Unknown User',
        email: user?.email || '',
        avatar: profile?.profilePhoto || '',
      };
    } catch (error) {
      console.error('Error fetching author info:', error);
      return {
        userId,
        name: 'Unknown User',
        email: '',
        avatar: '',
      };
    }
  }

  private toDomain(entity: PostEntity, author: IAuthor): Post {
    return new Post(
      entity.id,
      author,
      entity.content,
      entity.mediaUrls.split(',').filter(url => url),
      entity.isAnnouncement,
      entity.likesCount,
      entity.createdAt,
      entity.updatedAt
    );
  }

  private toEntity(post: Post): PostEntity {
    const entity = new PostEntity();
    entity.id = post.id;
    entity.userId = post.author.userId;
    entity.content = post.content;
    entity.mediaUrls = post.mediaUrls.join(',');
    entity.isAnnouncement = post.isAnnouncement;
    entity.likesCount = post.likesCount;
    entity.createdAt = post.createdAt;
    entity.updatedAt = post.updatedAt;
    return entity;
  }
}