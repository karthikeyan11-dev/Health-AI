import React from 'react';
import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from '@/components/error-boundary';

export function RootLayout(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground flex flex-col antialiased">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </ErrorBoundary>
  );
}
