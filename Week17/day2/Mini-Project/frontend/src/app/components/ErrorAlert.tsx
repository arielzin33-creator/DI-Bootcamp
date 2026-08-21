/**
 * Shows an error coming back from the backend.
 *
 * The brief asks to "display both validation errors and errors received from the
 * backend", so this renders the top-level message plus any field-level details.
 */
interface ErrorAlertProps {
  message: string | null;
  fieldErrors?: Record<string, string> | null;
  onDismiss?: () => void;
}

export default function ErrorAlert({ message, fieldErrors, onDismiss }: ErrorAlertProps) {
  if (!message && !fieldErrors) return null;

  return (
    <div role="alert" className="alert alert-error my-4">
      <div className="flex-1">
        {message && <p className="font-semibold">{message}</p>}
        {fieldErrors && (
          <ul className="list-disc list-inside text-sm mt-1">
            {Object.entries(fieldErrors).map(([field, detail]) => (
              <li key={field}>{detail}</li>
            ))}
          </ul>
        )}
      </div>
      {onDismiss && (
        <button type="button" className="btn btn-sm btn-ghost" onClick={onDismiss}>
          Dismiss
        </button>
      )}
    </div>
  );
}
