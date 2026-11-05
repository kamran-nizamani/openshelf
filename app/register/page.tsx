import Link from 'next/link';
import { RegisterForm } from '@/components/AuthForms';

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid w-full overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-soft lg:grid-cols-2">
        <div className="bg-brand-500 p-10 text-white">
          <p className="text-xs uppercase tracking-[0.25em] text-brand-100">Create account</p>
          <h1 className="mt-4 text-4xl font-black">Join the OpenShelf community.</h1>
          <p className="mt-4 text-lg text-brand-50">Discover books, upload legally, and build a personal reading library.</p>
        </div>

        <div className="p-8 sm:p-10">
          <h2 className="text-3xl font-bold text-slate-900">Sign up</h2>
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
