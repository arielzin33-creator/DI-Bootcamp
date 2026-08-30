import React from "react";


const FormComponent = ({ formData, handleChange, handleSubmit }) => {
  const { firstName, lastName, age, gender, destination, lactoseFree } =
    formData;

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="firstName">First name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={firstName}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label htmlFor="lastName">Last name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={lastName}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            value={age}
            onChange={handleChange}
          />
        </div>

        <fieldset className="form-row">
          <legend>Gender</legend>
          <label>
            <input
              type="radio"
              name="gender"
              value="male"
              checked={gender === "male"}
              onChange={handleChange}
            />
            Male
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="female"
              checked={gender === "female"}
              onChange={handleChange}
            />
            Female
          </label>
        </fieldset>

        <div className="form-row">
          <label htmlFor="destination">Destination</label>
          <select
            id="destination"
            name="destination"
            value={destination}
            onChange={handleChange}
          >
            <option value="">Select a destination</option>
            <option value="Japan">Japan</option>
            <option value="France">France</option>
            <option value="Italy">Italy</option>
            <option value="Canada">Canada</option>
          </select>
        </div>

        <div className="form-row">
          <label>
            <input
              type="checkbox"
              name="lactoseFree"
              checked={lactoseFree}
              onChange={handleChange}
            />
            Lactose free
          </label>
        </div>

        <button type="submit">Submit</button>
      </form>

      {/* Live readout of the values currently held in state, so the
          entered data is visibly reflected as the user types. */}
      <div className="form-values">
        <h3>Current values</h3>
        <ul>
          <li>First name : {firstName}</li>
          <li>Last name : {lastName}</li>
          <li>Age : {age}</li>
          <li>Gender : {gender}</li>
          <li>Destination : {destination}</li>
          <li>Lactose free : {lactoseFree ? "on" : "off"}</li>
        </ul>
      </div>
    </div>
  );
};

export default FormComponent;
