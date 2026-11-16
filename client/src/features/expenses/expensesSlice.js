import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../services/api';

const now = new Date();
const defaultMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;

export const fetchTransactions = createAsyncThunk(
  'expenses/fetchTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.type) queryParams.append('type', params.type);
      if (params.category) queryParams.append('category', params.category);
      if (params.from) queryParams.append('from', params.from);
      if (params.to) queryParams.append('to', params.to);
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.order) queryParams.append('order', params.order);

      const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const res = await api.get(`/transactions${qs}`);
      return res;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch transactions');
    }
  }
);

export const fetchSummary = createAsyncThunk(
  'expenses/fetchSummary',
  async (month = '', { rejectWithValue }) => {
    try {
      const qs = month ? `?month=${month}` : '';
      const res = await api.get(`/transactions/summary${qs}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch financial summary');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'expenses/createTransaction',
  async (transactionData, { rejectWithValue, dispatch, getState }) => {
    try {
      const res = await api.post('/transactions', transactionData);
      const { selectedMonth } = getState().expenses;
      dispatch(fetchSummary(selectedMonth));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create transaction');
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'expenses/updateTransaction',
  async ({ id, ...changes }, { rejectWithValue, dispatch, getState }) => {
    try {
      const res = await api.patch(`/transactions/${id}`, changes);
      const { selectedMonth } = getState().expenses;
      dispatch(fetchSummary(selectedMonth));
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update transaction');
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'expenses/deleteTransaction',
  async (id, { rejectWithValue, dispatch, getState }) => {
    try {
      await api.delete(`/transactions/${id}`);
      const { selectedMonth } = getState().expenses;
      dispatch(fetchSummary(selectedMonth));
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete transaction');
    }
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState: {
    items: [],
    meta: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
    },
    summary: {
      month: defaultMonth,
      totalIncome: 0,
      totalExpense: 0,
      netBalance: 0,
      categoryBreakdown: [],
    },
    selectedMonth: defaultMonth,
    loading: false,
    summaryLoading: false,
    error: null,
  },
  reducers: {
    setSelectedMonth: (state, action) => {
      state.selectedMonth = action.payload;
    },
    clearExpensesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Summary
      .addCase(fetchSummary.pending, (state) => {
        state.summaryLoading = true;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchSummary.rejected, (state) => {
        state.summaryLoading = false;
      })
      // Create Transaction
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.meta.total += 1;
      })
      // Update Transaction
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete Transaction
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload);
        state.meta.total = Math.max(0, state.meta.total - 1);
      });
  },
});

export const { setSelectedMonth, clearExpensesError } = expensesSlice.actions;
export default expensesSlice.reducer;
