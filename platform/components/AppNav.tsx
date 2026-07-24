import Link from "next/link";
import { logout } from "@/lib/actions";

export default function AppNav({ active }: { active: "dashboard" | "shrink" }) {
  return (
    <nav className="app-nav">
      <div className="container app-nav__row">
        <Link className="app-nav__word" href="/dashboard">
          The Trading Floor
        </Link>
        <ul className="app-nav__links">
          <li>
            <Link
              href="/dashboard"
              className={active === "dashboard" ? "is-active" : undefined}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="/shrink"
              className={active === "shrink" ? "is-active" : undefined}
            >
              The Shrink
            </Link>
          </li>
          <li>
            <form action={logout}>
              <button type="submit">Log Out</button>
            </form>
          </li>
        </ul>
      </div>
    </nav>
  );
}
