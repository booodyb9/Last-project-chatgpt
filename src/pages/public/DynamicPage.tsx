import {useParams} from 'react-router-dom'; import PageShell from './PageShell';
export default function DynamicPage(){const {slug}=useParams();return <PageShell><section className="max-w-4xl mx-auto px-4 py-16"><h1 className="text-4xl font-bold mb-6">{slug?.replace(/-/g,' ')}</h1><p className="text-gray-600">صفحة معلومات من زجاج الرياض.</p></section></PageShell>}
