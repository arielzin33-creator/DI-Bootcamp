/**
 * Exercise (Set 2) 1: Registration form built on top of useForm.
 *
 * Demonstrates validation for an email field and a password field
 * (plus a confirm-password check), with typed error messages keyed
 * by RegistrationValues.
 */

import useForm from '../hooks/useForm';

interface RegistrationValues {
  [key: string]: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegistration(
  values: RegistrationValues
): Partial<Record<keyof RegistrationValues, string>> {
  const errors: Partial<Record<keyof RegistrationValues, string>> = {};

  if (!values.email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

function RegistrationForm() {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    submitSuccess,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useForm<RegistrationValues>({
    initialValues: { email: '', password: '', confirmPassword: '' },
    validate: validateRegistration,
    onSubmit: async (submittedValues) => {
      // Simulated network request — replace with a real API call.
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('Registered:', submittedValues.email);
    },
  });

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      <h2>Register</h2>

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.email && errors.email && <p className="error-text">{errors.email}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.password && errors.password && (
          <p className="error-text">{errors.password}</p>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="confirmPassword">Confirm password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.confirmPassword && errors.confirmPassword && (
          <p className="error-text">{errors.confirmPassword}</p>
        )}
      </div>

      {submitError && <p className="error-text">{submitError}</p>}
      {submitSuccess && <p className="success-text">Registration succeeded.</p>}

      <div className="button-row">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting…' : 'Register'}
        </button>
        <button type="button" onClick={resetForm}>
          Reset
        </button>
      </div>
    </form>
  );
}

export default RegistrationForm;
