import { ChevronLeft, ChevronRight } from '@/shared/icons';

export default function Pagination({ meta, onPage }) {
  if (!meta || meta.totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button
        onClick={() => onPage(meta.page - 1)}
        disabled={!meta.previous}
        aria-label="Página anterior"
      >
        <ChevronLeft size={16} />
      </button>
      <span>Página {meta.page} de {meta.totalPages} · {meta.total} resultados</span>
      <button
        onClick={() => onPage(meta.page + 1)}
        disabled={!meta.next}
        aria-label="Página siguiente"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
