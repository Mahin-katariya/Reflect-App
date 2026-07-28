import { useState } from "react"
import { Link, useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import BrandMark from "../components/BrandMark";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          username,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error.message);
        return;
      }

      // Auto-login after successful registration
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        navigate("/login");
        return;
      }

      navigate("/dashboard")
    } catch (err) {
      console.log("Error -> ", err);
      setError("Something went wrong. Please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-[396px] text-center animate-pop">
        <div className="mb-10 inline-flex items-center gap-2 font-serif text-[20px] text-ink">
          <BrandMark />
          <span>Reflect</span>
        </div>

        <h1 className="font-serif text-[40px] font-medium tracking-[-0.6px] text-ink">
          Create your account
        </h1>
        <p className="mt-2 text-[15px] text-muted">
          Start sharing your learnings with Reflect.
        </p>

        {error && (
          <p className="mt-6 rounded-[10px] border border-danger-border bg-danger-bg px-3 py-2 text-left text-[13px] text-danger">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 text-left">
          <div className="mb-3.5">
            <label className="mb-1.5 block text-[13px] text-muted">Username</label>
            <input
              type="text"
              placeholder="your-username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-[10px] border border-line bg-surface px-3.5 py-3 text-[15px] text-ink outline-none transition placeholder:text-faint focus:border-ink focus:shadow-[0_0_0_3px_rgba(15,15,18,0.08)]"
              required
            />
          </div>

          <div className="mb-3.5">
            <label className="mb-1.5 block text-[13px] text-muted">Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[10px] border border-line bg-surface px-3.5 py-3 text-[15px] text-ink outline-none transition placeholder:text-faint focus:border-ink focus:shadow-[0_0_0_3px_rgba(15,15,18,0.08)]"
              required
            />
          </div>

          <div className="mb-5">
            <label className="mb-1.5 block text-[13px] text-muted">Password</label>
            <input
              type="password"
              placeholder="Create a password (min 8)"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[10px] border border-line bg-surface px-3.5 py-3 text-[15px] text-ink outline-none transition placeholder:text-faint focus:border-ink focus:shadow-[0_0_0_3px_rgba(15,15,18,0.08)]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[10px] bg-ink py-[13px] text-[15px] text-canvas transition-[background,transform] hover:bg-ink-hover active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="my-[22px] flex items-center gap-3.5 text-[12px] tracking-wider text-faint">
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
          OR
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
        </div>

        <Link
          to="/login"
          className="block w-full rounded-[10px] border border-line-strong py-3 text-[15px] text-ink transition-colors hover:border-faint hover:bg-surface"
        >
          Sign in instead
        </Link>

        <p className="mt-8 text-[12px] text-faint">
          By continuing you agree to Reflect's terms.
        </p>
      </div>
    </div>
  )
}
