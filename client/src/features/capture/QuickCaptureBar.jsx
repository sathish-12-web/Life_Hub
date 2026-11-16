import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { previewCapture } from './captureSlice';

export default function QuickCaptureBar() {
  const [text, setText] = useState('');
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.capture);

  async function handleCapture(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    await dispatch(previewCapture(trimmed));
    setText('');
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-indigo-100 shadow-xs p-2 sm:p-2.5 transition-all focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
      <form onSubmit={handleCapture} className="flex items-center gap-2">
        <div className="flex items-center justify-center pl-2 text-indigo-500 font-bold text-sm shrink-0">
          ⚡
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Quick capture: 'Dentist at 2pm on Friday', 'Spent $25 on groceries', 'Call client tomorrow #urgent'..."
          className="flex-1 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent border-none focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="shrink-0 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Parsing...' : 'Capture'}
        </button>
      </form>
    </div>
  );
}
