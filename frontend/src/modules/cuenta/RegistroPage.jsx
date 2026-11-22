import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useAuth } from '@/app/AuthContext';
import { AlertCircle } from '@/shared/icons';
import Button from '@/shared/components/Button';
import Input from '@/shared/components/Input';
import Spinner from '@/shared/components/Spinner';
import { interpretarError } from '@/shared/utils/formErrors';
import './cuenta.css';

const VACIO = {
  nombre: '', email: '', telefono: '', nombre_taller: '', password: '',
};

export default function RegistroPage() {
  const { register, loading: cargandoSesion, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(VACIO);
  const [errores, setErrores] = useState({ campos: {}, general: '' });
  const [enviando, setEnviando] = useState(false);

  if (cargandoSesion) return <Spinner label="Verificando sesión…" />;
  if (isAuthenticated) return <Navigate to="/cuenta" replace />;

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, campos: { ...actual.campos, [name]: '' } }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setErrores({ campos: {}, general: '' });
    setEnviando(true);
    try {
      await register(form);
      navigate('/cuenta', { replace: true });
    } catch (err) {
      setErrores(interpretarError(err));
    } finally {
      setEnviando(false);
    }
  };

  const campo = (nombre, label, tipo = 'text', extra = {}) => (
    <Input
      label={label}
      name={nombre}
      type={tipo}
      required={extra.required}
      autoComplete={extra.autoComplete}
      value={form[nombre]}
      error={errores.campos[nombre]}
      onChange={onChange}
    />
  );

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <span className="eyebrow">Únete a la red textil</span>
        <h2>Crear cuenta</h2>
        <p>Registra tu taller y accede a insumos, pedidos y envíos.</p>

        {errores.general && (
          <div className="error-box" role="alert">
            <AlertCircle size={16} /> {errores.general}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          {campo('nombre', 'Nombre', 'text', { required: true })}
          {campo('email', 'Correo electrónico', 'email', { required: true, autoComplete: 'email' })}
          {campo('telefono', 'Teléfono', 'tel')}
          {campo('nombre_taller', 'Nombre del taller')}
          {campo('password', 'Contraseña (mínimo 8 caracteres)', 'password', {
            required: true,
            autoComplete: 'new-password',
          })}
          <Button type="submit" disabled={enviando}>
            {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
          </Button>
        </form>

        <div className="auth-card__footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
