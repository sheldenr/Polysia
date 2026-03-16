import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Login() {
  return (
    <section className="min-h-screen bg-[#f5f5f5] dark:bg-zinc-900 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-black dark:text-zinc-100 hover:text-[#3491b2] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="w-full max-w-[360px] -translate-y-4 sm:-translate-y-6">
          <div className="flex justify-center">
            <img src="/logo only.svg" alt="Polysia logo" className="w-12 h-12" />
          </div>

          <h1 className="mt-5 text-center text-3xl sm:text-4xl font-bold text-black dark:text-zinc-100">
            Login
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-zinc-300">
            Welcome back to Polysia.
          </p>

          <form className="mt-8 space-y-3" onSubmit={(event) => event.preventDefault()}>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              className="w-full rounded-xl bg-[#efefef] dark:bg-zinc-800 px-4 py-3 text-sm text-black dark:text-zinc-100 placeholder:text-gray-500 dark:placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-[#3491b2]"
              required
            />

            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              className="w-full rounded-xl bg-[#efefef] dark:bg-zinc-800 px-4 py-3 text-sm text-black dark:text-zinc-100 placeholder:text-gray-500 dark:placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-[#3491b2]"
              required
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-[#3491b2] py-3 text-sm font-semibold text-white hover:bg-[#2b7f9d] transition-colors"
            >
              Login
            </button>
          </form>

          <button
            type="button"
            className="mt-3 w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 py-3 text-sm font-medium text-black dark:text-zinc-100 hover:border-[#3491b2]/50 transition-colors inline-flex items-center justify-center gap-2"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
              <path
                fill="#000000"
                d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.5-5.5 3.5-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 2.9 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.3-.2-2H12z"
              />
              <path
                fill="#000000"
                d="M2 7.3l3.2 2.3C6 7.2 8.8 5.6 12 5.6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 2.9 14.6 2 12 2 8 2 4.6 4.2 2.8 7.5L2 7.3z"
              />
              <path
                fill="#000000"
                d="M12 22c2.5 0 4.6-.8 6.2-2.3l-2.9-2.4c-.8.6-1.9 1-3.3 1-3.1 0-5.8-2.1-6.7-5l-3.2 2.5C3.9 19.5 7.6 22 12 22z"
              />
              <path
                fill="#000000"
                d="M2.8 7.5C2.3 8.8 2 10.3 2 12s.3 3.2.8 4.5l3.2-2.5c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2l-3.2-2.5z"
              />
            </svg>
            Continue with Google
          </button>

          <p className="mt-4 text-center text-sm text-gray-600 dark:text-zinc-300">
            New here?{" "}
            <Link to="/signup" className="text-[#3491b2] hover:underline">
              Create an account
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-gray-500 dark:text-zinc-400">
            By continuing, you agree to our{" "}
            <Link to="/privacy" className="text-[#3491b2] hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link to="/terms" className="text-[#3491b2] hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
