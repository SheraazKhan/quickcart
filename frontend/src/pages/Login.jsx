import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API_BASE_URL from "../utils/api";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(() => !!localStorage.getItem("rememberEmail"));
  const [msg, setMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // support either a pathname object or a simple string passed in state
  const from =
    (location.state && (location.state.from?.pathname || location.state.from)) || "/";

  useEffect(() => {
    const remembered = localStorage.getItem("rememberEmail");
    if (remembered) {
      setForm((f) => ({ ...f, email: remembered }));
    }
  }, []);

  const isValidEmail = useMemo(
    () => (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    []
  );

  const handleChange = (e) => {
    setMsg("");
    setIsSuccess(false);
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.email.trim() || !form.password) return "Email and password are required.";
    if (!isValidEmail(form.email)) return "Please enter a valid email address.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setMsg(err);
      setIsSuccess(false);
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        ...form,
        email: form.email.trim(),
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (remember) localStorage.setItem("rememberEmail", form.email.trim());
      else localStorage.removeItem("rememberEmail");

      setMsg(`Welcome, ${res.data.user.name}`);
      setIsSuccess(true);
      navigate(from, { replace: true });
    } catch (error) {
      const apiMsg = error?.response?.data?.error || "Login failed";
      setMsg(apiMsg);
      setIsSuccess(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_20px_rgba(0,0,0,0.06)] p-8 rounded-2xl w-full max-w-md border border-gray-100"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-slate-900">Welcome back</h2>

        {/* Email */}
        <label className="block text-sm font-medium mb-1">Email Address</label>
        <input
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        {/* Password */}
        <label className="block text-sm font-medium mb-1">Password</label>
        <div className="relative mb-2">
          <input
            name="password"
            type={showPwd ? "text" : "password"}
            placeholder="Your password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-indigo-600"
          >
            {showPwd ? "Hide" : "Show"}
          </button>
        </div>

        {/* Helpers */}
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold p-3 rounded-xl transition"
        >
          {submitting ? "Signing in…" : "Login"}
        </button>

        {/* Message */}
        {msg && (
          <p
            className={`text-sm mt-4 text-center font-medium ${
              isSuccess ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}

        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/register" className="text-indigo-600 hover:underline font-medium">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
