import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status && params.status !== 'ALL') queryParams.append('status', params.status);
      if (params.priority) queryParams.append('priority', params.priority);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const res = await api.get(`/tasks${qs}`);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchTaskStats = createAsyncThunk(
  'tasks/fetchTaskStats',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/tasks/stats');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch stats');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.post('/tasks', taskData);
      dispatch(fetchTaskStats());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, ...changes }, { dispatch, rejectWithValue }) => {
    try {
      const res = await api.patch(`/tasks/${id}`, changes);
      dispatch(fetchTaskStats());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { dispatch, rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${id}`);
      dispatch(fetchTaskStats());
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete task');
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    stats: {
      total: 0,
      todo: 0,
      inProgress: 0,
      done: 0,
      cancelled: 0,
      overdue: 0,
    },
    meta: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    },
    filterStatus: 'ALL',
    loading: false,
    error: null,
  },
  reducers: {
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Stats
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Create Task
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.meta.total += 1;
      })
      // Update Task
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete Task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
        state.meta.total = Math.max(0, state.meta.total - 1);
      });
  },
});

export const { setFilterStatus, clearTaskError } = tasksSlice.actions;
export default tasksSlice.reducer;
