import Link from 'next/link';
import { LoginForm } from '@/components/AuthForms';

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-soft lg:grid-cols-2">
        <div className="bg-brand-900 p-10 text-white">
          <p className="text-xs uppercase tracking-[0.25em] text-brand-100">Welcome back</p>
          <h1 className="mt-4 text-4xl font-black">Your next chapter starts here.</h1>
          <p className="mt-4 text-lg text-brand-100">Sign in to save books, track your reading, and share knowledge.</p>
        </div>

        <div className="p-8 sm:p-10">
          <h2 className="text-3xl font-bold text-slate-900">Login</h2>
          <LoginForm />
          <p className="mt-6 text-center text-sm text-slate-500">New to OpenShelf? <Link href="/register" className="font-semibold text-brand-600 hover:underline">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}
