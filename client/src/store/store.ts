import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { ModalDisplaySlice } from './features/modalDisplaySlice'
import { ModalContentSlice } from './features/modalContentSlice'
import { AlertSlice } from './features/alertSlice'
import { ChatListSlice } from './features/chatListSlice'
import { CreatorModalSlice } from './features/creatorModalSlice'
import { ManualModalSlice } from './features/manualModalSlice'
import { VideoModalSlice } from './features/videoModalSlice'
import { SurveyModalSlice } from './features/surveyModalSlice'
import { MyStreamSlice } from './features/myStreamSlice'

export const store = configureStore({
  reducer: {
    modalDisplay: ModalDisplaySlice.reducer,
    modalContent: ModalContentSlice.reducer,
    alert: AlertSlice.reducer,
    chatList: ChatListSlice.reducer,
    creatorModal: CreatorModalSlice.reducer,
    manualModal: ManualModalSlice.reducer,
    surveyModal: SurveyModalSlice.reducer,
    videoModal: VideoModalSlice.reducer,
    myStream: MyStreamSlice.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})

export const useAppDispatch: () => typeof store.dispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<
  ReturnType<typeof store.getState>
> = useSelector
