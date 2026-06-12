'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { getDashboardPath } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Eye, EyeOff, Loader2 } from 'lucide-react';

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router    = useRouter();
  const { setAuth } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      setLoading(true);
      const res = await authApi.login(data);
      const { accessToken, refreshToken, user } = res.data.data;
      setAuth(
        { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName, tenantId: user.tenantId, avatarUrl: null },
        accessToken,
        refreshToken
      );
      toast({ title: 'Login successful', description: `Welcome back, ${user.firstName}!` });
      router.push(getDashboardPath(user.role));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Doctor SaaS</h1>
          <p className="text-slate-500 mt-1">Medical Management Platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Signing in…</> : 'Sign In'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-slate-500">
              New patient?{' '}
              <Link href="/register" className="text-blue-600 hover:underline font-medium">
                Create an account
              </Link>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
              <p className="font-medium mb-1">Demo credentials:</p>
              <p>Super Admin: admin@doctorsaas.com / Admin@123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
