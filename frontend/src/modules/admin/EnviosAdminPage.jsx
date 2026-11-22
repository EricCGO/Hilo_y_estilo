import { useCallback, useState } from 'react';
import { useAsync } from '@/shared/hooks/useAsync';
import api from '@/shared/api/apiClient';
import { endpoints } from '@/shared/api/endpoints';
import Button from '@/shared/components/Button';
import Input from '@/shared/components/Input';
import Modal from '@/shared/components/Modal';
import Badge from '@/shared/components/Badge';
import Spinner from '@/shared/components/Spinner';
import { Edit2 } from '@/shared/icons';
import { ESTADOS_ENVIO, TRANSICIONES_ENVIO } from '@/shared/utils/constants';
import { dateOnly } from '@/shared/utils/dates';
import './admin.css';

const VACIO = { pedido_id: '', transportadora: '', numero_guia: '', fecha_estimada: '' };

export default function EnviosAdminPage() {
  const cargar = useCallback(() => api.get(endpoints.adminEnvios, { params: { limit: 100 } }), []);
  const { data, loading, error, reload } = useAsync(cargar, [cargar]);
  const [form, setForm] = useState(VACIO);
  const [editando, setEditando] = useState(null);
  const [formEdicion, setFormEdicion] = useState({ transportadora: '', numero_guia: '', fecha_estimada: '', estado: '' });
  const [mensaje, setMensaje] = useState('');
  const [errorForm, setErrorForm] = useState('');

  const crear = async (event) => {
    event.preventDefault();
    setErrorForm('');
    try {
      await api.post(endpoints.adminEnvios, {
        ...form,
        pedido_id: Number(form.pedido_id),
      });
      setForm(VACIO);
      reload();
    } catch (err) {
      setErrorForm(err.message);
    }
  };

  const abrirEdicion = (envio) => {
    setEditando(envio);
    setFormEdicion({
      transportadora: envio.transportadora || '',
      numero_guia: envio.numero_guia || '',
      fecha_estimada: envio.fecha_estimada || '',
      estado: envio.estado,
    });
  };

  const guardarEdicion = async (event) => {
    event.preventDefault();
    setMensaje('');
    try {
      await api.patch(endpoints.adminEnvio(editando.id), formEdicion);
      setEditando(null);
      reload();
    } catch (err) {
      setMensaje(err.message);
    }
  };

  const cambiarEstado = async (envio, estado) => {
    setMensaje('');
    try {
      await api.patch(endpoints.adminEnvio(envio.id), { estado });
      reload();
    } catch (err) {
      setMensaje(err.message);
    }
  };

  return (
    <div>
      <header className="admin-page-header">
        <h2>Envíos y guías</h2>
        <p>Registra despachos, asigna guías y actualiza el estado de cada envío.</p>
      </header>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Nuevo despacho</h3>
        <form onSubmit={crear} className="admin-form-grid">
          <Input label="ID del pedido" name="pedido_id" type="number" min="1" required value={form.pedido_id} onChange={(e) => setForm({ ...form, pedido_id: e.target.value })} />
          <Input label="Transportadora" name="transportadora" required value={form.transportadora} onChange={(e) => setForm({ ...form, transportadora: e.target.value })} />
          <Input label="Número de guía" name="numero_guia" value={form.numero_guia} onChange={(e) => setForm({ ...form, numero_guia: e.target.value })} />
          <Input label="Fecha estimada" name="fecha_estimada" type="date" value={form.fecha_estimada} onChange={(e) => setForm({ ...form, fecha_estimada: e.target.value })} />
          <div style={{ alignSelf: 'end' }}><Button type="submit">Registrar envío</Button></div>
        </form>
        {errorForm && <div className="error-box" style={{ marginTop: '1rem' }}>{errorForm}</div>}
      </div>

      {mensaje && <div className="error-box">{mensaje}</div>}
      {loading && <Spinner />}
      {error && <div className="error-box">{error.message}</div>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Pedido</th><th>Cliente</th><th>Transportadora</th><th>Guía</th><th>Estimada</th><th>Estado</th><th>Acción</th></tr>
            </thead>
            <tbody>
              {(data?.data || []).map((envio) => (
                <tr key={envio.id}>
                  <td>#{envio.pedido_id}</td>
                  <td>{envio.cliente}</td>
                  <td>{envio.transportadora}</td>
                  <td className="envio-guia">{envio.numero_guia || '—'}</td>
                  <td>{dateOnly(envio.fecha_estimada)}</td>
                  <td><Badge estado={envio.estado} tipo="envio" /></td>
                  <td>
                    <div className="acciones-tabla">
                      <button onClick={() => abrirEdicion(envio)} aria-label="Editar envío" title="Editar guía"><Edit2 size={14} /></button>
                      {(TRANSICIONES_ENVIO[envio.estado] || []).length > 0 && (
                        <select
                          className="estado-select"
                          value=""
                          onChange={(e) => cambiarEstado(envio, e.target.value)}
                          aria-label={`Cambiar estado del envío ${envio.id}`}
                        >
                          <option value="">Cambiar a…</option>
                          {TRANSICIONES_ENVIO[envio.estado].map((valor) => (
                            <option key={valor} value={valor}>{ESTADOS_ENVIO[valor]}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={Boolean(editando)} onClose={() => setEditando(null)} title={`Editar envío #${editando?.id || ''}`}>
        <form className="stack" onSubmit={guardarEdicion}>
          <Input
            label="Transportadora"
            name="transportadora"
            value={formEdicion.transportadora}
            onChange={(e) => setFormEdicion({ ...formEdicion, transportadora: e.target.value })}
          />
          <Input
            label="Número de guía"
            name="numero_guia"
            value={formEdicion.numero_guia}
            onChange={(e) => setFormEdicion({ ...formEdicion, numero_guia: e.target.value })}
          />
          <Input
            label="Fecha estimada"
            name="fecha_estimada"
            type="date"
            value={formEdicion.fecha_estimada}
            onChange={(e) => setFormEdicion({ ...formEdicion, fecha_estimada: e.target.value })}
          />
          <div className="field">
            <label htmlFor="estado-envio">Estado</label>
            <select
              id="estado-envio"
              className="estado-select"
              value={formEdicion.estado}
              onChange={(e) => setFormEdicion({ ...formEdicion, estado: e.target.value })}
            >
              {Object.entries(ESTADOS_ENVIO).map(([valor, label]) => (
                <option key={valor} value={valor}>{label}</option>
              ))}
            </select>
          </div>
          <Button type="submit">Guardar envío</Button>
        </form>
      </Modal>
    </div>
  );
}
