export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12"><div className="w-full rounded-2xl bg-white p-6 shadow-card sm:p-8">{children}</div></div>;
}
