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
      className="flex min-h-screen"
      style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f8f9fa' }}
    >
      {/* ── LEFT SIDE: BRANDING ── */}
      <div
        className="relative hidden lg:flex w-1/2 flex-col justify-between overflow-hidden"
        style={{ backgroundColor: '#3525cd', padding: '3rem' }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute rounded-full"
          style={{
            top: '-6rem', right: '-6rem',
            width: '24rem', height: '24rem',
            background: '#4f46e5',
            filter: 'blur(120px)',
            opacity: 0.3,
            mixBlendMode: 'multiply',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: '-6rem', left: '-6rem',
            width: '24rem', height: '24rem',
            background: '#2170e4',
            filter: 'blur(150px)',
            opacity: 0.2,
            mixBlendMode: 'multiply',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: '2.5rem', height: '2.5rem',
              backgroundColor: '#ffffff',
              boxShadow: '0 10px 20px -5px rgba(53, 37, 205, 0.3)',
            }}
          >
            <span className="material-symbols-outlined" style={{ color: '#3525cd', fontVariationSettings: "'FILL' 1" }}>
              auto_stories
            </span>
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em', color: '#ffffff' }}>
            ScholarFlow
          </span>
        </div>

        {/* Center illustration + floating cards */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-full" style={{ maxWidth: '28rem' }}>
            <img
              alt="Academic illustration"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCp9-1XQ2D_H-ol5TriQlGVfV9OIeyiwvPxOaUDajLF-t7vbs96n7_M_rzBAiFMvB3B-GHdFIkDem_-rUaYcGXUOd6YN45nhvFm6U4E806Ykk00VujCU4oTFENKkZV1iWW0yWkDxCvTM2Tno8McIImlk5Zw9ittJW-2OaaFDdWEwIXi547fMQqp96uYY7HOGij3TPsRlkUmLpxIJDDohvp424lavmg8PktZ73atLLXnbjUl6xHc1OyQyuwQbF2GzuRmhOLmsBwCEQ"
              className="w-full rounded-3xl"
              style={{ objectFit: 'contain', aspectRatio: '1/1' }}
            />
            {/* Floating Card 1 */}
            <div
              className="absolute"
              style={{
                top: '-1rem', right: '-1rem',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(199, 196, 216, 0.15)',
                borderRadius: '1rem',
                padding: '1.25rem',
                maxWidth: '200px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
              }}
            >
              <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ color: '#3525cd', fontSize: '0.875rem' }}>check_circle</span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#3525cd', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Placement Ready
                </span>
              </div>
              <p style={{ color: '#464555', fontSize: '0.8125rem', fontWeight: 500 }}>
                98% of your resume aligns with top-tier requirements.
              </p>
            </div>
            {/* Floating Card 2 */}
            <div
              className="absolute"
              style={{
                bottom: '3rem', left: '-2rem',
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(199, 196, 216, 0.15)',
                borderRadius: '1rem',
                padding: '1.25rem',
                maxWidth: '220px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{ width: '2rem', height: '2rem', backgroundColor: '#e2dfff' }}
                >
                  <span className="material-symbols-outlined" style={{ color: '#3525cd', fontSize: '0.875rem' }}>trending_up</span>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#464555' }}>Profile Growth</p>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: '#3525cd' }}>+24% this week</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center" style={{ marginTop: '2rem', maxWidth: '28rem' }}>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff', lineHeight: 1.15 }}>
              Curation of a<br />High-Value Career.
            </h1>
            <p style={{ color: 'rgba(226, 223, 255, 0.8)', fontSize: '1.125rem', marginTop: '1rem' }}>
              Join the ecosystem where academic excellence meets strategic career growth.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10" style={{ color: 'rgba(226, 223, 255, 0.6)', fontSize: '0.875rem' }}>
          © 2024 ScholarFlow Inc. All rights reserved.
        </div>
      </div>

      {/* ── RIGHT SIDE: LOGIN FORM ── */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center"
        style={{ padding: '2rem 2rem', backgroundColor: '#ffffff' }}
      >
        <div className="w-full" style={{ maxWidth: '28rem' }}>
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3" style={{ marginBottom: '3rem' }}>
            <div
              className="flex items-center justify-center rounded-xl"
              style={{ width: '2.5rem', height: '2.5rem', backgroundColor: '#3525cd', boxShadow: '0 10px 20px -5px rgba(53, 37, 205, 0.3)' }}
            >
              <span className="material-symbols-outlined" style={{ color: '#ffffff', fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
            </div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.02em', color: '#3525cd' }}>
              ScholarFlow
            </span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#191c1d' }}>
              Welcome back
            </h2>
            <p style={{ color: '#464555', fontSize: '1rem', marginTop: '0.5rem' }}>
              Enter your credentials to access your dashboard.
            </p>
          </div>

          {/* General error */}
          {generalError && (
            <div
              className="flex items-start gap-3"
              style={{
                borderRadius: '1rem',
                padding: '0.875rem 1rem',
                marginBottom: '1.5rem',
                backgroundColor: '#ffdad6',
              }}
            >
              <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '1.25rem', marginTop: '0.125rem' }}>error</span>
              <p style={{ fontSize: '0.875rem', color: '#93000a', fontWeight: 500 }}>{generalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#464555', letterSpacing: '0.025em', marginBottom: '0.5rem' }}
                >
                  Email address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#777587', fontSize: '1.25rem' }}>
                    mail
                  </span>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@university.edu"
                    autoComplete="email"
                    style={{
                      display: 'block',
                      width: '100%',
                      paddingLeft: '3rem',
                      paddingRight: '1rem',
                      paddingTop: '1rem',
                      paddingBottom: '1rem',
                      backgroundColor: '#edeeef',
                      border: errors.email ? '2px solid #ba1a1a' : '2px solid transparent',
                      borderRadius: '1rem',
                      color: '#191c1d',
                      outline: 'none',
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.3)';
                      if (!errors.email) e.target.style.borderColor = '#4f46e5';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      if (!errors.email) e.target.style.borderColor = 'transparent';
                    }}
                  />
                </div>
                {errors.email && (
                  <p style={{ fontSize: '0.75rem', marginTop: '0.375rem', color: '#ba1a1a', fontWeight: 500 }}>{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#464555', letterSpacing: '0.025em', marginBottom: '0.5rem' }}
                >
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute" style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#777587', fontSize: '1.25rem' }}>
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={{
                      display: 'block',
                      width: '100%',
                      paddingLeft: '3rem',
                      paddingRight: '3rem',
                      paddingTop: '1rem',
                      paddingBottom: '1rem',
                      backgroundColor: '#edeeef',
                      border: errors.password ? '2px solid #ba1a1a' : '2px solid transparent',
                      borderRadius: '1rem',
                      color: '#191c1d',
                      outline: 'none',
                      fontSize: '0.95rem',
                      transition: 'all 0.2s ease',
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = '0 0 0 2px rgba(79, 70, 229, 0.3)';
                      if (!errors.password) e.target.style.borderColor = '#4f46e5';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      if (!errors.password) e.target.style.borderColor = 'transparent';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute flex items-center"
                    style={{
                      right: '1rem', top: '50%', transform: 'translateY(-50%)',
                      color: '#777587', background: 'none', border: 'none', cursor: 'pointer',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#3525cd')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#777587')}
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <p style={{ fontSize: '0.75rem', marginTop: '0.375rem', color: '#ba1a1a', fontWeight: 500 }}>{errors.password}</p>
                )}
              </div>
            </div>

            {/* Remember me / Forgot */}
            <div className="flex items-center justify-between" style={{ marginTop: '1.25rem' }}>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe((v) => !v)}
                  style={{
                    width: '1.125rem', height: '1.125rem',
                    borderRadius: '0.25rem',
                    border: '1px solid #c7c4d8',
                    backgroundColor: rememberMe ? '#3525cd' : '#edeeef',
                    accentColor: '#3525cd',
                  }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#464555', transition: 'color 0.2s' }}>
                  Remember me
                </span>
              </label>
              <a
                href="#"
                style={{ fontSize: '0.875rem', fontWeight: 600, color: '#3525cd', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#4f46e5')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#3525cd')}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
              style={{
                marginTop: '2rem',
                background: 'linear-gradient(135deg, #3525cd 0%, #4f46e5 100%)',
                color: '#ffffff',
                fontWeight: 700,
                padding: '1rem 1.5rem',
                borderRadius: '1rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s ease',
                fontSize: '1rem',
                boxShadow: '0 10px 20px -10px rgba(53, 37, 205, 0.4)',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = '0 15px 25px -10px rgba(53, 37, 205, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 20px -10px rgba(53, 37, 205, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
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
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Signing in…</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          {/* Register link */}
          <p
            className="text-center"
            style={{ marginTop: '2.5rem', fontSize: '0.875rem', color: '#464555', fontWeight: 500 }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: '#3525cd', fontWeight: 700, textDecoration: 'none' }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;