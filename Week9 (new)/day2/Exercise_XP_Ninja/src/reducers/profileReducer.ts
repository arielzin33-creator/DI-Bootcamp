export interface Profile {
  name: string
  bio: string
}

export type ProfileStatus = 'initial' | 'loading' | 'success' | 'error'

export interface ProfileState {
  status: ProfileStatus
  profile: Profile | null
  error: string | null
}

export type ProfileAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: Profile }
  | { type: 'LOAD_ERROR'; payload: string }

export const initialProfileState: ProfileState = {
  status: 'initial',
  profile: null,
  error: null,
}

export function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', error: null }
    case 'LOAD_SUCCESS':
      return { status: 'success', profile: action.payload, error: null }
    case 'LOAD_ERROR':
      return { ...state, status: 'error', error: action.payload }
    default:
      return state
  }
}
