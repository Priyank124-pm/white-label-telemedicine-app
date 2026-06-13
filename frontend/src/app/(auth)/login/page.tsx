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
import { Eye, EyeOff, Loader2, Stethoscope, ShieldCheck, Clock, Users } from 'lucide-react';

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

const FEATURES = [
  { icon: <Stethoscope size={20} />, title: 'Smart Scheduling', desc: 'AI-powered appointment management for doctors and patients' },
  { icon: <ShieldCheck size={20} />,  title: 'Secure Records',   desc: 'HIPAA-compliant electronic health records with encryption' },
  { icon: <Clock size={20} />,        title: 'Real-time Updates', desc: 'Instant notifications for prescriptions and lab results' },
  { icon: <Users size={20} />,        title: 'Multi-role Access', desc: 'Unified platform for clinics, doctors, patients & pharmacies' },
];

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
      toast({ title: 'Welcome back!', description: `Signed in as ${user.firstName} ${user.lastName}` });
      router.push(getDashboardPath(user.role));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      toast({ title: 'Sign in failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #0c1a2e 0%, #0f3460 50%, #0ea5e9 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #7dd3fc, transparent)' }} />
        <div className="absolute top-1/3 right-0 w-64 h-64 rounded-full opacity-5" style={{ background: 'radial-gradient(circle, #e0f2fe, transparent)' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Stethoscope size={22} className="text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-xl tracking-tight">CareDesk</span>
              <p className="text-sky-300 text-xs">Medical Platform</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-white leading-tight">
                Modern healthcare,<br />
                <span className="text-sky-300">simplified.</span>
              </h2>
              <p className="text-slate-300 mt-3 text-base leading-relaxed max-w-sm">
                The all-in-one white-label telemedicine platform for clinics, doctors, patients, and pharmacies.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-4">
              {FEATURES.map((f) => (
                <div key={f.title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-sky-300 flex-shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{f.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-slate-500 text-xs">© 2026 CareDesk. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center">
            <div className="w-14 h-14 rounded-2xl bg-sky-500 flex items-center justify-center mx-auto mb-3">
              <Stethoscope size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">CareDesk</h1>
            <p className="text-slate-500 text-sm">Medical Platform</p>
          </div>

          {/* Form header */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Sign in</h2>
            <p className="text-slate-500 text-sm mt-1">Enter your credentials to access your dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-slate-700 font-medium text-sm">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@clinic.com"
                className="h-11 bg-white border-slate-200 focus:border-sky-400 focus:ring-sky-400/20"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-700 font-medium text-sm">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-11 bg-white border-slate-200 focus:border-sky-400 focus:ring-sky-400/20 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold rounded-xl shadow-md shadow-sky-200"
              style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin mr-2" />Signing in…</>
              ) : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-500">
            New patient?{' '}
            <Link href="/register" className="text-sky-600 hover:text-sky-700 font-semibold hover:underline">
              Create an account
            </Link>
          </div>

          {/* Demo credentials */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Demo credentials</p>
            <div className="space-y-1 text-xs text-slate-500">
              <p><span className="font-medium text-slate-700">Super Admin:</span> admin@doctorsaas.com / Admin@123</p>
              <p><span className="font-medium text-slate-700">Doctor:</span> dr.sarah.johnson@healthfirst.ca / Doctor@123</p>
              <p><span className="font-medium text-slate-700">Patient:</span> john.doe@email.com / Patient@123</p>
              <p><span className="font-medium text-slate-700">Pharmacy:</span> pharmacy@healthfirst.ca / Pharma@123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
