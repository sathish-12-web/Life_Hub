import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTasks, fetchTaskStats, setFilterStatus } from './tasksSlice';
import TaskItem from './TaskItem';
import TaskModal from './TaskModal';
import TaskDashboard from './TaskDashboard';

const FILTER_TABS = [
  { id: 'ALL', label: 'All Tasks' },
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'DONE', label: 'Completed' },
];

export default function TaskList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const dispatch = useDispatch();
  const { items, meta, filterStatus, loading, error } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchTasks({ status: filterStatus, page: meta.page }));
    dispatch(fetchTaskStats());
  }, [dispatch, filterStatus, meta.page]);

  function handleTabChange(tabId) {
    dispatch(setFilterStatus(tabId));
  }

  function handleOpenCreate() {
    setEditingTask(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(task) {
    setEditingTask(task);
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Metrics */}
      <TaskDashboard />

      {/* Action Header & Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-1 overflow-x-auto">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`py-1.5 px-3 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                  filterStatus === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* New Task Button */}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors shrink-0"
          >
            <span>+</span>
            <span>New Task</span>
          </button>
        </div>

        {/* Error message if any */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200">
            {error}
          </div>
        )}

        {/* Task Items List */}
        <div className="space-y-2.5 pt-2">
          {loading && items.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-r-transparent mr-2" />
              Loading tasks...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
              <p className="text-sm font-semibold text-slate-700">No tasks found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {filterStatus === 'ALL'
                  ? 'Your workspace is clear! Click "+ New Task" above to organize your day.'
                  : `You have no tasks marked as "${filterStatus}".`}
              </p>
            </div>
          ) : (
            items.map((task) => (
              <TaskItem key={task.id} task={task} onEdit={handleOpenEdit} />
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Page {meta.page} of {meta.totalPages} ({meta.total} tasks)
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={meta.page <= 1}
                onClick={() => dispatch(fetchTasks({ status: filterStatus, page: meta.page - 1 }))}
                className="rounded-md border border-slate-200 px-2.5 py-1 text-xs disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={meta.page >= meta.totalPages}
                onClick={() => dispatch(fetchTasks({ status: filterStatus, page: meta.page + 1 }))}
                className="rounded-md border border-slate-200 px-2.5 py-1 text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingTask}
      />
    </div>
  );
}
