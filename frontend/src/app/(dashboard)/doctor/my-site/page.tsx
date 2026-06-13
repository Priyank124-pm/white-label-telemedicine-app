'use client';

import { Globe, Rocket, CheckCircle, Clock } from 'lucide-react';

const UPCOMING = [
  'Public profile page with photo, bio, specialization',
  'Online appointment booking directly from your site',
  'Patient reviews & ratings display',
  'Services & fee list',
  'Custom domain support (e.g. drsarah.caredesk.com)',
  'SEO optimized for local search',
];

export default function MySitePage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg"
          style={{ background: 'linear-gradient(135deg,#0ea5e9,#7c3aed)' }}>
          <Globe size={36} className="text-white" />
        </div>
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
          <Clock size={12} /> Coming Soon
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Your Personal Doctor Website</h1>
        <p className="text-slate-500 text-base leading-relaxed">
          We're building a powerful feature that lets every doctor on CareDesk
          have their own branded public website — with zero setup required.
        </p>
      </div>

      {/* Feature list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Rocket size={18} className="text-sky-600" />
          <h2 className="font-semibold text-slate-800">What's coming</h2>
        </div>
        <ul className="space-y-3">
          {UPCOMING.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
              <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Preview card */}
      <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
        <p className="text-sm font-semibold text-slate-500 mb-1">Your future URL</p>
        <p className="text-lg font-mono font-bold text-sky-600">dr-sarah-johnson.caredesk.com</p>
        <p className="text-xs text-slate-400 mt-2">We'll notify you as soon as this is ready to launch.</p>
      </div>
    </div>
  );
}
