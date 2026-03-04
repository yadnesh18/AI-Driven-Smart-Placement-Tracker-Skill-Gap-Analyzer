import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(form.email))
      errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { token, role, user } = res.data;
      login({ token, role, user });
      if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setGeneralError(
        err.response?.data?.message || 'Failed to login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center
                    bg-gradient-to-br from-gray-900 via-indigo-900 to-black
                    relative overflow-hidden px-4 py-12">

      {/* ── Ambient background blobs ── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px]
                        rounded-full bg-indigo-700 opacity-20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px]
                        rounded-full bg-cyan-500 opacity-10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[300px] rounded-full bg-violet-600
                        opacity-5 blur-[80px]" />
      </div>

      {/* ── Subtle grid overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Auth card ── */}
      <div className="relative z-10 w-full max-w-md mx-auto">

        {/* Brand header */}
        <div className="text-center mb-8">
          {/* Logo mark */}
          <div className="inline-flex items-center justify-center w-12 h-12
                          rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400
                          shadow-lg shadow-indigo-500/30 mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor"
                 strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21a48.25 48.25 0 01-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-bold tracking-tight leading-snug">
            AI-Driven Smart Placement<br />
            <span className="text-transparent bg-clip-text
                             bg-gradient-to-r from-indigo-400 to-cyan-400">
              Tracker & Skill Gap Analyzer
            </span>
          </h2>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10
                        rounded-2xl shadow-2xl shadow-black/40 px-8 py-10">

          <h1 className="text-white text-2xl font-semibold mb-1">
            Sign in to your account
          </h1>
          <p className="text-slate-400 text-sm mb-8">
            Enter your credentials to access your dashboard
          </p>

          {/* General error */}
          {generalError && (
            <div className="flex items-start gap-3 bg-red-500/10
                            border border-red-500/30 rounded-lg px-4 py-3 mb-6">
              <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0"
                   fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0
                         11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0
                         102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-red-400 text-sm">{generalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email"
                     className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className={`w-full bg-white/5 border rounded-lg px-4 py-2.5
                            text-white text-sm placeholder-slate-600 outline-none
                            transition-all duration-150 focus:bg-white/8 focus:ring-2
                            ${errors.email
                              ? 'border-red-500/60 focus:ring-red-500/20'
                              : 'border-white/10 hover:border-white/20 focus:border-indigo-500 focus:ring-indigo-500/20'
                            }`}
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor"
                       viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0
                             0116 0zm-7 4a1 1 0 11-2 0 1 1 0
                             012 0zm-1-9a1 1 0 00-1 1v4a1 1 0
                             102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password"
                     className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full bg-white/5 border rounded-lg px-4 py-2.5 pr-11
                              text-white text-sm placeholder-slate-600 outline-none
                              transition-all duration-150 focus:bg-white/8 focus:ring-2
                              ${errors.password
                                ? 'border-red-500/60 focus:ring-red-500/20'
                                : 'border-white/10 hover:border-white/20 focus:border-indigo-500 focus:ring-indigo-500/20'
                              }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-[18px] h-[18px]" fill="none"
                         stroke="currentColor" strokeWidth="2"
                         viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226
                               16.338 7.244 19.5 12 19.5c.993 0 1.953-.138
                               2.863-.395M6.228 6.228A10.45 10.45 0
                               0112 4.5c4.756 0 8.773 3.162 10.065
                               7.498a10.523 10.523 0 01-4.293
                               5.774M6.228 6.228L3 3m3.228 3.228l3.65
                               3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0
                               0a3 3 0 10-4.243-4.243m4.242
                               4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-[18px] h-[18px]" fill="none"
                         stroke="currentColor" strokeWidth="2"
                         viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423
                               7.51 7.36 4.5 12 4.5c4.638 0 8.573
                               3.007 9.963 7.178.07.207.07.431
                               0 .639C20.577 16.49 16.64 19.5
                               12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor"
                       viewBox="0 0 20 20">
                    <path fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0
                             0116 0zm-7 4a1 1 0 11-2 0 1 1 0
                             012 0zm-1-9a1 1 0 00-1 1v4a1 1 0
                             102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2
                         bg-gradient-to-r from-indigo-600 to-indigo-500
                         hover:from-indigo-500 hover:to-cyan-500
                         disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-semibold text-sm rounded-lg py-3
                         transition-all duration-200 shadow-lg shadow-indigo-500/25
                         hover:shadow-indigo-500/40 hover:-translate-y-px
                         active:translate-y-0"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white"
                       xmlns="http://www.w3.org/2000/svg" fill="none"
                       viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <svg className="w-4 h-4" fill="none" stroke="currentColor"
                       strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21
                             12H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-slate-600 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300
                         font-medium transition-colors duration-150
                         underline underline-offset-2"
            >
              Create one for free
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Powered by AI · Placement & Skill Gap Analytics Platform
        </p>
      </div>
    </div>
  );
};

export default Login;