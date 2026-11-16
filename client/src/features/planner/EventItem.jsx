import { useDispatch } from 'react-redux';
import { deleteEvent } from './plannerSlice';

export default function EventItem({ event, onEdit }) {
  const dispatch = useDispatch();

  function handleDelete() {
    if (window.confirm(`Delete event "${event.title}"?`)) {
      dispatch(deleteEvent(event.id));
    }
  }

  const startDate = new Date(event.startAt);
  const endDate = new Date(event.endAt);

  const startTimeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTimeStr = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-all">
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-2 text-center shrink-0 w-16">
          <p className="text-[10px] font-bold text-indigo-700 uppercase">
            {startDate.toLocaleDateString([], { weekday: 'short' })}
          </p>
          <p className="text-base font-extrabold text-indigo-950">
            {startDate.getDate()}
          </p>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-800 truncate">
              {event.title}
            </h4>

            {event.recurrenceRule && (
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                🔄 {event.recurrenceRule}
              </span>
            )}
          </div>

          <p className="text-xs font-medium text-slate-500 mt-1">
            🕒 {startTimeStr} – {endTimeStr}
          </p>

          {event.description && (
            <p className="mt-1 text-xs text-slate-500 line-clamp-2">
              {event.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 sm:mt-0 flex items-center justify-end gap-2 self-end sm:self-center">
        <button
          type="button"
          onClick={() => onEdit(event)}
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
