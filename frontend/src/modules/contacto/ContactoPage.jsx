import { useState } from 'react';
import { Mail, MapPin, Phone, CheckCircle2, AlertCircle } from '@/shared/icons';
import api from '@/shared/api/apiClient';
import { endpoints } from '@/shared/api/endpoints';
import Button from '@/shared/components/Button';
import Input from '@/shared/components/Input';

const VACIO = { nombre: '', email: '', mensaje: '' };

export default function ContactoPage() {
  const [form, setForm] = useState(VACIO);
  const [estado, setEstado] = useState(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await api.post(endpoints.contacto, form);
      setEstado('¡Mensaje enviado! Te responderemos pronto.');
      setForm(VACIO);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="container section">
      <span className="eyebrow">Hablemos</span>
      <h2 className="section-title">Cuéntanos tu proyecto</h2>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div className="card">
          <h3>Información de contacto</h3>
          <p className="row"><MapPin size={16} className="text-gold" /> Popayán, Cauca — Colombia</p>
          <p className="row"><Mail size={16} className="text-gold" /> hola@hiloystilo.local</p>
          <p className="row"><Phone size={16} className="text-gold" /> +57 300 000 0000</p>
          <p className="muted" style={{ fontSize: '0.85rem' }}>
            Atendemos a talleres, diseñadores y emprendedores textiles de la región.
          </p>
        </div>

        <div className="card">
          <form onSubmit={onSubmit} className="stack">
            <Input
              label="Tu nombre"
              name="nombre"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <Input
              label="Correo electrónico"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Mensaje"
              name="mensaje"
              as="textarea"
              rows={4}
              required
              value={form.mensaje}
              onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
            />
            {error && <div className="error-box"><AlertCircle size={16} /> {error}</div>}
            {estado && <p className="text-gold row"><CheckCircle2 size={16} /> {estado}</p>}
            <Button type="submit" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Enviar mensaje'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
