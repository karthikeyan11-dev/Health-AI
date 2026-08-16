import type { User } from '@/sdk';

export type UserListItem = User;

export interface UsersPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
