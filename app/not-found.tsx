import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-app pt-32 pb-16 text-center">
      <div className="text-[64px] font-bold text-[var(--text-placeholder)] mb-2">404</div>
      <h1 className="text-heading text-[18px] mb-2">Page not found</h1>
      <p className="text-[14px] text-[var(--text-tertiary)] mb-8 max-w-sm mx-auto">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex justify-center gap-3">
        <Link href="/" className="btn btn-md btn-primary">Go home</Link>
        <Link href="/search" className="btn btn-md btn-secondary">Search papers</Link>
      </div>
    </div>
  );
}
