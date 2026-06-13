import { cn } from '@/lib/utils';

interface Column<T> {
  key:       string;
  header:    string;
  render?:   (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns:      Column<T>[];
  data:         T[];
  isLoading?:   boolean;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  emptyMessage = 'No records found',
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-auto rounded-xl">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b" style={{ background: '#f8fafc' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'text-left px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wider whitespace-nowrap',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-4">
                    <div className="h-4 bg-slate-100 rounded-lg" style={{ width: `${55 + (i * 7) % 35}%` }} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-5 py-16 text-center">
                <div className="text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  </div>
                  <p className="font-medium text-slate-500 text-sm">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={idx}
                className="hover:bg-sky-50/40 transition-colors duration-100 group"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-5 py-3.5 text-slate-700', col.className)}>
                    {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
