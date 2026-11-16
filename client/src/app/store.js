import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import tasksReducer from '../features/tasks/tasksSlice';
import plannerReducer from '../features/planner/plannerSlice';
import expensesReducer from '../features/expenses/expensesSlice';
import notesReducer from '../features/notes/notesSlice';
import captureReducer from '../features/capture/captureSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    planner: plannerReducer,
    expenses: expensesReducer,
    notes: notesReducer,
    capture: captureReducer,
  },
});
