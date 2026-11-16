import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // Slices will be added per sprint (e.g. auth, tasks)
  },
});
