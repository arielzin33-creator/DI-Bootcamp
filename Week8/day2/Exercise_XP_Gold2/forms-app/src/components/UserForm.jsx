import React, { useState } from "react";

const initialState = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
};

function UserForm() {
  const [user, setUser] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!user.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    if (!user.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

    if (!user.phone.trim() || isNaN(user.phone)) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    if (!/^\S+@\S+\.\S+$/.test(user.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validate()) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setUser(initialState);
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className="user-form">
      {submitted ? (
        <div className="user-form__summary">
          <h2>User Details</h2>
          <p>
            <strong>First name:</strong> {user.firstName}
          </p>
          <p>
            <strong>Last name:</strong> {user.lastName}
          </p>
          <p>
            <strong>Phone:</strong> {user.phone}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <button onClick={handleReset}>Reset</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="firstName"
            value={user.firstName}
            onChange={handleChange}
            placeholder="First name"
          />
          {errors.firstName && <p className="user-form__error">{errors.firstName}</p>}

          <input
            type="text"
            name="lastName"
            value={user.lastName}
            onChange={handleChange}
            placeholder="Last name"
          />
          {errors.lastName && <p className="user-form__error">{errors.lastName}</p>}

          <input
            type="text"
            name="phone"
            value={user.phone}
            onChange={handleChange}
            placeholder="Phone"
          />
          {errors.phone && <p className="user-form__error">{errors.phone}</p>}

          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            placeholder="Email"
          />
          {errors.email && <p className="user-form__error">{errors.email}</p>}

          <button type="submit">Submit</button>
          <button type="button" onClick={handleReset}>
            Reset
          </button>
        </form>
      )}
    </div>
  );
}

export default UserForm;
