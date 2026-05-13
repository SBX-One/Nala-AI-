import { signInWithGoogle, signUpWithEmail } from "@/app/auth/actions";
import Image from "next/image";
import Link from "next/link";
import { FormInput } from "@/components/ui/FormInput";

interface RegisterPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <div className="flex w-full min-h-screen bg-white overflow-y-auto lg:overflow-hidden">
      {/* Left Panel - Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 lg:overflow-y-auto">
        <div className="w-full max-w-md mx-auto flex flex-col">
          {/* Mobile Logo & Tagline */}
          <div className="lg:hidden flex flex-col items-center gap-4 mb-12">
            <div className="flex items-center gap-3">
              <Image
                src="/icon/Nala-Logo.svg"
                alt="Nala Logo"
                width={48}
                height={40}
                className="w-12 h-10"
              />
              <span className="text-heading-5-bold text-text-action tracking-tight">
                Nala
              </span>
            </div>
            <h2 className="text-body-sm-semibold text-primary-600 italic text-center">
              &ldquo;Smarter Care for Your Everyday Mind&rdquo;
            </h2>
          </div>

          {/* Header */}
          <div className="flex flex-col items-center gap-2 mb-8">
            <h1 className="text-heading-6-semibold text-text-heading text-center">
              Start Your Journey With Nala
            </h1>
          </div>

          <div className="flex flex-col gap-6">
            {/* Error Banner */}
            {error && (
              <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-error-50 border border-error-200">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-error-default shrink-0"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 8v4M12 16h.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-body-sm-medium text-text-error">
                  {decodeURIComponent(error)}
                </p>
              </div>
            )}

            {/* Registration Form */}
            <form action={signUpWithEmail} className="flex flex-col gap-5">
              <FormInput
                leftLabel="Email"
                id="email"
                name="email"
                type="email"
                required
                placeholder="example@email.com"
              />

              <FormInput
                leftLabel="Password"
                id="password"
                name="password"
                type="password"
                required
                placeholder="enter password"
              />

              <FormInput
                leftLabel="Confirm Password"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="re-enter password"
              />

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  className="button-primary-large w-full flex justify-center mt-1"
                >
                  Sign Up
                </button>
                <Link
                  href="/login"
                  className="button-secondary-large w-full flex justify-center mt-1"
                >
                  Sign In Instead
                </Link>
              </div>
            </form>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="grow border-t border-border-default"></div>
              <span className="shrink mx-4 text-label-caption-semibold text-text-placeholder">
                Sign Up With Google
              </span>
              <div className="grow border-t border-border-default"></div>
            </div>

            {/* Google Sign In */}
            <form action={signInWithGoogle} className="w-full">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-full border border-border-default bg-white hover:bg-neutral-50 hover:border-primary-200 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-xs group"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="text-label-base-bold text-text-heading group-hover:text-primary-600 transition-colors">
                  Sign Up with Google
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Panel - Branding Collage */}
      <div className="hidden lg:flex lg:w-[55%] bg-[#F8FAFC] relative overflow-hidden flex-col items-center pt-24 px-12">
        {/* Nala Logo & Tagline */}
        <div className="flex flex-col items-center gap-6 z-10 mb-6">
          <div className="flex items-center gap-4">
            <Image
              src="/icon/Nala-Logo.svg"
              alt="Nala Logo"
              width={112}
              height={90}
              priority
              className="w-28 h-auto"
            />
            <span className="text-display-bold text-text-primary text-text-action tracking-tight">
              Nala
            </span>
          </div>
          <h2 className="text-body-lg-semibold text-primary-600 italic">
            &ldquo;Smarter Care for Your Everyday Mind&rdquo;
          </h2>
        </div>
        <Image
          src="/images/onboarding1.svg"
          alt="Nala Onboarding"
          width={999}
          height={999}
          priority
          className="w-[80%]"
        />
      </div>
    </div>
  );
}
