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
  const [rememberMe, setRememberMe] = useState(false);

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
    <div
      className="flex flex-col lg:flex-row min-h-screen"
      style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#0a0a0c' }}
    >
      {/* ── LEFT SIDE: BRANDING & FEATURES ── */}
      <div
        className="relative hidden lg:flex w-1/2 flex-col justify-between overflow-hidden"
        style={{ backgroundColor: '#050505', padding: '4rem' }}
      >
        {/* Decorative Gradients */}
        <div
          className="absolute rounded-full"
          style={{
            top: '-6rem',
            left: '-6rem',
            width: '24rem',
            height: '24rem',
            background: 'rgba(99, 102, 241, 0.2)',
            filter: 'blur(120px)',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: 0,
            right: 0,
            width: '500px',
            height: '500px',
            background: 'rgba(139, 92, 246, 0.1)',
            filter: 'blur(150px)',
          }}
        />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-20">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: '2.5rem',
                height: '2.5rem',
                background: 'linear-gradient(to bottom right, #6366f1, #8b5cf6)',
                boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.2)',
              }}
            >
              <span className="material-symbols-outlined text-white text-2xl">
                analytics
              </span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white uppercase">
              SPT{' '}
              <span className="font-light opacity-70">Analyzer</span>
            </span>
          </div>

          {/* Content */}
          <div style={{ maxWidth: '36rem' }}>
            <h2
              className="text-5xl font-bold text-white mb-6"
              style={{ lineHeight: 1.15 }}
            >
              The future of{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                talent acquisition
              </span>{' '}
              is here.
            </h2>
            <p className="text-xl mb-12" style={{ color: '#94a3b8' }}>
              Streamline your hiring workflow with our AI-powered suite designed
              for modern recruiters and high-growth teams.
            </p>

            {/* Features */}
            <div className="space-y-8">
              {/* Feature 1 */}
              <div className="flex items-start gap-4">
                <div
                  className="rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: '#6366f1' }}
                  >
                    psychology
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">AI Resume Analysis</h4>
                  <p className="text-sm" style={{ color: '#64748b' }}>
                    Extract insights and score candidates automatically with
                    neural ranking.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-4">
                <div
                  className="rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: '#8b5cf6' }}
                  >
                    trending_up
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">
                    Skill Gap Detection
                  </h4>
                  <p className="text-sm" style={{ color: '#64748b' }}>
                    Identify missing competencies and suggest training paths in
                    real-time.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-4">
                <div
                  className="rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: '#3b82f6' }}
                  >
                    hub
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">
                    Automated Pipelines
                  </h4>
                  <p className="text-sm" style={{ color: '#64748b' }}>
                    Connect with LinkedIn and your ATS for a seamless
                    recruitment flow.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div
          className="relative z-10 flex items-center gap-12 pt-12"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
        >
          <div>
            <p className="text-2xl font-bold text-white">98%</p>
            <p
              className="text-xs uppercase font-medium"
              style={{ letterSpacing: '0.1em', color: '#64748b' }}
            >
              Match Accuracy
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">10k+</p>
            <p
              className="text-xs uppercase font-medium"
              style={{ letterSpacing: '0.1em', color: '#64748b' }}
            >
              Daily Scans
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT SIDE: LOGIN FORM ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-24 relative">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-12">
          <div
            className="flex items-center justify-center rounded-lg text-white"
            style={{
              width: '2rem',
              height: '2rem',
              backgroundColor: '#6366f1',
            }}
          >
            <span className="material-symbols-outlined text-xl">analytics</span>
          </div>
          <h1 className="text-lg font-bold text-white uppercase tracking-tight">
            SPT <span className="font-light">Analyzer</span>
          </h1>
        </div>

        {/* Glass Card */}
        <div
          className="w-full relative"
          style={{
            maxWidth: '28rem',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '1.5rem',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p style={{ color: '#94a3b8' }}>
              Sign in to manage your placement engine.
            </p>
          </div>

          {/* General error */}
          {generalError && (
            <div
              className="flex items-start gap-3 rounded-lg px-4 py-3 mb-6"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <span
                className="material-symbols-outlined text-lg mt-0.5"
                style={{ color: '#f87171' }}
              >
                error
              </span>
              <p className="text-sm" style={{ color: '#f87171' }}>
                {generalError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            {/* Email Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ color: '#64748b' }}
                >
                  mail
                </span>
              </div>
              <input
                type="email"
                name="email"
                id="email"
                value={form.email}
                onChange={handleChange}
                placeholder=" "
                autoComplete="email"
                className="peer"
                style={{
                  display: 'block',
                  width: '100%',
                  paddingLeft: '3rem',
                  paddingRight: '1rem',
                  paddingTop: '1rem',
                  paddingBottom: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: errors.email
                    ? '1px solid rgba(239, 68, 68, 0.6)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '1rem',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.5)';
                  e.target.style.borderColor = '#6366f1';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = errors.email
                    ? 'rgba(239, 68, 68, 0.6)'
                    : 'rgba(255, 255, 255, 0.1)';
                }}
              />
              <label
                htmlFor="email"
                className="absolute pointer-events-none"
                style={{
                  left: '3rem',
                  top: '1rem',
                  color: '#64748b',
                  transition: 'all 0.3s ease',
                  transformOrigin: 'left',
                  ...(form.email
                    ? {
                        transform: 'translateY(-1.5rem) scale(0.85)',
                        color: '#6366f1',
                      }
                    : {}),
                }}
              >
                Email Address
              </label>
              {errors.email && (
                <p
                  className="text-xs mt-1.5 flex items-center gap-1"
                  style={{ color: '#f87171' }}
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ color: '#64748b' }}
                >
                  lock
                </span>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                value={form.password}
                onChange={handleChange}
                placeholder=" "
                autoComplete="current-password"
                className="peer"
                style={{
                  display: 'block',
                  width: '100%',
                  paddingLeft: '3rem',
                  paddingRight: '3rem',
                  paddingTop: '1rem',
                  paddingBottom: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: errors.password
                    ? '1px solid rgba(239, 68, 68, 0.6)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '1rem',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 0 2px rgba(99, 102, 241, 0.5)';
                  e.target.style.borderColor = '#6366f1';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                  e.target.style.borderColor = errors.password
                    ? 'rgba(239, 68, 68, 0.6)'
                    : 'rgba(255, 255, 255, 0.1)';
                }}
              />
              <label
                htmlFor="password"
                className="absolute pointer-events-none"
                style={{
                  left: '3rem',
                  top: '1rem',
                  color: '#64748b',
                  transition: 'all 0.3s ease',
                  transformOrigin: 'left',
                  ...(form.password
                    ? {
                        transform: 'translateY(-1.5rem) scale(0.85)',
                        color: '#6366f1',
                      }
                    : {}),
                }}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute flex items-center"
                style={{
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                tabIndex={-1}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
              {errors.password && (
                <p
                  className="text-xs mt-1.5 flex items-center gap-1"
                  style={{ color: '#f87171' }}
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Actions Row */}
            <div className="flex items-center justify-between text-sm px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe((v) => !v)}
                  style={{
                    width: '1rem',
                    height: '1rem',
                    borderRadius: '0.25rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    accentColor: '#6366f1',
                  }}
                />
                <span style={{ color: '#94a3b8', transition: 'color 0.2s' }}>
                  Remember me
                </span>
              </label>
              <a
                href="#"
                className="font-medium"
                style={{ color: '#6366f1', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#8b5cf6')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6366f1')}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 group"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#fff',
                fontWeight: 700,
                padding: '1rem 1.5rem',
                borderRadius: '1rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all 0.3s ease',
                fontSize: '1rem',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow =
                    '0 10px 20px -5px rgba(99, 102, 241, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin"
                    style={{ width: '1.25rem', height: '1.25rem' }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      style={{ opacity: 0.25 }}
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      style={{ opacity: 0.75 }}
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span
                    className="material-symbols-outlined text-xl"
                    style={{ transition: 'transform 0.2s' }}
                  >
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative" style={{ marginTop: '2.5rem', marginBottom: '2rem' }}>
            <div className="absolute inset-0 flex items-center">
              <div
                className="w-full"
                style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
              />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span
                style={{
                  backgroundColor: '#0e0e11',
                  padding: '0 1rem',
                  color: '#64748b',
                  letterSpacing: '0.1em',
                }}
              >
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button
              className="flex items-center justify-center gap-3"
              style={{
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '1rem',
                color: '#e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')
              }
            >
              <svg style={{ width: '1.25rem', height: '1.25rem' }} viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 001 12c0 1.94.46 3.77 1.18 5.07l3.66-2.98z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google</span>
            </button>
            <button
              className="flex items-center justify-center gap-3"
              style={{
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '1rem',
                color: '#e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')
              }
            >
              <svg
                style={{ width: '1.25rem', height: '1.25rem' }}
                viewBox="0 0 24 24"
                fill="#0A66C2"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span>LinkedIn</span>
            </button>
          </div>

          {/* Register link */}
          <p
            className="text-center text-sm"
            style={{ marginTop: '2.5rem', color: '#64748b' }}
          >
            New to the platform?{' '}
            <Link
              to="/register"
              className="font-bold"
              style={{ color: '#6366f1', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Create an account
            </Link>
          </p>
        </div>

        {/* Floating background element */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            background: 'rgba(99, 102, 241, 0.05)',
            borderRadius: '50%',
            filter: 'blur(100px)',
            zIndex: -1,
          }}
        />
      </div>
    </div>
  );
};

export default Login;