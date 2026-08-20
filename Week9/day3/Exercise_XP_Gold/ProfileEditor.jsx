import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../features/auth/selectors';
import { setUser } from '../features/auth/authSlice';

export default function ProfileEditor() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [name, setName] = useState(user?.name ?? '');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch(setUser({ name: trimmed }));
  };

  return (
    <form className="profile-editor" onSubmit={handleSubmit}>
      <label className="profile-editor__label" htmlFor="display-name">
        Display name
      </label>
      <input
        id="display-name"
        className="profile-editor__input"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit" className="profile-editor__submit">
        Save
      </button>
    </form>
  );
}
