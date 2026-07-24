"use client";

import { useActionState } from "react";
import type { AuthFormState } from "@/lib/definitions";

type Props = {
  mode: "login" | "signup";
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  next?: string;
};

export default function AuthForm({ mode, action, next }: Props) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    action,
    null
  );

  return (
    <form action={formAction} noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {state?.error ? <div className="form-error">{state.error}</div> : null}

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={state?.fieldErrors?.email ? true : undefined}
        />
        {state?.fieldErrors?.email ? (
          <span className="field-error">{state.fieldErrors.email[0]}</span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={
            mode === "login" ? "current-password" : "new-password"
          }
          minLength={8}
          required
          aria-invalid={state?.fieldErrors?.password ? true : undefined}
        />
        {state?.fieldErrors?.password ? (
          <span className="field-error">{state.fieldErrors.password[0]}</span>
        ) : (
          <span className="field-error" style={{ color: "var(--stone)" }}>
            At least 8 characters.
          </span>
        )}
      </div>

      <button className="btn btn--primary" type="submit" disabled={pending}>
        {pending
          ? mode === "login"
            ? "Logging in…"
            : "Creating account…"
          : mode === "login"
            ? "Log In"
            : "Create Account"}
      </button>
    </form>
  );
}
