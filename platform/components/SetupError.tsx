/**
 * Distinguishes "query failed" from "no data yet" -- without this, a
 * missing table (migrations not run), a bad RLS policy, or a wrong
 * Supabase URL/key all look identical to an empty dashboard, which is
 * actively misleading while this app is still being connected to a
 * real Supabase project.
 */
export default function SetupError({ message }: { message: string }) {
  return (
    <div className="empty-state" style={{ borderColor: "rgba(255,77,77,.4)" }}>
      <div className="badge badge--mock" style={{ marginBottom: "16px" }}>
        SOMETHING&rsquo;S NOT SET UP RIGHT
      </div>
      <p>
        This page couldn&rsquo;t load your data. If you&rsquo;re still setting
        up Supabase, check that both migrations in
        <code style={{ margin: "0 4px" }}>supabase/migrations/</code>
        have been run, and that the env vars in Vercel match your project.
      </p>
      <p
        className="tabular"
        style={{ marginTop: "12px", fontSize: "13px", opacity: 0.8 }}
      >
        {message}
      </p>
    </div>
  );
}
