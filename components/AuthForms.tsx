'use client';

import { FormEvent, useState } from 'react';

export function LoginForm() {
  const [message, setMessage] = useState('');
  const [resetMode, setResetMode] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(resetMode
      ? 'Password reset will be available when email authentication is connected.'
      : 'Sign-in is not connected yet. Your credentials were not sent or stored.');
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      {resetMode ? (
        <p className="text-sm leading-6 text-slate-600">Enter your email and we will send a reset link after authentication is configured.</p>
      ) : null}
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
        <input required name="email" type="email" autoComplete="email" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="name@example.com" />
      </label>
      {!resetMode ? (
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
          <input required name="password" type="password" autoComplete="current-password" minLength={8} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="Enter your password" />
        </label>
      ) : null}
      {!resetMode ? (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <label className="flex items-center gap-2"><input name="remember" type="checkbox" className="rounded border-slate-300 text-brand-500 focus:ring-brand-500" /> Remember me</label>
          <button type="button" onClick={() => { setResetMode(true); setMessage(''); }} className="font-medium text-brand-600 hover:text-brand-700">Forgot password?</button>
        </div>
      ) : null}
      {message ? <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</p> : null}
      <button type="submit" className="w-full rounded-full bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600">{resetMode ? 'Send reset link' : 'Login'}</button>
      {resetMode ? <button type="button" onClick={() => { setResetMode(false); setMessage(''); }} className="w-full text-sm font-medium text-slate-500 hover:text-slate-800">Back to login</button> : null}
    </form>
  );
}

export function RegisterForm() {
  const [message, setMessage] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (formData.get('password') !== formData.get('confirmPassword')) {
      setMessage('Passwords do not match.');
      return;
    }
    setMessage('Account creation is not connected yet. Your information was not sent or stored.');
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
        <input required name="fullName" autoComplete="name" maxLength={100} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="Your full name" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
        <input required name="email" type="email" autoComplete="email" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="name@example.com" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
        <input required name="password" type="password" autoComplete="new-password" minLength={8} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="At least 8 characters" />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Confirm password</span>
        <input required name="confirmPassword" type="password" autoComplete="new-password" minLength={8} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" placeholder="Enter your password again" />
      </label>
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
        <input required name="terms" type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500" />
        <span>I agree to the <a href="/terms" className="font-medium text-brand-600 hover:underline">terms of service</a> and <a href="/copyright-policy" className="font-medium text-brand-600 hover:underline">copyright policy</a>.</span>
      </label>
      {message ? <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</p> : null}
      <button type="submit" className="w-full rounded-full bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600">Create account</button>
    </form>
  );
}
