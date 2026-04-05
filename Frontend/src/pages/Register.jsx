import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    role: 'student',
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

  const inputBaseStyle = (hasError) => ({
    display: 'block',
    width: '100%',
    padding: '1rem 1.25rem',
    backgroundColor: '#edeeef',
    border: hasError ? '2px solid #ba1a1a' : '2px solid transparent',
    borderRadius: '1rem',
    color: '#191c1d',
    outline: 'none',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'all 0.2s ease',
  });

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f8f9fa' }}
    >
      {/* ── LEFT: VISUAL BRANDING ── */}
      <section
        className="hidden md:flex md:w-1/2 lg:w-3/5 relative items-end overflow-hidden"
        style={{ backgroundColor: '#3525cd', padding: '3rem 3rem 4rem' }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            alt="University campus"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5HWJHJty_GAEvcUTsKT_L_8_ehSb1PLV1QSmSKIeDk22r63pbMJk9lOWlDuOOn2J_ClBLKCuMgKJ3Oc-kWhqw_Hu6Y2aPtuhOIE1rY_ZFQRyGZNZyyGlruImIoEdPrAYMCbpy31ifcmdNMOFl20JKsW2P5Vd3egOpsZZjr0xxgf_o8LeyHXUR1qNe_L50lXqX62vx_LQ57IYbHqOG3OYIqB4dccdvC4dYAWDnUEKQ55HH1uWJ-IFkewSO5NkrExvJIPFSJin_nQ"
            className="w-full h-full"
            style={{ objectFit: 'cover', opacity: 0.6, mixBlendMode: 'overlay' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top right, #3525cd, rgba(53,37,205,0.8), transparent)' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10" style={{ maxWidth: '36rem' }}>
          <div
            className="inline-flex items-center gap-2"
            style={{
              marginBottom: '2rem',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(199,196,216,0.15)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#3525cd',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>stars</span>
            Curating Futures
          </div>
          <h1
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '3.5rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '1.5rem',
            }}
          >
            Your Career,<br />Elevated.
          </h1>
          <p
            style={{
              color: '#e2dfff',
              fontSize: '1.125rem',
              fontWeight: 500,
              lineHeight: 1.7,
              opacity: 0.9,
              marginBottom: '3rem',
            }}
          >
            Join the premier placement ecosystem designed to transform academic potential into professional prestige.
          </p>
          {/* Floating Merit Badge */}
          <div
            className="inline-flex items-center gap-4"
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(199,196,216,0.15)',
              borderRadius: '1.5rem',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(53,37,205,0.04)',
              transition: 'transform 0.3s',
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '1rem',
                backgroundColor: '#ffffff',
                color: '#3525cd',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>verified</span>
            </div>
            <div>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: '#191c1d' }}>
                Top Tier Network
              </div>
              <div style={{ color: '#464555', fontSize: '0.875rem' }}>Over 500+ Partner Companies</div>
            </div>
          </div>
        </div>

        {/* Decorative blur */}
        <div
          className="absolute rounded-full"
          style={{ top: 0, right: 0, width: '16rem', height: '16rem', background: 'rgba(255,255,255,0.05)', filter: 'blur(80px)', marginRight: '-8rem', marginTop: '-8rem' }}
        />
      </section>

      {/* ── RIGHT: REGISTER FORM ── */}
      <section
        className="flex-1 flex flex-col justify-center relative"
        style={{ padding: '3rem 2rem', backgroundColor: '#f8f9fa' }}
      >
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-3" style={{ marginBottom: '3rem' }}>
          <div
            className="flex items-center justify-center"
            style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', backgroundColor: '#3525cd', color: '#fff' }}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '1.25rem', color: '#191c1d' }}>
            ScholarFlow
          </span>
        </div>

        {/* Desktop Brand Logo */}
        <div className="hidden md:flex absolute items-center gap-2" style={{ top: '3rem', right: '3rem' }}>
          <div
            className="flex items-center justify-center"
            style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: '#3525cd', color: '#fff', fontSize: '0.75rem', fontWeight: 900 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>school</span>
          </div>
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#191c1d' }}>
            ScholarFlow
          </span>
        </div>

        <div className="w-full mx-auto" style={{ maxWidth: '28rem' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#191c1d' }}>
              Create Account
            </h2>
            <p style={{ color: '#464555', fontWeight: 500, marginTop: '0.5rem' }}>
              Start your journey toward a high-value career path.
            </p>
          </div>

          {/* Error */}
          {generalError && (
            <div
              className="flex items-start gap-3"
              style={{ borderRadius: '1rem', padding: '0.875rem 1rem', marginBottom: '1.5rem', backgroundColor: '#ffdad6' }}
            >
              <span className="material-symbols-outlined" style={{ color: '#ba1a1a', fontSize: '1.25rem', marginTop: '0.125rem' }}>error</span>
              <p style={{ fontSize: '0.875rem', color: '#93000a', fontWeight: 500 }}>{generalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '0.5rem' }}>
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Alex Sterling"
                    style={inputBaseStyle(errors.fullName)}
                    onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(53,37,205,0.1)'; e.target.style.backgroundColor = '#ffffff'; }}
                    onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#edeeef'; }}
                  />
                  <div className="absolute flex items-center" style={{ right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#c7c4d8' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>person</span>
                  </div>
                </div>
                {errors.fullName && <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#ba1a1a', fontWeight: 500 }}>{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="alex@university.edu"
                    style={inputBaseStyle(errors.email)}
                    onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(53,37,205,0.1)'; e.target.style.backgroundColor = '#ffffff'; }}
                    onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#edeeef'; }}
                  />
                  <div className="absolute flex items-center" style={{ right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#c7c4d8' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>mail</span>
                  </div>
                </div>
                {errors.email && <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#ba1a1a', fontWeight: 500 }}>{errors.email}</p>}
              </div>

              {/* Role Toggle (Bento) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '0.75rem' }}>
                  Professional Identity
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="cursor-pointer">
                    <input type="radio" name="role" value="student" checked={form.role === 'student'} onChange={handleChange} className="sr-only" />
                    <div
                      className="flex flex-col items-center gap-2 text-center"
                      style={{
                        padding: '1rem',
                        borderRadius: '1rem',
                        backgroundColor: form.role === 'student' ? '#e2dfff' : '#edeeef',
                        border: form.role === 'student' ? '2px solid rgba(53,37,205,0.2)' : '2px solid transparent',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ color: form.role === 'student' ? '#3525cd' : '#464555' }}>school</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: form.role === 'student' ? '#3525cd' : '#464555' }}>Student</span>
                    </div>
                  </label>
                  <label className="cursor-pointer">
                    <input type="radio" name="role" value="admin" checked={form.role === 'admin'} onChange={handleChange} className="sr-only" />
                    <div
                      className="flex flex-col items-center gap-2 text-center"
                      style={{
                        padding: '1rem',
                        borderRadius: '1rem',
                        backgroundColor: form.role === 'admin' ? '#e2dfff' : '#edeeef',
                        border: form.role === 'admin' ? '2px solid rgba(53,37,205,0.2)' : '2px solid transparent',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ color: form.role === 'admin' ? '#3525cd' : '#464555' }}>admin_panel_settings</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: form.role === 'admin' ? '#3525cd' : '#464555' }}>Admin</span>
                    </div>
                  </label>
                </div>
                {errors.role && <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#ba1a1a', fontWeight: 500 }}>{errors.role}</p>}
              </div>

              {/* Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '0.5rem' }}>
                  Secure Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    style={inputBaseStyle(errors.password)}
                    onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(53,37,205,0.1)'; e.target.style.backgroundColor = '#ffffff'; }}
                    onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#edeeef'; }}
                  />
                  <div className="absolute flex items-center" style={{ right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#c7c4d8' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>lock</span>
                  </div>
                </div>
                {errors.password && <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#ba1a1a', fontWeight: 500 }}>{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#777587', marginBottom: '0.5rem' }}>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    style={inputBaseStyle(errors.confirmPassword)}
                    onFocus={(e) => { e.target.style.boxShadow = '0 0 0 3px rgba(53,37,205,0.1)'; e.target.style.backgroundColor = '#ffffff'; }}
                    onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.backgroundColor = '#edeeef'; }}
                  />
                  <div className="absolute flex items-center" style={{ right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#c7c4d8' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>autorenew</span>
                  </div>
                </div>
                {errors.confirmPassword && <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#ba1a1a', fontWeight: 500 }}>{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
              style={{
                marginTop: '1.5rem',
                background: 'linear-gradient(135deg, #3525cd 0%, #4f46e5 100%)',
                color: '#ffffff',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                padding: '1rem 1.5rem',
                borderRadius: '9999px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s ease',
                fontSize: '1rem',
                boxShadow: '0 20px 25px -5px rgba(53,37,205,0.04), 0 8px 10px -6px rgba(53,37,205,0.04)',
              }}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
              {!loading && <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>arrow_forward</span>}
            </button>
          </form>

          {/* Footer */}
          <p
            className="text-center"
            style={{ marginTop: '2.5rem', fontSize: '0.875rem', color: '#464555', fontWeight: 500 }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: '#3525cd', fontWeight: 700, textDecoration: 'none', marginLeft: '0.25rem' }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Sign In
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Register;