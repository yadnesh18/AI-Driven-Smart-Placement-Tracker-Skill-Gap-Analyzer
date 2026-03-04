import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName) errs.fullName = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(form.email))
      errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6)
      errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match';
    if (!form.role) errs.role = 'Role is required';
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
      // after successful registration, redirect to login
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center
                    bg-gradient-to-br from-gray-900 via-indigo-900 to-black
                    relative overflow-hidden px-4 py-12">
      {/* ambient blobs & overlay could be copied from Login if desired */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 px-8 py-10">
          <h2 className="text-white text-2xl font-semibold mb-1 text-center">
            Create an account
          </h2>
          <p className="text-slate-400 text-sm mb-8 text-center">
            Fill in the form to start your journey
          </p>
          {generalError && (
            <p className="text-red-600 text-center mb-4">{generalError}</p>
          )}
          <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="w-full bg-white/5 border rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-600 outline-none transition-all duration-150 focus:bg-white/8 focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-white/5 border rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-600 outline-none transition-all duration-150 focus:bg-white/8 focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-white/5 border rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-600 outline-none transition-all duration-150 focus:bg-white/8 focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-1"
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full bg-white/5 border rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-600 outline-none transition-all duration-150 focus:bg-white/8 focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>
          <div className="mb-6">
            <label htmlFor="role" className="block text-sm font-medium mb-1">
              Role
            </label>
            <select
              name="role"
              id="role"
              value={form.role}
              onChange={handleChange}
              className="w-full bg-white/5 border rounded-lg px-4 py-2.5 text-white text-sm placeholder-slate-600 outline-none transition-all duration-150 focus:bg-white/8 focus:ring-2 focus:border-indigo-500 focus:ring-indigo-500/20"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg py-3 transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-px active:translate-y-0"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-150 underline underline-offset-2">
            Login
          </Link>
        </p>
        </div> {/* end card */}
      </div>
    </div>
  );
};

export default Register;