'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Loader2 } from 'lucide-react';

const schema = z.object({
  firstName: z.string().min(2, 'First name required'),
  lastName:  z.string().min(2, 'Last name required'),
  email:     z.string().email('Invalid email'),
  phone:     z.string().optional(),
  password:  z.string().min(8, 'Minimum 8 characters'),
  confirm:   z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router     = useRouter();
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      setLoading(true);
      const res = await authApi.register({ ...data, confirm: undefined });
      const { accessToken, refreshToken, user } = res.data.data;
      setAuth(
        { id: user.id, email: user.email, role: 'patient', firstName: user.firstName, lastName: user.lastName, tenantId: null, avatarUrl: null },
        accessToken, refreshToken
      );
      toast({ title: 'Registration successful', description: 'Welcome to Doctor SaaS!' });
      router.push('/patient');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Doctor SaaS</h1>
          <p className="text-slate-500 mt-1">Create a patient account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Join as a patient to book appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>First Name</Label>
                  <Input {...register('firstName')} placeholder="John" />
                  {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Last Name</Label>
                  <Input {...register('lastName')} placeholder="Doe" />
                  {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <Label>Email</Label>
                <Input type="email" {...register('email')} placeholder="john@example.com" />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Phone (optional)</Label>
                <Input {...register('phone')} placeholder="+1-416-555-0100" />
              </div>

              <div className="space-y-1">
                <Label>Password</Label>
                <Input type="password" {...register('password')} placeholder="Min 8 characters" />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <div className="space-y-1">
                <Label>Confirm Password</Label>
                <Input type="password" {...register('confirm')} placeholder="Repeat password" />
                {errors.confirm && <p className="text-xs text-red-500">{errors.confirm.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 size={16} className="animate-spin mr-2" />Creating account…</> : 'Create Account'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
