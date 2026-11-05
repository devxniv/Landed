import { useState } from "react";
import { useAuth } from "./AuthContext";

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 " +
  "placeholder:text-slate-400 shadow-sm outline-none transition " +
  "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15";

const features = [
  "Track every application in one place",
  "Log interview rounds and outcomes",
  "See which sources actually get replies",
];

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [success, setSuccess] = useState("");

  const isLogin = mode === "login";
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = () => {
    setMode(isLogin ? "register" : "login");
    setError("");
    setSuccess("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.password, form.full_name);
        setMode("login");
        setForm({ ...form, password: "", full_name: "" });
        setSuccess("Account created. Please log in.");
      }
    } catch (err) {
      const d = err.response?.data;
      const details = d?.errors?.map((x) => Object.values(x)[0]).join(", ");
      setError(details || d?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-800 p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />

        <div className="relative flex items-center gap-2 text-xl font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-lg ring-1 ring-white/30">
            L
          </span>
          Landed
        </div>

        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Track every application.
            <br />
            Land the offer.
          </h1>
          <ul className="mt-8 space-y-3 text-indigo-100">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-xs">
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-indigo-200">
          Your job hunt, organised.
        </p>
      </div>

      {/* form panel */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 text-lg font-semibold lg:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
              L
            </span>
            Landed
          </div>

          <h2 className="text-2xl font-bold tracking-tight">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isLogin
              ? "Log in to pick up where you left off."
              : "Start tracking your applications in minutes."}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {!isLogin && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full name
                </label>
                <input
                  name="full_name"
                  placeholder="Jane Doe"
                  value={form.full_name}
                  onChange={onChange}
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={onChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={onChange}
                  className={`${inputClass} pr-16`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute inset-y-0 right-0 px-3.5 text-xs font-medium text-slate-500 hover:text-indigo-600"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              {!isLogin && (
                <p className="mt-1.5 text-xs text-slate-500">
                  8–72 characters with upper and lower case, numbers and a
                  special character.
                </p>
              )}
            </div>

            {success && (
              <div
                role="status"
                className="rounded-lg border border-green-200 bg-green-50 px-3.5 py-2.5 text-sm text-green-700"
              >
                {success}
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Log in"
                  : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? "New to Landed?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {isLogin ? "Create an account" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
