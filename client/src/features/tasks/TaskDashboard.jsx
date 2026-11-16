import { useSelector } from 'react-redux';

export default function TaskDashboard() {
  const { stats } = useSelector((state) => state.tasks);

  const statCards = [
    { label: 'Total Tasks', value: stats.total, color: 'text-slate-900', bg: 'bg-white' },
    { label: 'To Do', value: stats.todo, color: 'text-indigo-600', bg: 'bg-white' },
    { label: 'In Progress', value: stats.inProgress, color: 'text-amber-600', bg: 'bg-white' },
    { label: 'Completed', value: stats.done, color: 'text-emerald-600', bg: 'bg-white' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
      {statCards.map((card) => (
        <div
          key={card.label}
          className={`${card.bg} rounded-xl border border-slate-200 p-4 shadow-xs`}
        >
          <p className="text-xs font-medium text-slate-500">{card.label}</p>
          <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
        </div>
      ))}
      {stats.overdue > 0 && (
        <div className="col-span-2 sm:col-span-4 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>You have <strong>{stats.overdue}</strong> overdue task{stats.overdue > 1 ? 's' : ''}!</span>
          </div>
        </div>
      )}
    </div>
  );
}
