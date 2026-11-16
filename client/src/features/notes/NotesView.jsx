import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotes,
  deleteNote,
  archiveNote,
  setSearchQuery,
  setSelectedTag,
  setArchivedFilter,
  clearNotesError,
} from './notesSlice';
import NoteCard from './NoteCard';
import NoteModal from './NoteModal';

export default function NotesView() {
  const dispatch = useDispatch();
  const { items, meta, loading, error, searchQuery, selectedTag, archivedFilter } = useSelector(
    (state) => state.notes
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    dispatch(
      fetchNotes({
        page: currentPage,
        limit: 12,
        q: searchQuery.trim() || undefined,
        tag: selectedTag || undefined,
        archived: archivedFilter,
        sort: 'updatedAt',
        order: 'desc',
      })
    );
  }, [dispatch, currentPage, searchQuery, selectedTag, archivedFilter]);

  function handleOpenCreate() {
    setEditingNote(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(note) {
    setEditingNote(note);
    setIsModalOpen(true);
  }

  async function handleDelete(id) {
    if (window.confirm('Are you sure you want to delete this note permanently?')) {
      await dispatch(deleteNote(id));
    }
  }

  async function handleArchiveToggle(id, isArchived) {
    await dispatch(archiveNote({ id, isArchived }));
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Notes & Ideas</h2>
          <p className="text-xs text-slate-500">
            Organize thoughts, outlines, snippets, and project ideas with tags and search.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors shrink-0"
        >
          <span className="text-sm font-bold">+</span>
          <span>New Note</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => dispatch(clearNotesError())}
            className="text-rose-500 hover:text-rose-700 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {/* Active vs Archived Tabs */}
        <div className="flex rounded-lg bg-slate-100 p-0.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              dispatch(setArchivedFilter('false'));
              setCurrentPage(1);
            }}
            className={`py-1 px-3 text-xs font-medium rounded-md transition-all ${
              archivedFilter === 'false' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Active Notes
          </button>
          <button
            type="button"
            onClick={() => {
              dispatch(setArchivedFilter('true'));
              setCurrentPage(1);
            }}
            className={`py-1 px-3 text-xs font-medium rounded-md transition-all ${
              archivedFilter === 'true' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Archived
          </button>
          <button
            type="button"
            onClick={() => {
              dispatch(setArchivedFilter('all'));
              setCurrentPage(1);
            }}
            className={`py-1 px-3 text-xs font-medium rounded-md transition-all ${
              archivedFilter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            All
          </button>
        </div>

        {/* Search Input & Tag Filter Indicator */}
        <div className="flex items-center gap-2">
          {selectedTag && (
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg border border-indigo-100">
              <span>#{selectedTag}</span>
              <button
                type="button"
                onClick={() => dispatch(setSelectedTag(''))}
                className="text-indigo-400 hover:text-indigo-800 font-bold"
                title="Clear tag filter"
              >
                &times;
              </button>
            </div>
          )}

          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => {
              dispatch(setSearchQuery(e.target.value));
              setCurrentPage(1);
            }}
            className="w-full sm:w-56 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Notes Grid with Loading, Empty & Error states */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent" />
          <p className="mt-2 text-xs text-slate-500">Loading your notes...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 p-6">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 font-bold mb-2">
            ✎
          </div>
          <h4 className="text-sm font-semibold text-slate-700">No notes found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || selectedTag || archivedFilter === 'true'
              ? 'No notes matched your search query or filter.'
              : 'Create your first note or capture an idea to get started.'}
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            + Create First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onArchiveToggle={handleArchiveToggle}
              onSelectTag={(tag) => dispatch(setSelectedTag(tag))}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Showing page <span className="font-semibold text-slate-700">{meta.page}</span> of{' '}
            <span className="font-semibold text-slate-700">{meta.totalPages}</span> ({meta.total} total)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= meta.totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Note Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        noteToEdit={editingNote}
      />
    </div>
  );
}
