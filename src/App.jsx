import React, { useState } from 'react';

import {
  Routes,
  Route,
  Link,
  Navigate
} from 'react-router-dom';

// PÁGINAS
import Home from './pages/Home';
import Carrito from './pages/Carrito';
import MisPedidos from './pages/MisPedidos';

// COMPONENTES
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import ProductCreate from './components/ProductCreate';
import AuthPage from './components/AuthPage';
import OnOff from './components/OnOff';

// CONTEXTOS
import { AuthProvider, useAuth } from './auth/AuthContext';
import { CartProvider, useCart } from './context/CartContext';

// ESTILOS
import './App.css';

// ======================================
// COMPONENTE PRINCIPAL
// ======================================

function App() {
  const [modoActivo, setModoActivo] = useState(false);

  const handleToggleColor = (estado) => {
    setModoActivo(estado);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div
          className={`app-container ${modoActivo ? 'modo-claro' : 'modo-oscuro'
            }`}
        >
          <Routes>

            {/* HOME */}
            <Route
              path="/"
              element={
                <>
                  <header className="header">
                    <Link
                      to="/"
                      style={{ textDecoration: 'none' }}
                    >
                      <h1>Tienda NBA</h1>
                    </Link>

                    <HeaderActions
                      modoActivo={modoActivo}
                      onToggleColor={handleToggleColor}
                    />
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
                    <Link
                      to="/"
                      style={{ textDecoration: 'none' }}
                    >
                      <h1>Tienda NBA</h1>
                    </Link>

                    <p className="subtitle">
                      Explora nuestra colección exclusiva
                    </p>

                    <HeaderActions
                      modoActivo={modoActivo}
                      onToggleColor={handleToggleColor}
                    />
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

            {/* INICIAR SESIÓN */}
            <Route
              path="/login"
              element={<AuthPage mode="login" />}
            />

            {/* REGISTRO */}
            <Route
              path="/registro"
              element={<AuthPage mode="register" />}
            />

            {/* CREAR PRODUCTO - ADMIN */}
            <Route
              path="/crear"
              element={
                <AdminRoute>
                  <ProductCreate />
                </AdminRoute>
              }
            />

            {/* EDITAR PRODUCTO - ADMIN */}
            <Route
              path="/editar/:id"
              element={
                <AdminRoute>
                  <ProductCreate />
                </AdminRoute>
              }
            />

            {/* CARRITO */}
            <Route
              path="/carrito"
              element={
                <>
                  <header className="header">
                    <Link
                      to="/"
                      style={{ textDecoration: 'none' }}
                    >
                      <h1>Tienda NBA</h1>
                    </Link>

                    <HeaderActions
                      modoActivo={modoActivo}
                      onToggleColor={handleToggleColor}
                    />
                  </header>

                  <Carrito />
                </>
              }
            />

            {/* MIS PEDIDOS - USUARIO AUTENTICADO */}
            <Route
              path="/mis-pedidos"
              element={
                <ProtectedRoute>
                  <header className="header">
                    <Link
                      to="/"
                      style={{ textDecoration: 'none' }}
                    >
                      <h1>Tienda NBA</h1>
                    </Link>

                    <HeaderActions
                      modoActivo={modoActivo}
                      onToggleColor={handleToggleColor}
                    />
                  </header>

                  <MisPedidos />
                </ProtectedRoute>
              }
            />

          </Routes>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

// ======================================
// NAVEGACIÓN SUPERIOR
// ======================================

function HeaderActions({ modoActivo, onToggleColor }) {
  const { session, logout } = useAuth();
  const { cantidadTotal } = useCart();

  const esAdmin = session?.role === 'ADMIN';

  return (
    <nav
      className="header-actions"
      aria-label="Navegación de cuenta"
    >

      {/* MODO CLARO / OSCURO */}
      <OnOff
        activo={modoActivo}
        onToggle={onToggleColor}
      />

      {/* CATÁLOGO */}
      <Link
        className="header-link"
        to="/productos"
      >
        Catálogo
      </Link>

      {/* CARRITO - SOLO CLIENTES (NO ADMIN) */}
      {!esAdmin && (
        <Link
          className="header-link"
          to="/carrito"
        >
          🛒 Carrito ({cantidadTotal})
        </Link>
      )}

      {/* MIS PEDIDOS - SOLO CLIENTES AUTENTICADOS (NO ADMIN) */}
      {session && !esAdmin && (
        <Link
          className="header-link"
          to="/mis-pedidos"
        >
          📦 Mis pedidos
        </Link>
      )}

      {/* OPCIONES DEL ADMINISTRADOR */}
      {esAdmin && (
        <Link
          className="header-link header-link-primary"
          to="/crear"
        >
          + Añadir producto
        </Link>
      )}

      {/* USUARIO AUTENTICADO */}
      {session ? (
        <>
          <span className="header-user">
            {session.email} ({session.role})
          </span>

          <button
            className="header-link header-button"
            type="button"
            onClick={logout}
          >
            Cerrar sesión
          </button>
        </>
      ) : (
        <>
          <Link
            className="header-link"
            to="/login"
          >
            Iniciar sesión
          </Link>

          <Link
            className="header-link header-link-primary"
            to="/registro"
          >
            Crear cuenta
          </Link>
        </>
      )}
    </nav>
  );
}

// ======================================
// RUTAS SOLO PARA ADMINISTRADORES
// ======================================

function AdminRoute({ children }) {
  const { session } = useAuth();

  return session?.role === 'ADMIN'
    ? children
    : (
      <Navigate
        to={session ? '/' : '/login'}
        replace
      />
    );
}

// ======================================
// RUTAS PARA USUARIOS AUTENTICADOS
// ======================================

function ProtectedRoute({ children }) {
  const { session } = useAuth();

  return session
    ? children
    : <Navigate to="/login" replace />;
}

export default App;
