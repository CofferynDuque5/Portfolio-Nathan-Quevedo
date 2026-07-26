import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-4 text-center dark:bg-[#09090f]">
      <div>
        <p className="text-7xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-4 text-2xl font-bold">Página no encontrada</h1>
        <p className="mt-2 text-slate-500">La página que buscas no existe o fue movida.</p>
        <Link href="/" className="btn-primary mt-6 inline-flex">Volver al inicio</Link>
      </div>
    </div>
  );
}
