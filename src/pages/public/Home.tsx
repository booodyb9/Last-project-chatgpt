import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import BrandIntro from '../../components/BrandIntro';
import GallerySlider from '../../components/GallerySlider';
import Services from '../../components/Services';
import Features from '../../components/Features';
import Gallery from '../../components/Gallery';
import Blog from '../../components/Blog';
import Testimonials from '../../components/Testimonials';
import FAQ from '../../components/FAQ';
import Contact from '../../components/Contact';
import Footer from '../../components/Footer';

export default function Home(){
  return (
    <>
      <Navbar/>
      <Hero/>
      <BrandIntro/>
      <GallerySlider/>
      <Services/>
      <Features/>
      <Gallery/>
      <Blog/>
      <Testimonials/>
      <FAQ/>
      <Contact/>
      <Footer/>
    </>
  );
}
