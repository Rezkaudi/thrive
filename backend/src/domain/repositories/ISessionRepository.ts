import { Session } from '../entities/Session';

interface PaginationOptions {
  offset: number;
  limit: number;
  filters?: {
    type?: 'SPEAKING' | 'EVENT';
    isActive?: boolean;
  };
}

interface PaginatedResult {
  sessions: Session[];
  total: number;
}

export interface ISessionRepository {
  create(session: Session): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  findUpcoming(limit?: number): Promise<Session[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Session[]>;
  findAllWithPagination(options: PaginationOptions): Promise<PaginatedResult>;
  update(session: Session): Promise<Session>;
  delete(id: string): Promise<boolean>;
  incrementParticipants(id: string): Promise<Session | null>;
  decrementParticipants(id: string): Promise<Session | null>;
}