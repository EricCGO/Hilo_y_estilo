import { Camera, Users, Music2 } from '@/shared/icons';

export default function Piepagina() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p>© {new Date().getFullYear()} Hilo y Estilo. Todos los derechos reservados.</p>
        <div className="site-footer__social">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><Camera size={16} /></a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><Users size={16} /></a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok"><Music2 size={16} /></a>
        </div>
      </div>
    </footer>
  );
}
