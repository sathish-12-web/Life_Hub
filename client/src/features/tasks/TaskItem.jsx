import { useDispatch } from 'react-redux';
import { updateTask, deleteTask } from './tasksSlice';

const PRIORITY_STYLES = {
  LOW: 'bg-slate-100 text-slate-700 ring-slate-600/20',
  MEDIUM: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  HIGH: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  URGENT: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

const STATUS_LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
};

export default function TaskItem({ task, onEdit }) {
  const dispatch = useDispatch();
  const isDone = task.status === 'DONE';

  function handleToggleStatus() {
    const nextStatus = isDone ? 'TODO' : 'DONE';
    dispatch(updateTask({ id: task.id, status: nextStatus }));
  }

  function handleDelete() {
    if (window.confirm(`Delete task "${task.title}"?`)) {
      dispatch(deleteTask(task.id));
    }
  }

  const isOverdue = task.dueAt && !isDone && new Date(task.dueAt) < new Date();

  return (
    <div className={`group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all ${
      isDone
        ? 'bg-slate-50/70 border-slate-200 opacity-75'
        : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
    }`}>
      {/* Left section: Checkbox & Title */}
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <button
          type="button"
          onClick={handleToggleStatus}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
            isDone
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'border-slate-300 hover:border-indigo-500 bg-white'
          }`}
          aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isDone && (
            <svg className="h-3.5 w-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className={`text-sm font-semibold truncate ${
              isDone ? 'line-through text-slate-400' : 'text-slate-800'
            }`}>
              {task.title}
            </h4>

            {/* Priority Badge */}
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${
              PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM
            }`}>
              {task.priority}
            </span>

            {/* Status Badge (if not done) */}
            {!isDone && task.status !== 'TODO' && (
              <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700 ring-1 ring-inset ring-purple-600/20">
                {STATUS_LABELS[task.status] || task.status}
              </span>
            )}
          </div>

          {task.description && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta: Due Date & Tags */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            {task.dueAt && (
              <span className={`flex items-center gap-1 ${
                isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
              }`}>
                <span>📅</span>
                <span>{new Date(task.dueAt).toLocaleDateString()}</span>
                {isOverdue && <span className="text-[10px] bg-rose-50 px-1 rounded">(Overdue)</span>}
              </span>
            )}

            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                {task.tags.map((tag) => (
                  <span key={tag} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right section: Action Buttons */}
      <div className="mt-3 sm:mt-0 flex items-center justify-end gap-2 self-end sm:self-center">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
