import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';
import communityReducer from './slices/communitySlice';
import profileReducer from './slices/profileSlice';
import calendarReducer from './slices/calendarSlice';
import dashboardReducer from './slices/dashboardSlice';
import activityReducer from './slices/activitySlice';
import sessionsReducer from './slices/sessionSlice'
import announcementReducer from './slices/announcementSlice'
import videoReducer from './slices/videoSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
    community: communityReducer,  
    announcements: announcementReducer,
    profile: profileReducer,
    calendar: calendarReducer,
    dashboard: dashboardReducer,
    activity: activityReducer,
    session: sessionsReducer,
    videos: videoReducer ,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;