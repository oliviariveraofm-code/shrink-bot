import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { signup } from "./actions";

export default function SignupPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="eyebrow">The Trading Floor</div>
        <h1>Create your account.</h1>
        <p className="lede">
          Upload charts, get mock analysis, and track your discipline with
          The Shrink.
        </p>
        <AuthForm mode="signup" action={signup} />
        <div className="auth-switch">
          Already have an account? <Link href="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
