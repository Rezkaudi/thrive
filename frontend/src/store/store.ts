import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';
import communityReducer from './slices/communitySlice';
import profileReducer from './slices/profileSlice';
import calendarReducer from './slices/calendarSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
    community: communityReducer,
    profile: profileReducer,
    calendar: calendarReducer,
    dashboard: dashboardReducer,

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;