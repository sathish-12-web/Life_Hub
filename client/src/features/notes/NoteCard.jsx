export default function NoteCard({ note, onEdit, onDelete, onArchiveToggle, onSelectTag }) {
  const isArchived = Boolean(note.archivedAt);

  const formattedDate = note.updatedAt
    ? new Date(note.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div
      className={`flex flex-col justify-between p-5 bg-white rounded-xl border transition-all ${
        isArchived
          ? 'border-slate-200 bg-slate-50/50 opacity-80'
          : 'border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-sm'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-850 line-clamp-1">{note.title}</h4>
          {isArchived && (
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
              Archived
            </span>
          )}
        </div>

        <p className="mt-2 text-xs text-slate-600 whitespace-pre-wrap line-clamp-4 leading-relaxed font-normal">
          {note.body || <span className="italic text-slate-400">Empty note</span>}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2.5">
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => onSelectTag?.(tag)}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px]">{formattedDate}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onArchiveToggle(note.id, !isArchived)}
              className="text-slate-500 hover:text-slate-800 transition-colors"
              title={isArchived ? 'Restore Note' : 'Archive Note'}
            >
              {isArchived ? 'Restore' : 'Archive'}
            </button>
            <button
              type="button"
              onClick={() => onEdit(note)}
              className="text-slate-500 hover:text-indigo-600 transition-colors"
              title="Edit Note"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(note.id)}
              className="text-rose-400 hover:text-rose-600 transition-colors"
              title="Delete Note"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
