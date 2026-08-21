import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import commentsReducer from "../features/comments/commentsSlice";
import profileReducer from "../features/profile/profileSlice";
import realtimeReducer from "../features/realtime/realtimeSlice";
import storiesReducer from "../features/stories/storiesSlice";
import themeReducer from "../features/theme/themeSlice";
import versionsReducer from "../features/versions/versionsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stories: storiesReducer,
    comments: commentsReducer,
    versions: versionsReducer,
    profile: profileReducer,
    realtime: realtimeReducer,
    theme: themeReducer,
  },
  // Redux DevTools are enabled by default in development by configureStore, which is
  // what the brief means by "Make use of Redux Dev Tools for testing your app".
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
