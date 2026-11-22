import { Boxes } from '@/shared/icons';

export default function EmptyState({ title = 'No hay datos', message, icon: Icon = Boxes }) {
  return (
    <div className="empty-state">
      <Icon size={36} aria-hidden="true" />
      <h4>{title}</h4>
      {message && <p>{message}</p>}
    </div>
  );
}
