import React, { useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import ProductCreate from './components/ProductCreate';
import AuthPage from './components/AuthPage';
import OnOff from './components/OnOff';
import { AuthProvider, useAuth } from './auth/AuthContext';
import './App.css';

function App() {
  const [modoActivo, setModoActivo] = useState(false);
  const handleToggleColor = (estado) => {
    setModoActivo(estado);
  };

  return (
    <AuthProvider>
      <div className={`app-container ${modoActivo ? 'modo-claro' : 'modo-oscuro'}`}>
        <header className="header">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1>Tienda NBA</h1>
          </Link>
          <p className="subtitle">Explora nuestra colección exclusiva de productos oficiales</p>

          <HeaderActions onToggleColor={handleToggleColor} />
        </header>

        <main>
          <Routes>
            <Route path="/" element={<ProductList />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/registro" element={<AuthPage mode="register" />} />
            <Route
              path="/crear"
              element={<AdminRoute><ProductCreate /></AdminRoute>}
            />
            <Route path="/carrito" element={<PrivateRoute><h2>Carrito Protegido</h2></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

function HeaderActions({ onToggleColor }) {
  const { session, logout } = useAuth();

  return (
    <nav className="header-actions" aria-label="Navegación de cuenta">
      <OnOff onToggle={onToggleColor} />
      {session?.role === 'ADMIN' && <Link className="header-link" to="/crear">Añadir producto</Link>}
      {session ? (
        <>
          <span className="header-user">{session.email}</span>
          <button className="header-link header-button" type="button" onClick={logout}>Cerrar sesión</button>
        </>
      ) : (
        <>
          <Link className="header-link" to="/login">Iniciar sesión</Link>
          <Link className="header-link header-link-primary" to="/registro">Crear cuenta</Link>
        </>
      )}
    </nav>
  );
}

function PrivateRoute({ children }) {
  const { session } = useAuth();
  const location = useLocation();
  return session ? children : <Navigate to="/login" state={{ from: location.pathname }} replace />;
}

function AdminRoute({ children }) {
  const { session } = useAuth();
  return session?.role === 'ADMIN' ? children : <Navigate to={session ? '/' : '/login'} replace />;
}

export default App;
