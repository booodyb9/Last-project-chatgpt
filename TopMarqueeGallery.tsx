import React, { useMemo } from 'react';
import { useContent } from '../contexts/ContentContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import LazyImage from './LazyImage';

export default function TopMarqueeGallery() {
  const { getContent } = useContent();
  const portfolioContent = getContent('premium_portfolio_projects');
  
  const slides = useMemo(() => {
    let parsed = [];
    if (portfolioContent?.body) {
      try {
        parsed = JSON.parse(portfolioContent.body);
      } catch (e) {}
    }
    
    if (!parsed || parsed.length === 0) {
      return [
        {
          img: 'https://wfmmedia.com/wp-content/uploads/2024/11/Modern-Glass-Facade-Architecture.webp',
          title: 'واجهات أبراج الرياض',
          subtitle: 'FACADES'
        },
        {
          img: 'https://knrslidingdoors.com/wp-content/uploads/2024/05/IMG_3277-scaled.jpg',
          title: 'قواطع مكتبية عازلة',
          subtitle: 'PARTITIONS'
        },
        {
          img: 'https://www.glassartdesign.com/wp-content/uploads/2025/05/Glass-Shower-Enclosures.jpg',
          title: 'شاور بوكس فاخر',
          subtitle: 'SHOWER'
        },
        {
          img: 'https://glassenterprises.com/wp-content/uploads/2022/11/modern-buildings-with-glass-facade-1024x1024.jpg',
          title: 'واجهات بانورامية',
          subtitle: 'FACADES'
        },
        {
          img: 'https://www.viewrail.com/wp-content/uploads/2018/11/172A9943-scaled.jpg',
          title: 'درابزين زجاجي للسلم',
          subtitle: 'RAILINGS'
        }
      ];
    }
    
    return parsed.filter((p: any) => !p.isHidden).slice(0, 10).map((p: any) => ({
      img: p.coverImage || p.image || 'https://wfmmedia.com/wp-content/uploads/2024/11/Modern-Glass-Facade-Architecture.webp',
      title: p.title,
      subtitle: p.category || 'PROJECT'
    }));
  }, [portfolioContent]);

  return (
    <section className="bg-[#0a0a0a] py-12 overflow-hidden border-b border-white/10">
      <div className="w-full">
        <Swiper
          slidesPerView="auto"
          spaceBetween={24}
          loop={true}
          speed={4000}
          allowTouchMove={false}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
          }}
          modules={[Autoplay]}
          className="w-full continuous-swiper"
        >
          {slides.map((slide: any, index: number) => (
            <SwiperSlide key={index} className="!w-[280px] md:!w-[380px] aspect-[4/3] relative rounded-xl overflow-hidden group cursor-pointer" >
              <LazyImage src={slide.img} alt={slide.title} className="!absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="!absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 opacity-80 transition-opacity group-hover:opacity-100">
                <span className="text-[#0284C7] font-bold text-xs tracking-wider uppercase mb-1">{slide.subtitle}</span>
                <h3 className="text-white text-lg font-bold">{slide.title}</h3>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
