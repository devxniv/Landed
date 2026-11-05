import { AuthProvider, useAuth } from "./AuthContext";
import AuthPage from "./AuthPage";

function Spinner() {
  return (
    <div className="grid min-h-screen place-items-center">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
    </div>
  );
}

const stats = [
  { label: "Applications", hint: "Coming soon" },
  { label: "Interviews", hint: "Coming soon" },
  { label: "Tasks", hint: "Coming soon" },
];

function Dashboard() {
  const { user, logout } = useAuth();
  const name = user.full_name || user.email;

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
              L
            </span>
            Landed
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:block">
              {user.email}
            </span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
              {name[0].toUpperCase()}
            </span>
            <button
              onClick={logout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {name} 👋
        </h1>
        <p className="mt-1 text-slate-500">
          You're signed in. Your dashboard will live here.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-300">—</p>
              <p className="mt-1 text-xs text-slate-400">{s.hint}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? <Dashboard /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Home />
    </AuthProvider>
  );
}
