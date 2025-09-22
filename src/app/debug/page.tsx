export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <h1 className="text-2xl font-bold text-center mb-6">Debug Info</h1>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Environment Check:</h3>
              <ul className="text-sm space-y-1">
                <li>
                  NEXTAUTH_SECRET:{" "}
                  {process.env.NEXTAUTH_SECRET ? "✅ Set" : "❌ Missing"}
                </li>
                <li>
                  NEXTAUTH_URL:{" "}
                  {process.env.NEXTAUTH_URL || "🔄 Auto-detected (recommended)"}
                </li>
                <li>
                  POSTGRES_URL:{" "}
                  {process.env.POSTGRES_URL ? "✅ Set" : "❌ Missing"}
                </li>
                <li>NODE_ENV: {process.env.NODE_ENV}</li>
                <li>VERCEL_URL: {process.env.VERCEL_URL || "Not available"}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">URLs:</h3>
              <ul className="text-sm space-y-1">
                <li>
                  Login:{" "}
                  <a href="/login" className="text-blue-600 hover:underline">
                    /login
                  </a>
                </li>
                <li>
                  Dashboard:{" "}
                  <a
                    href="/dashboard"
                    className="text-blue-600 hover:underline"
                  >
                    /dashboard
                  </a>
                </li>
                <li>
                  API Auth:{" "}
                  <a
                    href="/api/auth/signin"
                    className="text-blue-600 hover:underline"
                  >
                    /api/auth/signin
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
