import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { fetchTasks } from '../tasks/tasksSlice';
import { fetchEvents } from '../planner/plannerSlice';
import { fetchTransactions, fetchSummary } from '../expenses/expensesSlice';
import { fetchNotes } from '../notes/notesSlice';

export const previewCapture = createAsyncThunk(
  'capture/previewCapture',
  async (text, { rejectWithValue }) => {
    try {
      const res = await api.post('/capture/preview', { text });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to parse text preview');
    }
  }
);

export const confirmCapture = createAsyncThunk(
  'capture/confirmCapture',
  async ({ type, data }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post('/capture/confirm', { type, data });

      // Refresh the corresponding module store
      if (type === 'TASK') dispatch(fetchTasks());
      else if (type === 'EVENT') dispatch(fetchEvents());
      else if (type === 'TRANSACTION') {
        dispatch(fetchTransactions());
        dispatch(fetchSummary());
      } else if (type === 'NOTE') dispatch(fetchNotes());

      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to save captured item');
    }
  }
);

const captureSlice = createSlice({
  name: 'capture',
  initialState: {
    previewData: null,
    isPreviewOpen: false,
    loading: false,
    error: null,
  },
  reducers: {
    closePreview: (state) => {
      state.isPreviewOpen = false;
      state.previewData = null;
      state.error = null;
    },
    updatePreviewType: (state, action) => {
      if (state.previewData) {
        state.previewData.detectedType = action.payload;
      }
    },
    updatePreviewField: (state, action) => {
      const { field, value } = action.payload;
      if (state.previewData && state.previewData.data) {
        state.previewData.data[field] = value;
      }
    },
    clearCaptureError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Preview
      .addCase(previewCapture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(previewCapture.fulfilled, (state, action) => {
        state.loading = false;
        state.previewData = action.payload;
        state.isPreviewOpen = true;
      })
      .addCase(previewCapture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Confirm
      .addCase(confirmCapture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmCapture.fulfilled, (state) => {
        state.loading = false;
        state.isPreviewOpen = false;
        state.previewData = null;
      })
      .addCase(confirmCapture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { closePreview, updatePreviewType, updatePreviewField, clearCaptureError } =
  captureSlice.actions;
export default captureSlice.reducer;
