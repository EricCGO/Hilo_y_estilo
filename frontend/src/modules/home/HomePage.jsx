import Hero from './Hero';
import TalentoSection from './TalentoSection';
import ProductosColabSection from './ProductosColabSection';
import ModaCaucanaSection from './ModaCaucanaSection';
import './home.css';

export default function HomePage() {
  return (
    <>
      <Hero />
      <TalentoSection />
      <ProductosColabSection />
      <ModaCaucanaSection />
    </>
  );
}
