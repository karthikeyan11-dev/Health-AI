import React, { useState, useEffect } from 'react';
import { authApi } from '@/api';
import type { User } from '@/sdk';
import { User as UserIcon, Mail, Phone, Calendar, Loader2, HeartPulse } from 'lucide-react';
import { ErrorCard } from '@/components/ui';
import { extractErrorMessage } from '@/utils/error.util';

export function ProfilePage(): React.JSX.Element {
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await authApi.getProfile();
      setProfile(res.data.data);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load user profile information'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading user profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto py-6">
        <ErrorCard
          title="Unable to Load Profile"
          message={error || 'Profile data unavailable'}
          onRetry={() => void loadProfile()}
          retryText="Retry Loading Profile"
        />
      </div>
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initial = (profile.firstName?.[0] || 'P').toUpperCase();
  const joinedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Profile</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your account information and preferences.
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {initial}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{fullName}</h2>
            <p className="text-xs text-emerald-700 font-semibold mt-0.5 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Role: {profile.role}</span>
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              Email Address
            </span>
            <p className="text-sm font-bold text-slate-800">{profile.email}</p>
          </div>

          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              Phone Number
            </span>
            <p className="text-sm font-bold text-slate-800">
              {profile.phoneNumber || 'Not provided'}
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase">
              <UserIcon className="w-3.5 h-3.5 text-slate-500" />
              Demographics
            </span>
            <p className="text-sm font-bold text-slate-800">
              Age: {profile.age || 'N/A'} • Gender: {profile.gender || 'N/A'}
            </p>
          </div>

          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Account Created
            </span>
            <p className="text-sm font-bold text-slate-800">{joinedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
