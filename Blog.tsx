import { Link } from 'react-router-dom';
import LazyImage from './LazyImage';
import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Calendar, ArrowLeft } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
import { useLanguage } from '../contexts/LanguageContext';

const defaultBlogPosts = [
  {
    category: 'دليل تقني',
    title: 'دليلك الشامل لاختيار الزجاج المناسب لكبائن الشاور',
    excerpt: 'تعرف على الفرق بين زجاج السيكوريت والزجاج العادي، وأهمية السماكة المناسبة لضمان الأمان والاناقة في حمامك.',
    date: '2024-05-15',
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    category: 'اتجاهات الصناعة',
    title: 'مستقبل الواجهات الزجاجية الذكية في المعمار الحديث',
    excerpt: 'كيف تساهم التقنيات الحديثة في صناعة زجاج يتحكم بالحرارة والضوء لتقليل استهلاك الطاقة في المباني الكبرى.',
    date: '2024-05-10',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  },
  {
    category: 'دراسة حالة',
    title: 'تحويل مساحة مكتبية مغلقة إلى بيئة عمل مفتوحة ومشرقة',
    excerpt: 'نستعرض كيف ساهمت قواطع الزجاج المزدوجة في تحسين الإضاءة الطبيعية والإنتاجية في مقر شركة تقنية بالرياض.',
    date: '2024-05-02',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  }
];

export default function Blog() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { getContent } = useContent();
  const introContent = getContent('blog_intro');
  const itemsContent = getContent('blog_items');

  const blogPosts = useMemo(() => {
    if (itemsContent?.body) {
      try {
        const parsed = JSON.parse(itemsContent.body);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error("Failed to parse blog items", e);
      }
    }
    return defaultBlogPosts;
  }, [itemsContent]);

  return (
    <section id="blog" className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-[#0ea5e9] text-sm font-bold tracking-widest uppercase mb-4">
            {isAr ? 'المدونة والمعرفة' : 'Blog & Knowledge'}
          </h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] leading-tight mb-6 tracking-tight">
            {isAr ? 'أحدث المقالات' : 'Latest Articles'} والنصائح
          </h3>
          
          {introContent?.body ? (
            <div className="prose prose-lg mx-auto text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: introContent.body }} />
          ) : (
            <p className="text-gray-600 leading-relaxed text-lg mb-8">
              اكتشف أحدث اتجاهات صناعة الزجاج، واقرأ أدلة تقنية تساعدك في اتخاذ قرارات أفضل لمشروعك.
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 group flex flex-col"
            >
              <div className="relative h-48 overflow-hidden bg-gray-200">
                {post.image && typeof post.image === 'string' && post.image.trim() !== '' && (
                  <LazyImage 
                    src={post.image}
                    alt={post.title || 'صورة'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-[#0ea5e9] text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
                  {post.category}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center text-gray-400 text-sm mb-3">
                  <Calendar className="h-4 w-4 ml-2" />
                  <time>{post.date}</time>
                </div>
                <h4 className="text-xl font-bold text-[#0F172A] mb-3 line-clamp-2 hover:text-[#0ea5e9] transition-colors cursor-pointer">
                  {post.title}
                </h4>
                <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">
                  {post.excerpt}
                </p>
                <div className="mt-auto">
                  <Link to={`/blog/${encodeURIComponent(post.title.replace(/\s+/g, '-').toLowerCase())}`} className="flex items-center text-[#0ea5e9] font-bold group-hover:text-[#0369A1] transition-colors">
                    {isAr ? 'اقرأ المزيد' : 'Read More'}
                    <ArrowLeft className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
