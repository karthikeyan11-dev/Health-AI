import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Label,
} from '@/components/ui';
import { HeartPulse, CheckCircle2, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { verified?: boolean; message?: string } | null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    // For now, simulate login navigation to dashboard
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/');
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Subtle Gradient Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/80 shadow-card-hover text-left p-6 sm:p-8 relative z-10 my-8">
        <CardHeader className="space-y-3 text-center p-0 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-subtle border border-primary/20 text-primary shadow-sm mx-auto">
            <HeartPulse className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Sign In to <span className="text-gradient-primary">Health AI</span>
          </CardTitle>
          <CardDescription>
            Access your personalized health dashboard and AI insights.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 space-y-4">
          {/* Verified Success Alert */}
          {state?.verified && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{state.message || 'User created successfully. Please log in.'}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="loginEmail" required>
                Email Address
              </Label>
              <Input
                id="loginEmail"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                disabled={isSubmitting}
                error={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-destructive font-medium mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="loginPassword" required>
                Password
              </Label>
              <Input
                id="loginPassword"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                disabled={isSubmitting}
                error={!!errors.password}
              />
              {errors.password && (
                <p className="text-xs text-destructive font-medium mt-1">{errors.password}</p>
              )}
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full mt-6 bg-gradient-primary hover:bg-gradient-primary-hover shadow-primary"
              disabled={isSubmitting}
            >
              Login
              <LogIn className="w-4 h-4 ml-2" />
            </Button>

            {/* New to platform? Register link below Login button */}
            <div className="text-center pt-3">
              <p className="text-sm text-muted-foreground">
                New to platform?{' '}
                <Link to="/register" className="font-semibold text-primary hover:underline ml-1">
                  Register
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
