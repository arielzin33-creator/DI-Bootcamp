import { useState, type ChangeEvent, type FormEvent } from 'react'

type FormErrors<T> = Partial<Record<keyof T, string>>

interface UseFormConfig<T> {
  initialValues: T
  validate: (values: T) => FormErrors<T>
}

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

export function useForm<T extends object>({
  initialValues,
  validate,
}: UseFormConfig<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors<T>>({})
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit =
    (onSubmit: (values: T) => void | Promise<void>) =>
    async (event: FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault()

      const validationErrors = validate(values)
      setErrors(validationErrors)

      if (Object.keys(validationErrors).length > 0) {
        setSubmitStatus('error')
        return
      }

      setSubmitStatus('submitting')
      try {
        await onSubmit(values)
        setSubmitStatus('success')
      } catch {
        setSubmitStatus('error')
      }
    }

  const reset = (): void => {
    setValues(initialValues)
    setErrors({})
    setSubmitStatus('idle')
  }

  return { values, errors, submitStatus, handleChange, handleSubmit, reset }
}
