import { useReducer, useState, type FormEvent } from 'react'
import { profileReducer, initialProfileState } from '../reducers/profileReducer'

function ProfileManager() {
  const [state, dispatch] = useReducer(profileReducer, initialProfileState)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    dispatch({ type: 'LOAD_START' })

    setTimeout(() => {
      if (!name.trim()) {
        dispatch({ type: 'LOAD_ERROR', payload: 'Name is required to update the profile.' })
        return
      }
      dispatch({ type: 'LOAD_SUCCESS', payload: { name, bio } })
    }, 600)
  }

  return (
    <div className="profile-manager">
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="profile-name">Name</label>
          <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="profile-bio">Bio</label>
          <input id="profile-bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <button type="submit" disabled={state.status === 'loading'}>
          {state.status === 'loading' ? 'Saving…' : 'Save Profile'}
        </button>
      </form>

      <div className="profile-status">
        {state.status === 'initial' && <p className="status-message">No profile saved yet.</p>}
        {state.status === 'loading' && <p className="status-message">Updating profile…</p>}
        {state.status === 'success' && state.profile && (
          <p className="status-message success">
            Saved! {state.profile.name} — {state.profile.bio || 'no bio'}
          </p>
        )}
        {state.status === 'error' && <p className="status-message error">{state.error}</p>}
      </div>
    </div>
  )
}

export default ProfileManager
