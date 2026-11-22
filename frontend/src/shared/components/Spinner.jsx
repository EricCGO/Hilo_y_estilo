export default function Spinner({ label = 'Cargando…' }) {
  return (
    <div className="loading-block" role="status" aria-live="polite">
      <div>
        <div className="spinner" />
        <p className="muted center">{label}</p>
      </div>
    </div>
  );
}
