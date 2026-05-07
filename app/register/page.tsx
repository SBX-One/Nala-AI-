import { signInWithGoogle, signUpWithEmail } from "@/app/auth/actions";
import Image from "next/image";
import Link from "next/link";

interface RegisterPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="flex w-full min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-linear-to-br from-primary-700 via-primary-500 to-accent-500" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/3 -right-10 w-60 h-60 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-8 px-12">
          <Image
            src="/icon/Nala-Logo.svg"
            alt="Nala Logo"
            width={100}
            height={80}
            className="brightness-0 invert"
          />
          <div className="text-center">
            <h1 className="text-heading-4-bold text-white mb-4">
              Welcome to Nala
            </h1>
            <p className="text-body-lg-regular text-white/75 max-w-md">
              Your trusted companion for mental health care. Connect with
              professional psychiatrists and start your wellness journey today.
            </p>
          </div>
          {/* Step preview */}
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {[
              { step: "1", label: "Create your account", done: true },
              { step: "2", label: "Choose your role", done: false },
              { step: "3", label: "Complete your profile", done: false },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3 text-white/80">
                <div className="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-label-small-semibold text-white shrink-0">
                  {item.step}
                </div>
                <span className="text-body-sm-regular">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md flex flex-col items-center gap-6">
          {/* Mobile Logo */}
          <div className="lg:hidden">
            <Image src="/icon/Nala-Logo.svg" alt="Nala Logo" width={64} height={52} />
          </div>

          {/* Header */}
          <div className="text-center w-full">
            <h2 className="text-heading-5-bold text-text-heading mb-2">
              Create Account
            </h2>
            <p className="text-body-base-regular text-text-subheading">
              Already have an account?{" "}
              <Link href="/login" className="text-text-action font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-label-small-semibold">
                1
              </div>
              <span className="text-label-small-medium text-text-heading">Sign Up</span>
            </div>
            <div className="h-0.5 flex-1 bg-border-default" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-neutral-100 text-text-placeholder flex items-center justify-center text-label-small-semibold">
                2
              </div>
              <span className="text-label-small-medium text-text-placeholder">Role</span>
            </div>
            <div className="h-0.5 flex-1 bg-border-default" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-neutral-100 text-text-placeholder flex items-center justify-center text-label-small-semibold">
                3
              </div>
              <span className="text-label-small-medium text-text-placeholder">Profile</span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-error-50 border border-error-200">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-error-default shrink-0">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-body-sm-medium text-text-error">{decodeURIComponent(error)}</p>
            </div>
          )}

          {/* Google Sign In */}
          <form action={signInWithGoogle} className="w-full">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-border-default bg-white hover:bg-neutral-50 hover:border-primary-200 active:scale-[0.98] transition-all duration-200 cursor-pointer group shadow-sm"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-label-base-medium text-text-heading group-hover:text-primary-500 transition-colors">
                Continue with Google
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 w-full">
            <div className="h-px flex-1 bg-border-default" />
            <span className="text-body-caption-regular text-text-placeholder">or register with email</span>
            <div className="h-px flex-1 bg-border-default" />
          </div>

          {/* Email Registration Form */}
          <form action={signUpWithEmail} className="w-full space-y-4">
            <div>
              <label htmlFor="email" className="text-label-small-medium text-text-label mb-1.5 block">
                Email <span className="text-error-default">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3.5 rounded-xl border border-border-default bg-white text-body-base-regular text-text-heading placeholder:text-text-placeholder focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-label-small-medium text-text-label mb-1.5 block">
                Password <span className="text-error-default">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Create a password (min. 6 characters)"
                className="w-full px-4 py-3.5 rounded-xl border border-border-default bg-white text-body-base-regular text-text-heading placeholder:text-text-placeholder focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-label-small-medium text-text-label mb-1.5 block">
                Confirm Password <span className="text-error-default">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                placeholder="Re-enter your password"
                className="w-full px-4 py-3.5 rounded-xl border border-border-default bg-white text-body-base-regular text-text-heading placeholder:text-text-placeholder focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-primary-500 text-white text-label-base-semibold rounded-xl hover:bg-primary-600 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm mt-2"
            >
              Create Account
            </button>
          </form>

          {/* Footer */}
          <p className="text-body-caption-regular text-text-placeholder text-center">
            By continuing, you agree to our{" "}
            <span className="text-text-action cursor-pointer hover:underline">Terms of Service</span>{" "}
            and{" "}
            <span className="text-text-action cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
