import {useParams} from 'react-router-dom'; import PageShell from './PageShell'; import Blog from '../../components/Blog';
export default function BlogDetails(){const {slug}=useParams(); return <PageShell><article className="max-w-4xl mx-auto px-4 py-12"><h1 className="text-4xl font-bold mb-4">مدونة زجاج الرياض</h1><p className="text-gray-600">{slug}</p></article><Blog/></PageShell>}
