'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Stethoscope, Calendar, FileText, Pill, BarChart3, Users,
  Shield, CheckCircle, Menu, X,
  Star, Building2, FlaskConical, Package, ArrowRight,
  HeartPulse, Zap, Globe, Phone,
} from 'lucide-react';
import { isAuthenticated, getStoredUser, getDashboardPath } from '@/lib/auth';

const FEATURES = [
  {
    icon: <Calendar size={24} />,
    title: 'Smart Appointments',
    desc: 'Online booking with real-time slot availability. Patients self-schedule 24/7 — no phone tag.',
    color: 'bg-sky-50 text-sky-600',
  },
  {
    icon: <FileText size={24} />,
    title: 'Digital Prescriptions',
    desc: 'Create, sign and send e-prescriptions instantly. Full medication history at your fingertips.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: <Pill size={24} />,
    title: 'Pharmacy Integration',
    desc: 'Prescriptions flow directly to your connected pharmacy. Dispense and invoice in one click.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: <FlaskConical size={24} />,
    title: 'Lab Reports',
    desc: 'Upload, share and track diagnostic reports securely. Patients view results from their portal.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: <Users size={24} />,
    title: 'Patient Management',
    desc: 'Complete patient profiles, visit history, referrals and care notes — all in one place.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Analytics Dashboard',
    desc: 'Track clinic performance, appointment trends and revenue at a glance.',
    color: 'bg-teal-50 text-teal-600',
  },
];

const STEPS = [
  { num: '01', title: 'Register your clinic', desc: 'Set up your clinic profile in minutes. Add doctors, set working hours, and configure your services.' },
  { num: '02', title: 'Onboard your team', desc: 'Invite doctors and pharmacy staff. Each role gets a tailored dashboard — no training needed.' },
  { num: '03', title: 'Go live', desc: 'Patients book online, doctors manage appointments, pharmacy dispenses. Everything in sync.' },
];

const FOR_ROLES = [
  {
    role: 'Doctors',
    icon: <Stethoscope size={20} />,
    color: 'border-sky-200 bg-sky-50',
    badge: 'bg-sky-100 text-sky-700',
    items: ['Today\'s schedule at a glance', 'Write prescriptions in 30 seconds', 'Send referrals instantly', 'View lab reports & history', 'Set your own availability'],
  },
  {
    role: 'Patients',
    icon: <HeartPulse size={20} />,
    color: 'border-emerald-200 bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700',
    items: ['Book appointments 24/7', 'View prescriptions online', 'Download lab reports', 'See upcoming appointments', 'Chat with your doctor'],
  },
  {
    role: 'Pharmacy',
    icon: <Package size={20} />,
    color: 'border-violet-200 bg-violet-50',
    badge: 'bg-violet-100 text-violet-700',
    items: ['Receive digital prescriptions', 'Dispense with one click', 'Auto-generate invoices', 'Track dispensing history', 'Manage medicine inventory'],
  },
];

const PLANS = [
  {
    name: 'Starter',
    price: '$49',
    period: '/month',
    desc: 'Perfect for solo practitioners',
    highlight: false,
    features: ['1 Doctor', '100 Patients', 'Appointments & Scheduling', 'Digital Prescriptions', 'Basic Reports', 'Email Support'],
  },
  {
    name: 'Clinic',
    price: '$149',
    period: '/month',
    desc: 'Best for growing clinics',
    highlight: true,
    features: ['Up to 10 Doctors', 'Unlimited Patients', 'Pharmacy Integration', 'Lab Reports', 'Advanced Analytics', 'Priority Support', 'Custom Branding'],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For hospital networks & chains',
    highlight: false,
    features: ['Unlimited Doctors', 'Multi-clinic Management', 'API Access', 'Custom Integrations', 'Dedicated Account Manager', 'SLA Guarantee'],
  },
];

const TESTIMONIALS = [
  {
    name: 'Dr. Sarah Johnson',
    role: 'General Practitioner, HealthFirst Clinic',
    text: 'CareDesk cut my admin time in half. I can now focus on patients instead of paperwork. The prescription flow is incredibly smooth.',
    rating: 5,
  },
  {
    name: 'Dr. Michael Chen',
    role: 'Cardiologist, CarePoint Medical',
    text: 'My patients love being able to book online and see their reports digitally. The referral system between doctors is a game changer.',
    rating: 5,
  },
  {
    name: 'Anika Sharma',
    role: 'Patient',
    text: 'I booked my appointment, saw the prescription, and picked up my medicine — all without a single phone call. This is the future.',
    rating: 5,
  },
];

const STATS = [
  { value: '10,000+', label: 'Patients Served' },
  { value: '500+',    label: 'Doctors Onboard' },
  { value: '120+',    label: 'Clinics & Hospitals' },
  { value: '99.9%',   label: 'Uptime SLA' },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dashPath, setDashPath]  = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      const user = getStoredUser();
      if (user) setDashPath(getDashboardPath(user.role));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-800">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}>
              <Stethoscope size={18} />
            </div>
            <span className="font-bold text-lg text-slate-900">CareDesk</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-sky-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-sky-600 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-sky-600 transition-colors">Pricing</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {dashPath ? (
              <Link href={dashPath} className="px-4 py-2 text-sm font-semibold rounded-xl text-white shadow-md" style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}>
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-sky-600 transition-colors px-3 py-2">
                  Sign In
                </Link>
                <Link href="/register" className="px-4 py-2 text-sm font-semibold rounded-xl text-white shadow-md transition-all hover:shadow-sky-200/60" style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}>
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile nav drawer */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-3">
            <a href="#features"     className="block text-sm font-medium text-slate-700 py-1" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="block text-sm font-medium text-slate-700 py-1" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#pricing"      className="block text-sm font-medium text-slate-700 py-1" onClick={() => setMenuOpen(false)}>Pricing</a>
            <hr className="border-slate-100" />
            <Link href="/login"    className="block text-sm font-semibold text-slate-700 py-1">Sign In</Link>
            <Link href="/register" className="block text-sm font-semibold text-sky-600 py-1">Get Started Free →</Link>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(150deg, #f0f9ff 0%, #e0f2fe 40%, #f8fafc 100%)' }}>
        {/* decorative blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle at 80% 20%, #38bdf8, transparent 60%)' }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #7dd3fc, transparent 60%)' }} />

        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Zap size={12} /> White-label Telemedicine Platform
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
              The smarter way to
              <span className="block" style={{ background: 'linear-gradient(135deg,#0ea5e9,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                run your clinic
              </span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl mx-auto">
              CareDesk connects doctors, patients, and pharmacies in one seamless platform.
              Appointments, prescriptions, lab reports — all digital, all fast.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-2xl text-white shadow-lg shadow-sky-200/50 hover:shadow-sky-300/60 transition-all"
                style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}
              >
                Start Free Trial <ArrowRight size={16} />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold rounded-2xl bg-white text-slate-700 border border-slate-200 hover:border-sky-300 hover:text-sky-600 transition-all shadow-sm"
              >
                Sign In to Dashboard
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle size={13} className="text-emerald-500" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={13} className="text-emerald-500" /> Free 30-day trial</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={13} className="text-emerald-500" /> HIPAA compliant</span>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-200 shadow-2xl shadow-sky-100/30 overflow-hidden bg-white">
              {/* Fake browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4 h-6 rounded-md bg-slate-200/80 text-xs text-slate-400 flex items-center px-3">app.caredesk.com/doctor</div>
              </div>
              {/* Mock dashboard */}
              <div className="flex h-80 bg-slate-50">
                {/* Fake sidebar */}
                <div className="w-48 bg-slate-900 p-4 hidden sm:block">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-7 h-7 rounded-lg bg-sky-500 flex items-center justify-center">
                      <Stethoscope size={14} className="text-white" />
                    </div>
                    <span className="text-white text-xs font-bold">CareDesk</span>
                  </div>
                  {['Dashboard','Patients','Appointments','Prescriptions','Reports'].map((item, i) => (
                    <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-1 text-xs ${i === 0 ? 'bg-sky-500 text-white' : 'text-slate-400'}`}>
                      <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      {item}
                    </div>
                  ))}
                </div>
                {/* Fake content */}
                <div className="flex-1 p-5 overflow-hidden">
                  <p className="text-sm font-semibold text-slate-700 mb-4">Today's Overview</p>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Patients', val: '28', color: 'bg-sky-50 text-sky-600' },
                      { label: 'Today', val: '6', color: 'bg-emerald-50 text-emerald-600' },
                      { label: 'Pending', val: '3', color: 'bg-orange-50 text-orange-600' },
                    ].map((s) => (
                      <div key={s.label} className="bg-white rounded-xl p-3 border border-slate-100">
                        <p className="text-[10px] text-slate-500">{s.label}</p>
                        <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.val}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl border border-slate-100 p-3">
                    <p className="text-[10px] font-semibold text-slate-500 mb-2 uppercase tracking-wide">Upcoming Appointments</p>
                    {[
                      { name: 'John Doe', time: '09:00 AM', type: 'General' },
                      { name: 'Priya Shah', time: '10:30 AM', type: 'Follow-up' },
                      { name: 'Mike Wilson', time: '11:00 AM', type: 'Consultation' },
                    ].map((a) => (
                      <div key={a.name} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-[9px] font-bold text-sky-600">{a.name[0]}</div>
                          <div>
                            <p className="text-[10px] font-medium text-slate-700">{a.name}</p>
                            <p className="text-[9px] text-slate-400">{a.type}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-medium text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">{a.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-slate-100 bg-white py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sky-600 text-sm font-semibold uppercase tracking-widest mb-2">Everything you need</p>
            <h2 className="text-4xl font-bold text-slate-900">One platform. Every workflow.</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">From the first appointment to the dispensed prescription — CareDesk covers the full care journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-slate-800 text-base mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sky-600 text-sm font-semibold uppercase tracking-widest mb-2">Simple setup</p>
            <h2 className="text-4xl font-bold text-slate-900">Up and running in hours, not weeks</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-sky-200 via-sky-400 to-sky-200 z-0" />
            {STEPS.map((s) => (
              <div key={s.num} className="relative z-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-sky-500 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-200">
                  {s.num}
                </div>
                <h3 className="font-semibold text-slate-800 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For every role ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sky-600 text-sm font-semibold uppercase tracking-widest mb-2">Built for everyone</p>
            <h2 className="text-4xl font-bold text-slate-900">A dashboard tailored to each role</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FOR_ROLES.map((r) => (
              <div key={r.role} className={`rounded-2xl border p-6 ${r.color}`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${r.badge}`}>{r.icon}</div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${r.badge}`}>{r.role}</span>
                </div>
                <ul className="space-y-2.5">
                  {r.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <CheckCircle size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sky-600 text-sm font-semibold uppercase tracking-widest mb-2">Loved by clinics</p>
            <h2 className="text-4xl font-bold text-slate-900">Don't take our word for it</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sky-600 text-sm font-semibold uppercase tracking-widest mb-2">Transparent pricing</p>
            <h2 className="text-4xl font-bold text-slate-900">Simple plans, no surprises</h2>
            <p className="text-slate-500 mt-3">All plans include a 30-day free trial. No credit card required.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((p) => (
              <div key={p.name} className={`rounded-2xl p-7 border relative ${p.highlight ? 'border-sky-400 shadow-xl shadow-sky-100/50 bg-white scale-105' : 'border-slate-200 bg-white shadow-sm'}`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#0ea5e9,#7c3aed)' }}>
                    Most Popular
                  </div>
                )}
                <p className="font-bold text-slate-800 text-lg">{p.name}</p>
                <p className="text-slate-500 text-xs mt-1 mb-4">{p.desc}</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-bold text-slate-900">{p.price}</span>
                  {p.period && <span className="text-slate-500 text-sm pb-1">{p.period}</span>}
                </div>
                <ul className="space-y-2.5 mb-7">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-3 rounded-xl text-sm font-semibold transition-all ${p.highlight ? 'text-white shadow-md hover:shadow-sky-200' : 'bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700'}`}
                  style={p.highlight ? { background: 'linear-gradient(135deg,#0ea5e9,#0284c7)' } : undefined}
                >
                  {p.price === 'Custom' ? 'Contact Sales' : 'Get Started Free'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 text-white" style={{ background: 'linear-gradient(135deg, #0c1a2e 0%, #0f3460 50%, #0284c7 100%)' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to modernize your clinic?</h2>
          <p className="text-sky-200 text-lg mb-8">Join 500+ doctors who save 10+ hours per week with CareDesk.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-sky-700 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Start Free Trial <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center">
                  <Stethoscope size={16} className="text-white" />
                </div>
                <span className="text-white font-bold">CareDesk</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">White-label telemedicine platform for modern clinics.</p>
              <div className="flex gap-3 mt-4">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-sky-500 transition-colors cursor-pointer">
                  <Globe size={14} />
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-sky-500 transition-colors cursor-pointer">
                  <Phone size={14} />
                </div>
              </div>
            </div>

            <div>
              <p className="text-white font-semibold text-sm mb-3">Product</p>
              <ul className="space-y-2 text-sm">
                <li><a href="#features"     className="hover:text-sky-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-sky-400 transition-colors">How it works</a></li>
                <li><a href="#pricing"      className="hover:text-sky-400 transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <p className="text-white font-semibold text-sm mb-3">Roles</p>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-sky-400 transition-colors cursor-pointer">For Doctors</span></li>
                <li><span className="hover:text-sky-400 transition-colors cursor-pointer">For Patients</span></li>
                <li><span className="hover:text-sky-400 transition-colors cursor-pointer">For Pharmacies</span></li>
                <li><span className="hover:text-sky-400 transition-colors cursor-pointer">For Admins</span></li>
              </ul>
            </div>

            <div>
              <p className="text-white font-semibold text-sm mb-3">Company</p>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-sky-400 transition-colors cursor-pointer">About Us</span></li>
                <li><span className="hover:text-sky-400 transition-colors cursor-pointer">Privacy Policy</span></li>
                <li><span className="hover:text-sky-400 transition-colors cursor-pointer">Terms of Service</span></li>
                <li><span className="hover:text-sky-400 transition-colors cursor-pointer">Contact</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs text-slate-600">© 2026 CareDesk. All rights reserved.</p>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Shield size={12} className="text-emerald-500" />
              HIPAA Compliant &nbsp;·&nbsp;
              <Building2 size={12} />
              Enterprise Ready
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
