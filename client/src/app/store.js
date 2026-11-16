import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import tasksReducer from '../features/tasks/tasksSlice';
import plannerReducer from '../features/planner/plannerSlice';
import expensesReducer from '../features/expenses/expensesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    planner: plannerReducer,
    expenses: expensesReducer,
  },
});
