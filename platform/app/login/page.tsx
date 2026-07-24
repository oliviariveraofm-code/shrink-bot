import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { createClient } from "@/lib/supabase/server";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; confirm?: string }>;
}) {
  const { next, confirm } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(next && next.startsWith("/") ? next : "/dashboard");
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="eyebrow">The Trading Floor</div>
        <h1>Log in.</h1>
        <p className="lede">
          {confirm
            ? "Account created. Check your email to confirm, then log in below."
            : "Access your dashboard, uploaded charts, and The Shrink."}
        </p>
        <AuthForm mode="login" action={login} next={next} />
        <div className="auth-switch">
          Don&rsquo;t have an account? <Link href="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
