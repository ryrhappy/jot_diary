import {useTranslations} from 'next-intl';
 
export default function NotFound() {
  const t = useTranslations('Index');
 
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-slate-500">Page not found</p>
    </div>
  );
}

