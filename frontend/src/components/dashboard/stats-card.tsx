import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CARD_GRADIENTS: Record<string, string> = {
  blue:   'linear-gradient(135deg,#eff6ff 0%,#dbeafe 100%)',
  teal:   'linear-gradient(135deg,#f0fdfa 0%,#ccfbf1 100%)',
  green:  'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)',
  purple: 'linear-gradient(135deg,#faf5ff 0%,#ede9fe 100%)',
  orange: 'linear-gradient(135deg,#fff7ed 0%,#fed7aa 100%)',
};

interface StatsCardProps {
  title:     string;
  value:     string | number;
  icon:      React.ReactNode;
  color?:    string;
  iconBg?:   string;
  trend?:    { value: number; label: string };
  subtitle?: string;
}

export function StatsCard({
  title, value, icon,
  color   = 'blue',
  iconBg  = 'bg-sky-500',
  trend, subtitle,
}: StatsCardProps) {
  const gradient = CARD_GRADIENTS[color] || CARD_GRADIENTS.blue;

  return (
    <Card
      className="border-0 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      style={{ background: gradient }}
    >
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold mt-1.5 text-slate-800">{value}</p>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
            {trend && (
              <div className={cn(
                'flex items-center gap-1 text-xs mt-2 font-semibold',
                trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'
              )}>
                {trend.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
              </div>
            )}
          </div>
          <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-md', iconBg)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
