import { useState } from 'react';
import api from '@/shared/api/apiClient';
import { endpoints } from '@/shared/api/endpoints';
import { useAuth } from '@/app/AuthContext';
import Button from '@/shared/components/Button';
import Input from '@/shared/components/Input';

export default function PerfilForm({ usuario }) {
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({
    nombre: usuario.nombre || '',
    telefono: usuario.telefono || '',
    direccion: usuario.direccion || '',
    ciudad: usuario.ciudad || '',
    barrio: usuario.barrio || '',
    nombre_taller: usuario.nombre_taller || '',
  });
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setGuardado(false);
    try {
      await api.patch(endpoints.me, form);
      await refreshUser();
      setGuardado(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const campo = (nombre, label) => (
    <Input
      key={nombre}
      label={label}
      name={nombre}
      value={form[nombre] || ''}
      onChange={(event) => setForm({ ...form, [nombre]: event.target.value })}
    />
  );

  return (
    <form className="perfil-form" onSubmit={onSubmit}>
      {campo('nombre', 'Nombre')}
      {campo('telefono', 'Teléfono')}
      {campo('nombre_taller', 'Nombre del taller')}
      {campo('direccion', 'Dirección')}
      {campo('ciudad', 'Ciudad')}
      {campo('barrio', 'Barrio')}
      {error && <div className="error-box">{error}</div>}
      {guardado && <p className="text-gold">Perfil actualizado.</p>}
      <Button type="submit">Guardar cambios</Button>
    </form>
  );
}
