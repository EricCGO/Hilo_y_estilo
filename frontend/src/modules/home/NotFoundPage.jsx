import { Link } from 'react-router';
import { Compass } from '@/shared/icons';

export default function NotFoundPage() {
  return (
    <div className="container section center">
      <Compass size={56} className="text-gold" />
      <h2>Página no encontrada</h2>
      <p>La ruta que buscas no existe o fue movida.</p>
      <Link to="/" className="btn btn--primary">Volver al inicio</Link>
    </div>
  );
}
