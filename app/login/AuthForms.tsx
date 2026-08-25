"use client";

import { useActionState } from "react";
import {
  signInAction,
  signUpAction,
} from "../auth/actions";
import { INITIAL_AUTH_STATE } from "../auth/state";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";

function ActionMessage({ state }: { readonly state: typeof INITIAL_AUTH_STATE }) {
  if (state.status === "idle") return null;
  return <p className={`auth-message auth-message--${state.status}`} role="status">{state.message}</p>;
}

export function AuthForms({ nextPath }: { readonly nextPath: string }) {
  const [loginState, loginAction, loginPending] = useActionState(signInAction, INITIAL_AUTH_STATE);
  const [signupState, signupAction, signupPending] = useActionState(signUpAction, INITIAL_AUTH_STATE);

  return (
    <div className="auth-grid">
      <form action={loginAction} className="dashboard-card auth-form">
        <input type="hidden" name="next" value={nextPath} />
        <div><p className="section-kicker">Willkommen zurück</p><h2>Anmelden</h2></div>
        <Field label="E-Mail-Adresse" name="email" type="email" autoComplete="email" maxLength={254} required />
        <Field label="Passwort" name="password" type="password" autoComplete="current-password" minLength={8} maxLength={72} required />
        <ActionMessage state={loginState} />
        <Button type="submit" size="large" disabled={loginPending}>{loginPending ? "Anmeldung läuft …" : "Anmelden"}</Button>
      </form>

      <form action={signupAction} className="dashboard-card auth-form">
        <input type="hidden" name="next" value={nextPath} />
        <div><p className="section-kicker">Neu bei ChipMa</p><h2>Konto erstellen</h2></div>
        <Field label="Vollständiger Name" name="fullName" autoComplete="name" maxLength={120} required />
        <Field label="E-Mail-Adresse" name="email" type="email" autoComplete="email" maxLength={254} required />
        <Field label="Passwort" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={72} hint="Mindestens 12 Zeichen, Groß-/Kleinbuchstabe, Zahl und Sonderzeichen" required />
        <Field label="Passwort wiederholen" name="passwordConfirmation" type="password" autoComplete="new-password" minLength={12} maxLength={72} required />
        <ActionMessage state={signupState} />
        <Button type="submit" size="large" disabled={signupPending}>{signupPending ? "Konto wird erstellt …" : "Konto erstellen"}</Button>
      </form>
    </div>
  );
}
