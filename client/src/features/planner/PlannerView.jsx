import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEvents } from './plannerSlice';
import EventItem from './EventItem';
import EventModal from './EventModal';

export default function PlannerView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.planner);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  function handleOpenCreate() {
    setEditingEvent(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(event) {
    setEditingEvent(event);
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Calendar Agenda & Schedule</h3>
            <p className="text-xs text-slate-500">Plan upcoming meetings, deadlines, and personal milestones.</p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors shrink-0"
          >
            <span>+</span>
            <span>New Event</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {error}
          </div>
        )}

        {/* Event Items */}
        <div className="space-y-2.5 pt-2">
          {loading && items.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-r-transparent mr-2" />
              Loading schedule...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
              <p className="text-sm font-semibold text-slate-700">No scheduled events</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Keep your calendar updated. Click "+ New Event" to schedule meetings, deadlines, or personal events.
              </p>
            </div>
          ) : (
            items.map((event) => (
              <EventItem key={event.id} event={event} onEdit={handleOpenEdit} />
            ))
          )}
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingEvent}
      />
    </div>
  );
}
