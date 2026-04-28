import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-app pt-32 pb-16 text-center max-w-lg mx-auto">
      <div className="text-[80px] font-bold text-[var(--text-placeholder)] tracking-tighter leading-none mb-4">
        404
      </div>
      <h1 className="text-heading text-[20px] mb-2">This page wandered off</h1>
      <p className="text-[14px] text-[var(--text-tertiary)] mb-8">
        The link you followed may be broken, or the page may have been moved. Try heading back home or
        searching the literature directly.
      </p>
      <div className="flex justify-center gap-3 flex-wrap">
        <Link href="/" className="btn btn-md btn-primary">Go home</Link>
        <Link href="/search" className="btn btn-md btn-secondary">Search papers</Link>
      </div>
    </div>
  );
}
