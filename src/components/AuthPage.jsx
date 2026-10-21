import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { login, register } from '../services/auth';
import './AuthPage.css';

function AuthPage({ mode }) {
  const esRegistro = mode === 'register';
  const navigate = useNavigate();
  const location = useLocation();
  const { login: iniciarSesion } = useAuth();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmarPassword: '',
    fechaNacimiento: '',
    sexo: '',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const actualizarCampo = (event) => {
    const { name, value } = event.target;
    setForm((actual) => ({ ...actual, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (esRegistro && form.password !== form.confirmarPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setCargando(true);
    try {
      const token = esRegistro
        ? await register({
          nombre: form.nombre.trim(),
          apellido: form.apellido.trim(),
          email: form.email.trim(),
          password: form.password,
          fechaNacimiento: form.fechaNacimiento,
          sexo: form.sexo.trim(),
        })
        : await login({ email: form.email.trim(), password: form.password });

      iniciarSesion(token);
      const destino = typeof location.state?.from === 'string' ? location.state.from : '/';
      navigate(destino, { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Ocurrió un error. Intentá nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <span className="auth-eyebrow">TIENDA NBA</span>
        <h2>{esRegistro ? 'Creá tu cuenta' : 'Te damos la bienvenida'}</h2>
        <p className="auth-intro">
          {esRegistro
            ? 'Registrate para acceder a tu cuenta y disfrutar la tienda.'
            : 'Ingresá con tu email y contraseña para continuar.'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {esRegistro && (
            <div className="auth-fields-row">
              <label>
                Nombre
                <input name="nombre" value={form.nombre} onChange={actualizarCampo} autoComplete="given-name" required />
              </label>
              <label>
                Apellido
                <input name="apellido" value={form.apellido} onChange={actualizarCampo} autoComplete="family-name" required />
              </label>
            </div>
          )}

          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={actualizarCampo}
              autoComplete="email"
              required
            />
          </label>

          {esRegistro && (
            <div className="auth-fields-row">
              <label>
                Fecha de nacimiento
                <input
                  name="fechaNacimiento"
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={actualizarCampo}
                  autoComplete="bday"
                  required
                />
              </label>
              <label>
                Género
                <select name="sexo" value={form.sexo} onChange={actualizarCampo} required>
                  <option value="" disabled>Seleccioná una opción</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="No binario">No binario</option>
                  <option value="Otro">Otro</option>
                  <option value="Prefiero no decirlo">Prefiero no decirlo</option>
                </select>
              </label>
            </div>
          )}

          <label>
            Contraseña
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={actualizarCampo}
              autoComplete={esRegistro ? 'new-password' : 'current-password'}
              required
            />
          </label>

          {esRegistro && (
            <label>
              Confirmar contraseña
              <input
                name="confirmarPassword"
                type="password"
                value={form.confirmarPassword}
                onChange={actualizarCampo}
                autoComplete="new-password"
                required
              />
            </label>
          )}

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button className="auth-submit" type="submit" disabled={cargando}>
            {cargando ? 'Un momento…' : esRegistro ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="auth-switch">
          {esRegistro ? '¿Ya tenés una cuenta?' : '¿Todavía no tenés cuenta?'}{' '}
          <Link to={esRegistro ? '/login' : '/registro'}>
            {esRegistro ? 'Iniciá sesión' : 'Registrate'}
          </Link>
        </p>
      </div>
    </section>
  );
}

export default AuthPage;
