import { useState } from "react";
import { useNavigate } from "react-router";
import Cookies from "universal-cookie";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "";
  const navigate = useNavigate();
  const cookies = new Cookies();

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username: username.trim(), password: password }),
      });

      if (!response.ok) {
        setErrorMsg("Invalid username or password.");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (!data || data?.status !== "success") {
        setErrorMsg(data?.message ?? "Authentication failed.");
        setIsLoading(false);
        return;
      }

      const userData = data?.data;
      if (!userData) {
        setErrorMsg("No user profile received.");
        setIsLoading(false);
        return;
      }

      // Store cookie session
      cookies.set("user_data", userData, {
        path: "/",
        maxAge: 3600,
        secure: true,
        sameSite: "none",
      });

      setSuccessMsg(data?.message || "Success! Redirecting to workspace...");
      setUsername("");
      setPassword("");
      setTimeout(() => {
        navigate("/dashboard");
        setSuccessMsg("");
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error(error);
      setErrorMsg("Connection error. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200/80 shadow-2xl p-8 transition-all hover:shadow-indigo-500/5 duration-350">
        {/* Header Title Section */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-md shadow-indigo-600/20">
            🔒
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none">
            Sign In to Console
          </h2>
          <p className="text-xs text-gray-400 mt-2">
            Enter credentials to access the secure file system
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleFormSubmit} className="space-y-5">
          {/* Username input block */}
          <div>
            <label htmlFor="username-login" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-sm pointer-events-none">
                👤
              </span>
              <input
                id="username-login"
                type="text"
                required
                disabled={isLoading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-450"
              />
            </div>
          </div>

          {/* Password input block */}
          <div>
            <label htmlFor="password-login" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 text-sm pointer-events-none">
                🔑
              </span>
              <input
                id="password-login"
                type="password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-450"
              />
            </div>
          </div>

          {/* Submission button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm py-2.5 rounded-xl shadow-md shadow-indigo-600/15 transition-all duration-150 cursor-pointer disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Message Banner Feedbacks */}
        {errorMsg && (
          <div className="mt-5 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs text-rose-600 font-semibold text-center animate-pulse">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mt-5 rounded-xl bg-teal-50 border border-teal-100 p-3 text-xs text-teal-600 font-semibold text-center">
            ✓ {successMsg}
          </div>
        )}


      </div>
    </div>
  );
}