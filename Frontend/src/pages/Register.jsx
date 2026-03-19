import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName) errs.fullName = 'Required';
    if (!form.email) errs.email = 'Required';
    else if (!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(form.email))
      errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Required';
    else if (form.password.length < 6)
      errs.password = 'Min 6 chars';
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Must match';
    if (!form.role) errs.role = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      navigate('/login', { replace: true });
    } catch (err) {
      console.error(err);
      setGeneralError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    display: 'block',
    width: '100%',
    paddingLeft: '2.75rem',
    paddingRight: '1rem',
    paddingTop: '0.75rem',
    paddingBottom: '0.75rem',
    background: 'rgba(255, 255, 255, 0.03)',
    border: hasError ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '0.5rem',
    color: '#fff',
    outline: 'none',
    fontSize: '0.95rem',
    transition: 'all 0.3s ease',
  });

  const inputFocus = (e, hasError) => {
    e.target.style.boxShadow = hasError ? '0 0 0 2px rgba(239, 68, 68, 0.2)' : '0 0 0 2px rgba(59, 130, 246, 0.5)';
    e.target.style.borderColor = hasError ? '#ef4444' : '#3b82f6';
  };

  const inputBlur = (e, hasError) => {
    e.target.style.boxShadow = 'none';
    e.target.style.borderColor = hasError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)';
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
              Empowering recruiters with AI-driven insights to find the perfect match faster than ever before.
            </p>

            {/* Features */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div
                  className="rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: '#6366f1' }}>
                    psychology
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">AI Resume Analysis</h4>
                  <p className="text-sm" style={{ color: '#64748b' }}>
                    Extract deep insights from resumes automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className="rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: '#8b5cf6' }}>
                    radar
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Skill Gap Detection</h4>
                  <p className="text-sm" style={{ color: '#64748b' }}>
                    Identify missing skills in candidates instantly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div
                  className="rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: '#3b82f6' }}>
                    account_tree
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Automated Pipelines</h4>
                  <p className="text-sm" style={{ color: '#64748b' }}>
                    Move candidates through stages with zero manual effort.
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

      {/* ── RIGHT SIDE: REGISTER FORM ── */}
      <div 
        className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 relative"
        style={{
          backgroundColor: '#0a0a0c',
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.05) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      >
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-10 mt-6">
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
            maxWidth: '32rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '1rem',
            padding: '2.5rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Create an account</h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
              Join the next generation of recruitment.
            </p>
          </div>

          {generalError && (
            <div className="flex items-start gap-3 rounded-lg px-4 py-3 mb-6" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <span className="material-symbols-outlined text-lg mt-0.5" style={{ color: '#f87171' }}>error</span>
              <p className="text-sm" style={{ color: '#f87171' }}>{generalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-white">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-lg" style={{ color: '#64748b' }}>person</span>
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  style={inputStyle(errors.fullName)}
                  onFocus={(e) => inputFocus(e, errors.fullName)}
                  onBlur={(e) => inputBlur(e, errors.fullName)}
                />
              </div>
              {errors.fullName && <p className="text-xs mt-1 text-red-500">{errors.fullName}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-white">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-lg" style={{ color: '#64748b' }}>mail</span>
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  style={inputStyle(errors.email)}
                  onFocus={(e) => inputFocus(e, errors.email)}
                  onBlur={(e) => inputBlur(e, errors.email)}
                />
              </div>
              {errors.email && <p className="text-xs mt-1 text-red-500">{errors.email}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-white">Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-lg" style={{ color: '#64748b' }}>work</span>
                </div>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  style={{ ...inputStyle(errors.role), appearance: 'none' }}
                  onFocus={(e) => inputFocus(e, errors.role)}
                  onBlur={(e) => inputBlur(e, errors.role)}
                >
                  <option value="" disabled className="bg-gray-900">Select your role</option>
                  <option value="student" className="bg-gray-900 text-white">Student</option>
                  <option value="admin" className="bg-gray-900 text-white">Admin</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-lg" style={{ color: '#64748b' }}>expand_more</span>
                </div>
              </div>
              {errors.role && <p className="text-xs mt-1 text-red-500">{errors.role}</p>}
            </div>

            {/* Passwords */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-2 text-white">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-lg" style={{ color: '#64748b' }}>lock</span>
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    style={inputStyle(errors.password)}
                    onFocus={(e) => inputFocus(e, errors.password)}
                    onBlur={(e) => inputBlur(e, errors.password)}
                  />
                </div>
                {errors.password && <p className="text-xs mt-1 text-red-500">{errors.password}</p>}
              </div>

              <div className="flex-1">
                <label className="block text-sm font-semibold mb-2 text-white">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-lg" style={{ color: '#64748b' }}>autorenew</span>
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    style={inputStyle(errors.confirmPassword)}
                    onFocus={(e) => inputFocus(e, errors.confirmPassword)}
                    onBlur={(e) => inputBlur(e, errors.confirmPassword)}
                  />
                </div>
                {errors.confirmPassword && <p className="text-xs mt-1 text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ paddingTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center font-bold relative overflow-hidden"
                style={{
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  fontSize: '1rem',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                  }
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          {/* Login link */}
          <div className="text-center mt-6 text-sm" style={{ color: '#94a3b8' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;