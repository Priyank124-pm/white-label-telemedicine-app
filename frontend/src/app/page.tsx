import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Stethoscope, Users, Calendar, FileText, Package, BarChart3,
  Shield, Clock, Pill, Building2, ChevronRight, Check,
} from 'lucide-react';

const features = [
  { icon: <Building2 size={24} />, title: 'Multi-Clinic Support', desc: 'Manage multiple clinics under one white-label platform' },
  { icon: <Stethoscope size={24} />, title: 'Doctor Workspace', desc: 'Complete tools for appointments, prescriptions, and patient care' },
  { icon: <Users size={24} />, title: 'Patient Portal', desc: 'Self-service booking, records, and prescription access' },
  { icon: <Package size={24} />, title: 'Pharmacy Module', desc: 'Dispense medications and generate invoices seamlessly' },
  { icon: <FileText size={24} />, title: 'Digital Prescriptions', desc: 'Auto-generated PDF prescriptions with audit trail' },
  { icon: <BarChart3 size={24} />, title: 'Platform Analytics', desc: 'Real-time insights across all clinics and users' },
];

const roles = [
  { role: 'Super Admin', color: 'bg-indigo-500', items: ['Manage all clinics', 'Add/manage doctors', 'Medicine master', 'Platform analytics'] },
  { role: 'Doctor',      color: 'bg-blue-500',   items: ['Patient management', 'Appointment scheduling', 'Create prescriptions', 'Upload reports & referrals'] },
  { role: 'Patient',     color: 'bg-green-500',  items: ['Book appointments', 'View prescriptions', 'Download reports', 'Appointment history'] },
  { role: 'Pharmacy',    color: 'bg-purple-500', items: ['Search patients', 'View prescriptions', 'Dispense medications', 'Generate invoices'] },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800">Doctor SaaS</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild><Link href="/login">Sign In</Link></Button>
            <Button asChild><Link href="/register">Get Started</Link></Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <Shield size={14} /> HIPAA-Ready White Label Platform
        </div>
        <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
          The Complete<br />
          <span className="text-blue-600">Healthcare Management</span><br />
          Platform
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
          Empower clinics, doctors, patients, and pharmacies with one unified SaaS platform.
          White-label ready, production-grade, RBAC-secured.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" asChild><Link href="/login" className="flex items-center gap-2">Get Started <ChevronRight size={18} /></Link></Button>
          <Button size="lg" variant="outline" asChild><Link href="/register">Register as Patient</Link></Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Everything you need to run a modern clinic</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-12">Built for every role</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((r, i) => (
              <Card key={i} className="overflow-hidden">
                <div className={`${r.color} h-2 w-full`} />
                <CardContent className="pt-4">
                  <h3 className="font-bold mb-3">{r.role}</h3>
                  <ul className="space-y-2">
                    {r.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to transform your clinic?</h2>
        <p className="text-slate-500 mb-8">Start managing appointments, prescriptions, and patient care in minutes.</p>
        <Button size="lg" asChild><Link href="/login">Launch Dashboard</Link></Button>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-slate-400">
        © 2026 Doctor SaaS. White Label Medical Management Platform.
      </footer>
    </div>
  );
}
