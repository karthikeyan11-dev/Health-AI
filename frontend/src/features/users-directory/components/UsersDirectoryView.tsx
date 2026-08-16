import React from 'react';
import type { UserListItem, UsersPaginationMeta } from '../types/users-directory.types';
import { USERS_DIRECTORY_TEXTS } from '../constants/users-directory.constants';
import { Search, UserCheck, ShieldCheck, Mail, Calendar, RefreshCw } from 'lucide-react';

interface UsersDirectoryViewProps {
  users: UserListItem[];
  pagination: UsersPaginationMeta;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onPageChange: (newPage: number) => void;
}

export function UsersDirectoryView({
  users,
  pagination,
  isLoading,
  searchQuery,
  onSearchChange,
  onRefresh,
  onPageChange,
}: UsersDirectoryViewProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {USERS_DIRECTORY_TEXTS.PAGE_TITLE}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{USERS_DIRECTORY_TEXTS.PAGE_SUBTITLE}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{pagination.total} Total Users</span>
          </span>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={USERS_DIRECTORY_TEXTS.SEARCH_PLACEHOLDER}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
        />
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {users.length === 0 && !isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800 text-base">
              {USERS_DIRECTORY_TEXTS.EMPTY_TITLE}
            </h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {USERS_DIRECTORY_TEXTS.EMPTY_SUBTITLE}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">{USERS_DIRECTORY_TEXTS.COL_USER}</th>
                  <th className="py-3.5 px-5">{USERS_DIRECTORY_TEXTS.COL_CONTACT}</th>
                  <th className="py-3.5 px-5">{USERS_DIRECTORY_TEXTS.COL_ROLE}</th>
                  <th className="py-3.5 px-5">{USERS_DIRECTORY_TEXTS.COL_STATUS}</th>
                  <th className="py-3.5 px-5">{USERS_DIRECTORY_TEXTS.COL_JOINED}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((user) => {
                  const initial = (user.firstName?.[0] || 'U').toUpperCase();
                  const fullName = `${user.firstName} ${user.lastName}`;
                  const formattedDate = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A';

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* User Column */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                            {initial}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{fullName}</p>
                            <p className="text-xs text-slate-400 mt-0.5">ID: {user.id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Column */}
                      <td className="py-4 px-5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                          {user.phoneNumber && (
                            <p className="text-xs text-slate-400 pl-5">{user.phoneNumber}</p>
                          )}
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-xs font-medium">
                          <ShieldCheck className="w-3 h-3 text-teal-600" />
                          <span>{user.role}</span>
                        </span>
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-5">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium">
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>

                      {/* Joined Date Column */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage || isLoading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage || isLoading}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
