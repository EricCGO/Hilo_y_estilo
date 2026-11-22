import { useCallback, useState } from 'react';
import { useAsync } from '@/shared/hooks/useAsync';
import api from '@/shared/api/apiClient';
import { endpoints } from '@/shared/api/endpoints';
import Button from '@/shared/components/Button';
import Input from '@/shared/components/Input';
import Modal from '@/shared/components/Modal';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import Spinner from '@/shared/components/Spinner';
import { Plus, Edit2, Trash2 } from '@/shared/icons';
import './admin.css';

const VACIO = { nombre: '', slug: '', descripcion: '' };

export default function CategoriasAdminPage() {
  const cargar = useCallback(() => api.get(endpoints.adminCategorias), []);
  const { data, loading, error, reload } = useAsync(cargar, [cargar]);
  const [form, setForm] = useState(VACIO);
  const [editando, setEditando] = useState(null);
  const [modal, setModal] = useState(false);
  const [eliminar, setEliminar] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const nuevo = () => { setForm(VACIO); setEditando(null); setModal(true); };
  const editar = (categoria) => {
    setForm({
      nombre: categoria.nombre,
      slug: categoria.slug,
      descripcion: categoria.descripcion || '',
    });
    setEditando(categoria.id);
    setModal(true);
  };

  const guardar = async (event) => {
    event.preventDefault();
    setMensaje('');
    try {
      if (editando) await api.patch(endpoints.adminCategoria(editando), form);
      else await api.post(endpoints.adminCategorias, form);
      setModal(false);
      reload();
    } catch (err) {
      setMensaje(err.message);
    }
  };

  const borrar = async () => {
    try {
      await api.delete(endpoints.adminCategoria(eliminar.id));
      setEliminar(null);
      reload();
    } catch (err) {
      setMensaje(err.message);
      setEliminar(null);
    }
  };

  return (
    <div>
      <header className="admin-page-header">
        <h2>Categorías</h2>
        <p>Organiza los insumos del catálogo público.</p>
      </header>

      <div className="admin-toolbar">
        <strong>{data?.data?.length || 0} categorías</strong>
        <Button onClick={nuevo}><Plus size={15} /> Nueva categoría</Button>
      </div>

      {mensaje && <div className="error-box">{mensaje}</div>}
      {loading && <Spinner />}
      {error && <div className="error-box">{error.message}</div>}

      {!loading && !error && (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Nombre</th><th>Slug</th><th>Descripción</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {(data?.data || []).map((categoria) => (
                <tr key={categoria.id}>
                  <td><strong>{categoria.nombre}</strong></td>
                  <td>{categoria.slug}</td>
                  <td>{categoria.descripcion || '—'}</td>
                  <td>{categoria.activa ? 'Activa' : 'Inactiva'}</td>
                  <td>
                    <div className="acciones-tabla">
                      <button onClick={() => editar(categoria)} aria-label="Editar"><Edit2 size={14} /></button>
                      <button onClick={() => setEliminar(categoria)} aria-label="Eliminar"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editando ? 'Editar categoría' : 'Nueva categoría'}>
        <form className="stack" onSubmit={guardar}>
          <Input label="Nombre" name="nombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <Input label="Slug" name="slug" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Input label="Descripción" name="descripcion" as="textarea" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          <Button type="submit">{editando ? 'Guardar' : 'Crear'}</Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(eliminar)}
        onClose={() => setEliminar(null)}
        onConfirm={borrar}
        title="Eliminar categoría"
        message={`¿Eliminar "${eliminar?.nombre}"? No se puede si tiene productos asociados.`}
        confirmLabel="Eliminar"
      />
    </div>
  );
}
