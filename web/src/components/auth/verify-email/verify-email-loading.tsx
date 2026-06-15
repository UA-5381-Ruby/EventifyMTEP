export function VerifyEmailLoading() {
  return (
    <div role="status" aria-live="polite">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
        <div
          className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"
          aria-hidden="true"
        />
      </div>

      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Verifying Email</h1>

      <p className="text-neutral-600">Please wait while we verify your email address...</p>
    </div>
  );
}
