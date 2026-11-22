import { useCallback, useState } from 'react';
import { useAsync } from '@/shared/hooks/useAsync';
import { useAuth } from '@/app/AuthContext';
import api from '@/shared/api/apiClient';
import { endpoints } from '@/shared/api/endpoints';
import Button from '@/shared/components/Button';
import Input from '@/shared/components/Input';
import Modal from '@/shared/components/Modal';
import Spinner from '@/shared/components/Spinner';
import { Plus, Edit2 } from '@/shared/icons';
import { ROLES_EMPLEADO, ROLES_LABELS } from '@/shared/utils/constants';
import { dateTime } from '@/shared/utils/dates';
import './admin.css';

const VACIO = {
  nombre: '', email: '', password: '', telefono: '', ciudad: 'Popayán',
  rol: ROLES_EMPLEADO[1],
};

export default function UsuariosAdminPage() {
  const cargar = useCallback(
    () => api.get(endpoints.adminUsuarios, { params: { limit: 100 } }),
    []
  );
  const { data, loading, error, reload } = useAsync(cargar, [cargar]);
  const { user } = useAuth();
  const [form, setForm] = useState(VACIO);
  const [editando, setEditando] = useState(null);
  const [modal, setModal] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [errorForm, setErrorForm] = useState({});

  const abrirNuevo = () => { setForm(VACIO); setEditando(null); setErrorForm({}); setModal(true); };
  const abrirEditar = (usuario) => {
    setForm({
      nombre: usuario.nombre || '',
      email: usuario.email,
      password: '',
      telefono: usuario.telefono || '',
      ciudad: usuario.ciudad || 'Popayán',
      rol: usuario.rol,
    });
    setEditando(usuario.id);
    setErrorForm({});
    setModal(true);
  };

  const guardar = async (event) => {
    event.preventDefault();
    setMensaje('');
    setErrorForm({});
    const payload = { ...form };
    if (!payload.password) delete payload.password;
    try {
      if (editando) await api.patch(endpoints.adminUsuario(editando), payload);
      else await api.post(endpoints.adminUsuarios, payload);
      setModal(false);
      reload();
    } catch (err) {
      if (err.details && typeof err.details === 'object') setErrorForm(err.details);
      else setMensaje(err.message);
    }
  };

  const cambiarEstado = async (usuario) => {
    setMensaje('');
    try {
      await api.patch(endpoints.adminUsuarioEstado(usuario.id), {
        activo: !usuario.activo,
      });
      reload();
    } catch (err) {
      setMensaje(err.message);
    }
  };

  const campo = (nombre, label, tipo = 'text', extra = {}) => (
    <Input
      label={label}
      name={nombre}
      type={tipo}
      required={extra.required}
      value={form[nombre] || ''}
      error={errorForm[nombre]?.[0]}
      onChange={(e) => setForm({ ...form, [nombre]: e.target.value })}
    />
  );

  return (
    <div>
      <header className="admin-page-header">
        <h2>Usuarios y empleados</h2>
        <p>Gestiona cuentas operativas, roles y estados de acceso.</p>
      </header>

      <div className="admin-toolbar">
        <strong>{data?.meta?.total || 0} cuentas operativas</strong>
        <Button onClick={abrirNuevo}><Plus size={15} /> Nuevo empleado</Button>
      </div>

      {mensaje && <div className="error-box">{mensaje}</div>}
      {loading && <Spinner />}
      {error && <div className="error-box">{error.message}</div>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th><th>Correo</th><th>Rol</th>
                <th>Estado</th><th>Creado</th><th></th>
              </tr>
            </thead>
            <tbody>
              {(data?.data || []).map((usuario) => {
                const propio = usuario.id === user?.id;
                return (
                  <tr key={usuario.id}>
                    <td><strong>{usuario.nombre || '—'}</strong></td>
                    <td>{usuario.email}</td>
                    <td><span className="badge">{ROLES_LABELS[usuario.rol] || usuario.rol}</span></td>
                    <td>
                      <span className={`badge ${usuario.activo ? 'badge--success' : 'badge--danger'}`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>{dateTime(usuario.created_at)}</td>
                    <td>
                      <div className="acciones-tabla">
                        <button onClick={() => abrirEditar(usuario)} aria-label="Editar usuario"><Edit2 size={14} /></button>
                        <button
                          onClick={() => cambiarEstado(usuario)}
                          disabled={propio}
                          title={propio ? 'No puedes cambiar tu propio estado' : ''}
                        >
                          {usuario.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editando ? 'Editar empleado' : 'Nuevo empleado'}>
        <form className="stack" onSubmit={guardar}>
          {campo('nombre', 'Nombre', 'text', { required: true })}
          {campo('email', 'Correo electrónico', 'email', { required: true })}
          {campo('password', editando ? 'Nueva contraseña (opcional)' : 'Contraseña', 'password', { required: !editando })}
          <div className="field">
            <label htmlFor="rol-empleado">Rol</label>
            <select
              id="rol-empleado"
              name="rol"
              value={form.rol}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
            >
              {ROLES_EMPLEADO.map((rol) => (
                <option key={rol} value={rol}>{ROLES_LABELS[rol]}</option>
              ))}
            </select>
          </div>
          <div className="admin-form-grid">
            {campo('telefono', 'Teléfono')}
            {campo('ciudad', 'Ciudad')}
          </div>
          {errorForm.non_field_errors?.[0] && <div className="error-box">{errorForm.non_field_errors[0]}</div>}
          <Button type="submit">{editando ? 'Guardar cambios' : 'Crear empleado'}</Button>
        </form>
      </Modal>
    </div>
  );
}
