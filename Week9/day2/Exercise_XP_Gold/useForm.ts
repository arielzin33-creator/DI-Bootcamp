import { useState } from 'react';
import type { ChangeEvent, FocusEvent, FormEvent } from 'react';

/** A partial record: only fields that currently have an error appear here. */
export type FormErrors<T> = Partial<Record<keyof T, string>>;
type TouchedFields<T> = Partial<Record<keyof T, boolean>>;

interface UseFormOptions<T extends object> {
  initialValues: T;
  /** Pure function: given the current values, returns the current errors. */
  validate: (values: T) => FormErrors<T>;
  /** May reject — a failed submission surfaces as `submitError`, not a thrown exception. */
  onSubmit: (values: T) => void | Promise<void>;
}

interface UseFormReturn<T extends object> {
  values: T;
  errors: FormErrors<T>;
  touched: TouchedFields<T>;
  isSubmitting: boolean;
  submitError: string | null;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (event: FocusEvent<HTMLInputElement>) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function useForm<T extends object>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<TouchedFields<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // The cast is the one necessary escape hatch here: an HTML input's
    // `name` attribute is always a plain `string` at the type level, and
    // there is nothing in the DOM API connecting it back to `keyof T` —
    // that connection only exists by convention, at the JSX call site,
    // where the caller writes `name="email"` to match a real field of `T`.
    // TypeScript can't verify that convention was followed; the cast says
    // "the caller is responsible for keeping `name` attributes in sync
    // with the fields of `T`," which `RegistrationForm` does.
    setValues((previous) => ({ ...previous, [name]: value }) as T);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const { name } = event.target;
    setTouched((previous) => ({ ...previous, [name]: true }));
    // Re-validate on blur so an error clears as soon as a field is fixed,
    // rather than only ever being (re)checked on submit.
    setErrors(validate(values));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);

    const allFieldNames = Object.keys(values) as Array<keyof T>;
    setTouched(
      allFieldNames.reduce<TouchedFields<T>>((accumulated, field) => {
        accumulated[field] = true;
        return accumulated;
      }, {}),
    );

    if (Object.keys(validationErrors).length > 0) {
      return; // Do not attempt to submit while any field is invalid.
    }

    setSubmitError(null);
    setIsSubmitting(true);

    Promise.resolve(onSubmit(values))
      .catch((error: unknown) => {
        setSubmitError(error instanceof Error ? error.message : 'Something went wrong.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return { values, errors, touched, isSubmitting, submitError, handleChange, handleBlur, handleSubmit };
}
