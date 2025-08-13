import React, { useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import API_BASE_URL from "../utils/api";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [msg, setMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setMsg("");
    setIsSuccess(false);
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // very simple password strength check
  const pwdStrength = useMemo(() => {
    const v = form.password;
    let score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v)) score++;
    if (/[a-z]/.test(v)) score++;
    if (/\d/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    return Math.min(score, 4); // scale 0-4
  }, [form.password]);

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      return "All fields are required.";
    }
    if (!isValidEmail(form.email)) {
      return "Please enter a valid email address.";
    }
    if (form.password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (!/[a-z]/i.test(form.password) || !/\d/.test(form.password)) {
      return "Password must include at least one letter and one number.";
    }
    if (form.password !== form.confirm) {
      return "Passwords do not match.";
    }
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
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      };
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, payload);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setMsg("Registration successful!");
      setIsSuccess(true);
      setTimeout(() => navigate("/"), 800);
    } catch (error) {
      const apiMsg = error?.response?.data?.error || "Registration failed";
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
        <h2 className="text-3xl font-extrabold mb-6 text-center text-slate-900">Create an Account</h2>

        {/* Name */}
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          name="name"
          placeholder="Jane Doe"
          value={form.name}
          onChange={handleChange}
          autoComplete="name"
          className="w-full p-3 mb-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

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
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
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

        {/* Strength meter */}
        <div className="h-1 w-full bg-gray-200 rounded mb-1 overflow-hidden">
          <div
            className={`h-full transition-all ${
              pwdStrength >= 3 ? "bg-emerald-600" : pwdStrength === 2 ? "bg-yellow-500" : "bg-red-500"
            }`}
            style={{ width: `${(pwdStrength / 4) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Use at least 8 characters, including a letter and a number.
        </p>

        {/* Confirm password */}
        <label className="block text-sm font-medium mb-1">Confirm Password</label>
        <div className="relative mb-4">
          <input
            name="confirm"
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter password"
            value={form.confirm}
            onChange={handleChange}
            autoComplete="new-password"
            className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-indigo-600"
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold p-3 rounded-xl transition"
        >
          {submitting ? "Creating account…" : "Register"}
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
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
