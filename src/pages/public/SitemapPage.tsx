import {Link} from 'react-router-dom'; import PageShell from './PageShell';
const links=[['/','الرئيسية'],['/about','من نحن'],['/services','الخدمات'],['/portfolio','أعمالنا'],['/blog','المدونة'],['/faq','الأسئلة الشائعة'],['/contact','تواصل معنا']];
export default function SitemapPage(){return <PageShell><section className="max-w-4xl mx-auto px-4 py-16"><h1 className="text-4xl font-bold mb-8">خريطة الموقع</h1><div className="grid gap-3">{links.map(([to,label])=><Link key={to} to={to} className="p-4 border rounded-xl">{label}</Link>)}</div></section></PageShell>}
