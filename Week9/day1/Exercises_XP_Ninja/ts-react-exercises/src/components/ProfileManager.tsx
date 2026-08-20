/**
 * Exercise (Set 3) 1: Managing User Profile with useReducer and TypeScript
 *
 * This component demonstrates:
 * - ProfileState as a discriminated union keyed on `status`, so TypeScript
 *   narrows what's guaranteed to exist: `state.profile` is only known to be
 *   non-null when `state.status === 'success'`.
 * - ProfileAction as a discriminated union switched over inside the reducer.
 */

import { useReducer, useState } from 'react';

interface ProfileData {
  name: string;
  bio: string;
}

type ProfileState =
  | { status: 'initial'; profile: null; error: null }
  | { status: 'loading'; profile: ProfileData | null; error: null }
  | { status: 'success'; profile: ProfileData; error: null }
  | { status: 'error'; profile: ProfileData | null; error: string };

type ProfileAction =
  | { type: 'START_UPDATE' }
  | { type: 'UPDATE_SUCCESS'; payload: ProfileData }
  | { type: 'UPDATE_ERROR'; payload: string };

const initialProfileState: ProfileState = {
  status: 'initial',
  profile: null,
  error: null,
};

function profileReducer(state: ProfileState, action: ProfileAction): ProfileState {
  switch (action.type) {
    case 'START_UPDATE':
      return { status: 'loading', profile: state.profile, error: null };
    case 'UPDATE_SUCCESS':
      return { status: 'success', profile: action.payload, error: null };
    case 'UPDATE_ERROR':
      return { status: 'error', profile: state.profile, error: action.payload };
    default:
      return state;
  }
}

function ProfileManager() {
  const [state, dispatch] = useReducer(profileReducer, initialProfileState);
  const [name, setName] = useState<string>('');
  const [bio, setBio] = useState<string>('');

  const handleSave = (): void => {
    dispatch({ type: 'START_UPDATE' });

    // Simulated async update — swap for a real API call.
    setTimeout(() => {
      if (!name.trim()) {
        dispatch({ type: 'UPDATE_ERROR', payload: 'Name cannot be empty.' });
        return;
      }
      dispatch({ type: 'UPDATE_SUCCESS', payload: { name, bio } });
    }, 500);
  };

  return (
    <div className="card">
      <div className="form-field">
        <label htmlFor="profile-name">Name</label>
        <input
          id="profile-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="form-field">
        <label htmlFor="profile-bio">Bio</label>
        <input id="profile-bio" value={bio} onChange={(event) => setBio(event.target.value)} />
      </div>

      <div className="button-row">
        <button type="button" onClick={handleSave} disabled={state.status === 'loading'}>
          {state.status === 'loading' ? 'Saving…' : 'Save profile'}
        </button>
      </div>

      <p>
        Status: <strong>{state.status}</strong>
      </p>
      {state.status === 'success' && (
        <p className="success-text">
          Saved: {state.profile.name} — {state.profile.bio || '(no bio)'}
        </p>
      )}
      {state.status === 'error' && <p className="error-text">{state.error}</p>}
    </div>
  );
}

export default ProfileManager;
