export default function Input({ label, id, error, as: Tag = 'input', ...props }) {
  const inputId = id || props.name;
  return (
    <div className="field">
      {label && <label htmlFor={inputId}>{label}</label>}
      <Tag id={inputId} aria-invalid={Boolean(error)} {...props} />
      {error && <span className="text-gold" style={{ fontSize: '0.75rem' }}>{error}</span>}
    </div>
  );
}
