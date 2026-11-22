import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/app/AuthContext';
import { AlertCircle } from '@/shared/icons';
import Button from '@/shared/components/Button';
import Input from '@/shared/components/Input';
import Spinner from '@/shared/components/Spinner';
import { interpretarError } from '@/shared/utils/formErrors';
import { ROLES_OPERATIVOS } from '@/shared/utils/constants';
import './cuenta.css';

export default function LoginPage() {
  const { login, user, loading: cargandoSesion, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errores, setErrores] = useState({ campos: {}, general: '' });
  const [enviando, setEnviando] = useState(false);

  const destino = (usuario) =>
    ROLES_OPERATIVOS.includes(usuario?.rol) ? '/admin' : (location.state?.from || '/cuenta');

  if (cargandoSesion) return <Spinner label="Verificando sesión…" />;
  if (isAuthenticated) return <Navigate to={destino(user)} replace />;

  const onSubmit = async (event) => {
    event.preventDefault();
    setErrores({ campos: {}, general: '' });
    setEnviando(true);
    try {
      const usuario = await login(form.email.trim().toLowerCase(), form.password);
      navigate(destino(usuario), { replace: true });
    } catch (err) {
      setErrores(interpretarError(err));
    } finally {
      setEnviando(false);
    }
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((actual) => ({ ...actual, [name]: value }));
    setErrores((actual) => ({ ...actual, campos: { ...actual.campos, [name]: '' } }));
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <span className="eyebrow">Bienvenido de nuevo</span>
        <h2>Iniciar sesión</h2>
        <p>Accede a tu cuenta para gestionar pedidos y envíos.</p>

        {errores.general && (
          <div className="error-box" role="alert">
            <AlertCircle size={16} /> {errores.general}
          </div>
        )}

        <form onSubmit={onSubmit} noValidate>
          <Input
            label="Correo electrónico"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            error={errores.campos.email}
            onChange={onChange}
          />
          <Input
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            error={errores.campos.password}
            onChange={onChange}
          />
          <Button type="submit" disabled={enviando}>
            {enviando ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>

        <div className="auth-card__footer">
          ¿Aún no tienes cuenta? <Link to="/registro">Regístrate</Link>
        </div>
      </div>
    </div>
  );
}
