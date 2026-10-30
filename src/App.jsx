import React, { useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';

import Home from './pages/Home';
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
        <Routes>
          {/* HOME */}
          <Route
            path="/"
            element={
              <>
                <header className="header">
                  <Link to="/" style={{ textDecoration: 'none' }}>
                    <h1>Tienda NBA</h1>
                  </Link>
                  <HeaderActions onToggleColor={handleToggleColor} />
                </header>
                <Home />
              </>
            }
          />

          {/* CATÁLOGO */}
          <Route
            path="/productos"
            element={
              <>
                <header className="header">
                  <Link to="/" style={{ textDecoration: 'none' }}>
                    <h1>Tienda NBA</h1>
                  </Link>
                  <p className="subtitle">
                    Explora nuestra colección exclusiva
                  </p>
                  <HeaderActions onToggleColor={handleToggleColor} />
                </header>
                <ProductList />
              </>
            }
          />

          {/* DETALLE DEL PRODUCTO */}
          <Route
            path="/producto/:id"
            element={<ProductDetail />}
          />

          {/* LOGIN Y REGISTRO */}
          <Route
            path="/login"
            element={<AuthPage mode="login" />}
          />
          <Route
            path="/registro"
            element={<AuthPage mode="register" />}
          />

          {/* CREAR PRODUCTO - SOLO ADMIN */}
          <Route
            path="/crear"
            element={
              <AdminRoute>
                <ProductCreate />
              </AdminRoute>
            }
          />

          {/* CARRITO PROTEGIDO */}
          <Route
            path="/carrito"
            element={
              <PrivateRoute>
                <h2>Carrito Protegido</h2>
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

function HeaderActions({ onToggleColor }) {
  const { session, logout } = useAuth();

  return (
    <nav className="header-actions" aria-label="Navegación de cuenta">
      <OnOff onToggle={onToggleColor} />
      <Link className="header-link" to="/productos">Catálogo</Link>
      {session?.role === 'ADMIN' && (
        <Link className="header-link header-link-primary" to="/crear">
          + Añadir producto
        </Link>
      )}
      {session ? (
        <>
          <span className="header-user">
            {session.email} ({session.role})
          </span>
          <button className="header-link header-button" type="button" onClick={logout}>
            Cerrar sesión
          </button>
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
