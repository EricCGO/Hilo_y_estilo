import { useCallback, useState } from 'react';
import { useAsync } from '@/shared/hooks/useAsync';
import api from '@/shared/api/apiClient';
import { endpoints } from '@/shared/api/endpoints';
import Button from '@/shared/components/Button';
import Input from '@/shared/components/Input';
import Modal from '@/shared/components/Modal';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import Spinner from '@/shared/components/Spinner';
import Badge from '@/shared/components/Badge';
import { Plus, Edit2, Trash2 } from '@/shared/icons';
import { money } from '@/shared/utils/money';
import './admin.css';

const VACIO = {
  nombre: '', categoria: '', sku: '', precio: '', stock: '',
  stock_minimo: '5', descripcion: '',
};

export default function ProductosAdminPage() {
  const cargar = useCallback(
    () => Promise.all([
      api.get(endpoints.adminProductos, { params: { limit: 100 } }),
      api.get(endpoints.categorias),
    ]).then(([productos, categorias]) => ({
      productos: productos.data,
      meta: productos.meta,
      categorias: categorias.data,
    })),
    []
  );
  const { data, loading, error, reload } = useAsync(cargar, [cargar]);
  const [form, setForm] = useState(VACIO);
  const [editando, setEditando] = useState(null);
  const [modal, setModal] = useState(false);
  const [eliminar, setEliminar] = useState(null);
  const [ajuste, setAjuste] = useState(null);
  const [formAjuste, setFormAjuste] = useState({ cantidad: '', motivo: '' });
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const abrirNuevo = () => {
    setForm(VACIO);
    setEditando(null);
    setArchivo(null);
    setModal(true);
  };
  const abrirEditar = (producto) => {
    setForm({
      nombre: producto.nombre,
      categoria: producto.categoria,
      sku: producto.sku,
      precio: producto.precio,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
      descripcion: producto.descripcion || '',
    });
    setEditando(producto.id);
    setArchivo(null);
    setModal(true);
  };

  const guardar = async (event) => {
    event.preventDefault();
    setMensaje('');
    const payload = {
      ...form,
      categoria: Number(form.categoria),
      precio: Number(form.precio),
      stock: Number(form.stock),
      stock_minimo: Number(form.stock_minimo),
    };
    let cuerpo = payload;
    if (archivo) {
      cuerpo = new FormData();
      Object.entries(payload).forEach(([clave, valor]) => {
        cuerpo.append(clave, valor === null || valor === undefined ? '' : valor);
      });
      cuerpo.append('imagen', archivo);
    }
    try {
      if (editando) await api.patch(endpoints.adminProducto(editando), cuerpo);
      else await api.post(endpoints.adminProductos, cuerpo);
      setModal(false);
      setArchivo(null);
      reload();
    } catch (err) {
      setMensaje(err.message);
    }
  };

  const abrirAjuste = (producto) => {
    setAjuste(producto);
    setFormAjuste({ cantidad: '', motivo: '' });
  };

  const guardarAjuste = async (event) => {
    event.preventDefault();
    setMensaje('');
    try {
      await api.patch(endpoints.adminProductoStock(ajuste.id), {
        cantidad: Number(formAjuste.cantidad),
        motivo: formAjuste.motivo,
      });
      setAjuste(null);
      reload();
    } catch (err) {
      setMensaje(err.message);
      setAjuste(null);
    }
  };

  const confirmarEliminar = async () => {
    try {
      await api.delete(endpoints.adminProducto(eliminar.id));
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
        <h2>Productos e inventario</h2>
        <p>Gestiona el catálogo, precios y stock de los insumos.</p>
      </header>

      <div className="admin-toolbar">
        <strong>{data?.meta?.total || 0} productos</strong>
        <Button onClick={abrirNuevo}><Plus size={15} /> Nuevo producto</Button>
      </div>

      {mensaje && <div className="error-box">{mensaje}</div>}
      {loading && <Spinner />}
      {error && <div className="error-box">{error.message}</div>}

      {data && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Producto</th><th>SKU</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {data.productos.map((producto) => (
                <tr key={producto.id}>
                  <td><strong>{producto.nombre}</strong></td>
                  <td>{producto.sku}</td>
                  <td>{producto.categoria_nombre}</td>
                  <td>{money(producto.precio)}</td>
                  <td>{producto.stock} {producto.stock_bajo && '⚠️'}</td>
                  <td><Badge estado={producto.activo ? 'entregado' : 'cancelado'} tipo="envio" /></td>
                  <td>
                    <div className="acciones-tabla">
                      <button onClick={() => abrirAjuste(producto)} aria-label="Ajustar stock" title="Ajustar stock">±</button>
                      <button onClick={() => abrirEditar(producto)} aria-label="Editar"><Edit2 size={14} /></button>
                      <button onClick={() => setEliminar(producto)} aria-label="Eliminar"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title={editando ? 'Editar producto' : 'Nuevo producto'}>
        <form className="stack" onSubmit={guardar}>
          <div className="admin-form-grid">
            <Input label="Nombre" name="nombre" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            <Input label="SKU" name="sku" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <div className="field">
              <label htmlFor="categoria">Categoría</label>
              <select id="categoria" name="categoria" required value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                <option value="">Selecciona…</option>
                {data?.categorias?.map((cat) => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
              </select>
            </div>
            <Input label="Precio (COP)" name="precio" type="number" min="0" required value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} />
            <Input label="Stock" name="stock" type="number" min="0" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            <Input label="Stock mínimo" name="stock_minimo" type="number" min="0" required value={form.stock_minimo} onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })} />
          </div>
          <Input label="Descripción" name="descripcion" as="textarea" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          <div className="field">
            <label htmlFor="imagen-producto">Imagen del producto (opcional)</label>
            <input
              id="imagen-producto"
              name="imagen"
              type="file"
              accept="image/*"
              onChange={(event) => setArchivo(event.target.files?.[0] || null)}
            />
            {archivo && (
              <span className="muted" style={{ fontSize: '0.75rem' }}>{archivo.name}</span>
            )}
          </div>
          <Button type="submit">{editando ? 'Guardar cambios' : 'Crear producto'}</Button>
        </form>
      </Modal>

      <Modal isOpen={Boolean(ajuste)} onClose={() => setAjuste(null)} title={`Ajustar stock: ${ajuste?.nombre || ''}`}>
        <form className="stack" onSubmit={guardarAjuste}>
          <Input
            label="Cantidad (+ entrada / − salida)"
            name="cantidad"
            type="number"
            required
            value={formAjuste.cantidad}
            onChange={(e) => setFormAjuste({ ...formAjuste, cantidad: e.target.value })}
          />
          <Input
            label="Motivo"
            name="motivo"
            value={formAjuste.motivo}
            onChange={(e) => setFormAjuste({ ...formAjuste, motivo: e.target.value })}
          />
          <Button type="submit">Aplicar ajuste</Button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(eliminar)}
        onClose={() => setEliminar(null)}
        onConfirm={confirmarEliminar}
        title="Desactivar producto"
        message={`¿Desactivar "${eliminar?.nombre}"? Dejará de verse en el catálogo público.`}
        confirmLabel="Desactivar"
      />
    </div>
  );
}
