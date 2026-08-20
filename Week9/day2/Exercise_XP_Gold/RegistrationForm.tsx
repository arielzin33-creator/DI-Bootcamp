import { useState } from 'react';
import { useForm, type FormErrors } from './useForm';

interface RegistrationValues {
  email: string;
  password: string;
  confirmPassword: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegistration(values: RegistrationValues): FormErrors<RegistrationValues> {
  const errors: FormErrors<RegistrationValues> = {};

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

// Simulates a server call: rejects for one specific email (exercising the
// `submitError` path — a submission that reaches the server and is
// refused, distinct from a *validation* error that never leaves the form),
// resolves for every other valid input.
async function registerOnServer(values: RegistrationValues): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (values.email === 'taken@example.com') {
    throw new Error('An account with this email already exists.');
  }
}

export default function RegistrationForm() {
  const [isRegistered, setIsRegistered] = useState(false);

  const { values, errors, touched, isSubmitting, submitError, handleChange, handleBlur, handleSubmit } =
    useForm<RegistrationValues>({
      initialValues: { email: '', password: '', confirmPassword: '' },
      validate: validateRegistration,
      onSubmit: async (submittedValues) => {
        await registerOnServer(submittedValues);
        setIsRegistered(true);
      },
    });

  if (isRegistered) {
    return <p className="form__success">Account created for {values.email}.</p>;
  }

  return (
    <form className="registration-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" value={values.email} onChange={handleChange} onBlur={handleBlur} />
        {touched.email && errors.email && <p className="field__error">{errors.email}</p>}
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.password && errors.password && <p className="field__error">{errors.password}</p>}
      </div>

      <div className="field">
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
          <p className="field__error">{errors.confirmPassword}</p>
        )}
      </div>

      {submitError && (
        <p className="form__error" role="alert">
          {submitError}
        </p>
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>

      <p className="form__hint">Try "taken@example.com" to see a server-rejection error.</p>
    </form>
  );
}
