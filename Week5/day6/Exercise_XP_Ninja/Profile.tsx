// src/components/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { logout, updateProfile } from '../features/auth/authSlice';

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, isAuthenticated, status, error } = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState(user?.name ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [isEditing, setIsEditing] = useState(false);

  // Redirect to login if not authenticated (e.g. direct URL access, or after logout)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return null; // brief flash before the redirect effect fires
  }

  const handleLogout = (): void => {
    dispatch(logout());
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    dispatch(updateProfile({ name, bio })).then((result) => {
      if (updateProfile.fulfilled.match(result)) {
        setIsEditing(false);
      }
    });
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', textAlign: 'center' }}>
      <h2>Profile</h2>

      {!isEditing ? (
        <>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Bio:</strong> {user.bio}</p>

          <button onClick={() => setIsEditing(true)} style={{ marginRight: '10px' }}>
            Edit Profile
          </button>
          <button onClick={handleLogout}>Log Out</button>
        </>
      ) : (
        <form onSubmit={handleSave}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
          />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio"
            style={{ display: 'block', width: '100%', marginBottom: '10px', padding: '8px' }}
          />

          <button type="submit" disabled={status === 'loading'} style={{ marginRight: '10px' }}>
            {status === 'loading' ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => setIsEditing(false)}>
            Cancel
          </button>

          {error && <p style={{ color: 'red' }}>{error}</p>}
        </form>
      )}
    </div>
  );
};

export default Profile;