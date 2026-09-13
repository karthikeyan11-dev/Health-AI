import React, { useState, useEffect, useCallback } from 'react';
import { UsersDirectoryView } from '../components/UsersDirectoryView';
import type { UserListItem, UsersPaginationMeta } from '../types/users-directory.types';
import { usersApi } from '@/api';
import { ErrorCard } from '@/components/ui';
import { PageLoader } from '@/components/common';
import { extractErrorMessage } from '@/utils/error.util';

export function UsersDirectoryContainer(): React.JSX.Element {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [pagination, setPagination] = useState<UsersPaginationMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchUsers = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersApi.getUsers(page, 20);
      const resData = response.data.data;
      if (Array.isArray(resData)) {
        setUsers(resData as UserListItem[]);
        setPagination({
          total: resData.length,
          page,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } else {
        setUsers([]);
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to fetch registered users list'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers(1);
  }, [fetchUsers]);

  const handlePageChange = (newPage: number) => {
    void fetchUsers(newPage);
  };

  if (isLoading && users.length === 0) {
    return <PageLoader page="users" />;
  }

  if (error && users.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-6">
        <ErrorCard
          title="Unable to Load Users"
          message={error}
          onRetry={() => void fetchUsers(1)}
          retryText="Retry Fetching Users"
        />
      </div>
    );
  }

  return (
    <UsersDirectoryView
      users={users}
      pagination={pagination}
      isLoading={isLoading}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onRefresh={() => void fetchUsers(pagination.page)}
      onPageChange={handlePageChange}
    />
  );
}
