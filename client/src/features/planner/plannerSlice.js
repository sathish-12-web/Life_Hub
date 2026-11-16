import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const fetchEvents = createAsyncThunk(
  'planner/fetchEvents',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.from) queryParams.append('from', params.from);
      if (params.to) queryParams.append('to', params.to);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const res = await api.get(`/events${qs}`);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch events');
    }
  }
);

export const createEvent = createAsyncThunk(
  'planner/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const res = await api.post('/events', eventData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create event');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'planner/updateEvent',
  async ({ id, ...changes }, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/events/${id}`, changes);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update event');
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'planner/deleteEvent',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/events/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete event');
    }
  }
);

const plannerSlice = createSlice({
  name: 'planner',
  initialState: {
    items: [],
    meta: {
      page: 1,
      limit: 50,
      total: 0,
      totalPages: 1,
    },
    loading: false,
    error: null,
  },
  reducers: {
    clearPlannerError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Event
      .addCase(createEvent.fulfilled, (state, action) => {
        state.items.push(action.payload);
        // keep sorted by startAt
        state.items.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
        state.meta.total += 1;
      })
      // Update Event
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.items.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
          state.items.sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
        }
      })
      // Delete Event
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e.id !== action.payload);
        state.meta.total = Math.max(0, state.meta.total - 1);
      });
  },
});

export const { clearPlannerError } = plannerSlice.actions;
export default plannerSlice.reducer;
