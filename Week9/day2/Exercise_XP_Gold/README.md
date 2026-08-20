# Exercise 1 — useForm: A Reusable Form Management Hook

## Running it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc -b && vite build
npm test          # vitest run
```

Try the registration form with `taken@example.com` to see the server-rejection path, or any
other valid-looking email to see the success path.

## What's here

- `src/useForm.ts` — the generic hook: `values`, `errors`, `touched`, `isSubmitting`,
  `submitError`, and `handleChange` / `handleBlur` / `handleSubmit`.
- `src/RegistrationForm.tsx` — email / password / confirm-password fields, using the hook.

## A real generic-constraint bug, caught by the build

The first version constrained the hook to `T extends Record<string, string>`, on the reasoning
that every form field's raw value is a string. It doesn't compile:

```
error TS2344: Type 'RegistrationValues' does not satisfy the constraint 'FormValues'.
  Index signature for type 'string' is missing in type 'RegistrationValues'.
```

`Record<string, string>` means "every possible string key maps to a string" — an index
signature, not just "these three named fields happen to be strings." A plain `interface` with
three named string fields and *no* index signature is not structurally assignable to that,
even though every field it does have really is a string. This is a genuine, common TypeScript
trap, not a hypothetical one: it's exactly the mistake it looks like it should be a shortcut for.

The fix: constrain to `T extends object` instead, and accept one necessary cast in
`handleChange`, documented at the point it happens — there is nothing in the DOM API connecting
an `<input name="email">`'s runtime string back to `keyof T`; that connection only exists by
convention at the JSX call site, and TypeScript can't verify a convention.

## Success criteria, addressed

| Criterion | Status |
|---|---|
| Hook properly manages form state with TypeScript types | `useForm<T extends object>`, typed return shape |
| Validation works for all required fields | Email format, password length, confirm-password match — all tested |
| Error messages display appropriately | Only shown once a field is `touched`, tested directly |
| Form submission handles both success and error cases | Success message and server-rejection message, both tested |
