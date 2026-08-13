import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { ThemeProvider } from '@/app/providers';
import './App.css';

export function App(): React.JSX.Element {
  return (
    <ThemeProvider defaultTheme="system" storageKey="health-ai-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
