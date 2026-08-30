import { useForm } from '../hooks/useForm'

interface RegistrationValues {
  email: string
  password: string
  confirmPassword: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values: RegistrationValues): Partial<Record<keyof RegistrationValues, string>> {
  const errors: Partial<Record<keyof RegistrationValues, string>> = {}

  if (!values.email) {
    errors.email = 'Email is required.'
  } else if (!EMAIL_REGEX.test(values.email)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

function fakeRegister(values: RegistrationValues): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (values.email.endsWith('@blocked.com')) {
        reject(new Error('That email domain is not allowed.'))
      } else {
        resolve()
      }
    }, 500)
  })
}

function RegistrationForm() {
  const { values, errors, submitStatus, handleChange, handleSubmit, reset } =
    useForm<RegistrationValues>({
      initialValues: { email: '', password: '', confirmPassword: '' },
      validate,
    })

  return (
    <form className="registration-form" onSubmit={handleSubmit(fakeRegister)} noValidate>
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" value={values.email} onChange={handleChange} />
        {errors.email && <p className="field-error">{errors.email}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
        />
        {errors.password && <p className="field-error">{errors.password}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={submitStatus === 'submitting'}>
          {submitStatus === 'submitting' ? 'Registering…' : 'Register'}
        </button>
        <button type="button" onClick={reset}>
          Reset
        </button>
      </div>

      {submitStatus === 'success' && (
        <p className="form-status success">Registration successful!</p>
      )}
      {submitStatus === 'error' && Object.keys(errors).length === 0 && (
        <p className="form-status error">Registration failed. Try a different email.</p>
      )}
    </form>
  )
}

export default RegistrationForm
