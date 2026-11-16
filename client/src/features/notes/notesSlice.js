import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const fetchNotes = createAsyncThunk(
  'notes/fetchNotes',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.q) queryParams.append('q', params.q);
      if (params.tag) queryParams.append('tag', params.tag);
      if (params.archived) queryParams.append('archived', params.archived);
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.order) queryParams.append('order', params.order);

      const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const res = await api.get(`/notes${qs}`);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch notes');
    }
  }
);

export const createNote = createAsyncThunk(
  'notes/createNote',
  async (noteData, { rejectWithValue }) => {
    try {
      const res = await api.post('/notes', noteData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create note');
    }
  }
);

export const updateNote = createAsyncThunk(
  'notes/updateNote',
  async ({ id, ...changes }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/notes/${id}`, changes);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update note');
    }
  }
);

export const deleteNote = createAsyncThunk(
  'notes/deleteNote',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/notes/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete note');
    }
  }
);

export const archiveNote = createAsyncThunk(
  'notes/archiveNote',
  async ({ id, isArchived }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/notes/${id}`, { isArchived });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update note archive status');
    }
  }
);

const notesSlice = createSlice({
  name: 'notes',
  initialState: {
    items: [],
    meta: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    },
    searchQuery: '',
    selectedTag: '',
    archivedFilter: 'false', // 'false', 'true', or 'all'
    loading: false,
    error: null,
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedTag: (state, action) => {
      state.selectedTag = action.payload;
    },
    setArchivedFilter: (state, action) => {
      state.archivedFilter = action.payload;
    },
    clearNotesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Notes
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Note
      .addCase(createNote.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.meta.total += 1;
      })
      // Update Note
      .addCase(updateNote.fulfilled, (state, action) => {
        const index = state.items.findIndex((n) => n.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Archive Note
      .addCase(archiveNote.fulfilled, (state, action) => {
        const updated = action.payload;
        if (state.archivedFilter === 'false' && updated.archivedAt) {
          // If we're looking at active notes, remove the archived one
          state.items = state.items.filter((n) => n.id !== updated.id);
          state.meta.total = Math.max(0, state.meta.total - 1);
        } else if (state.archivedFilter === 'true' && !updated.archivedAt) {
          // If we're looking at archived notes, remove the unarchived one
          state.items = state.items.filter((n) => n.id !== updated.id);
          state.meta.total = Math.max(0, state.meta.total - 1);
        } else {
          const index = state.items.findIndex((n) => n.id === updated.id);
          if (index !== -1) {
            state.items[index] = updated;
          }
        }
      })
      // Delete Note
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n.id !== action.payload);
        state.meta.total = Math.max(0, state.meta.total - 1);
      });
  },
});

export const { setSearchQuery, setSelectedTag, setArchivedFilter, clearNotesError } =
  notesSlice.actions;
export default notesSlice.reducer;
