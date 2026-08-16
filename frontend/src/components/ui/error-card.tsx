import * as React from 'react';
import { AlertCircle, RefreshCw, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { storage } from '@/lib/storage';

export interface ErrorCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  icon?: LucideIcon;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorCard({
  title = 'An Error Occurred',
  message,
  icon: Icon = AlertCircle,
  onRetry,
  retryText = 'Try Again',
  className,
  ...props
}: ErrorCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-rose-200 bg-rose-50/90 text-rose-900 p-6 sm:p-7 shadow-sm space-y-4 transition-all',
        className,
      )}
      {...props}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
          <Icon className="w-5 h-5 text-rose-600" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-bold text-base text-rose-900 tracking-tight">{title}</h3>
          <p className="text-sm text-rose-700 leading-relaxed font-medium">{message}</p>
        </div>
      </div>

      {(onRetry ||
        message.toLowerCase().includes('log in') ||
        message.toLowerCase().includes('session')) && (
        <div className="pt-1 flex items-center justify-end gap-3">
          {(message.toLowerCase().includes('log in') ||
            message.toLowerCase().includes('session')) && (
            <Button
              onClick={() => {
                storage.removeToken();
                window.location.href = '/login';
              }}
              variant="outline"
              size="sm"
              className="border-rose-300 text-rose-800 hover:bg-rose-100 font-bold rounded-xl px-4 py-2 text-xs transition-all"
            >
              <span>Log In Again</span>
            </Button>
          )}
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="destructive"
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl px-4 py-2 text-xs flex items-center gap-2 shadow-xs transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{retryText}</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
