

import React, { useState } from 'react';
import {
  Routes,
  Route,
  Link,
  Navigate,
  useLocation
} from 'react-router-dom';

import Home from './pages/Home';
import Carrito from './pages/Carrito';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import ProductCreate from './components/ProductCreate';
import AuthPage from './components/AuthPage';
import OnOff from './components/OnOff';

import { AuthProvider, useAuth } from './auth/AuthContext';
import { CartProvider, useCart } from './context/CartContext';

import './App.css';

// COMPONENTE PRINCIPAL
function App() {
  const [modoActivo, setModoActivo] = useState(false);

  const handleToggleColor = (estado) => {
    setModoActivo(estado);
  };

  return (
    <AuthProvider>
      <CartProvider>
        <div
          className={`app-container ${
            modoActivo ? 'modo-claro' : 'modo-oscuro'
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

            {/* CREAR PRODUCTO - SOLO ADMIN */}
            <Route
              path="/crear"
              element={
                <AdminRoute>
                  <ProductCreate />
                </AdminRoute>
              }
            />

            {/* CARRITO DE COMPRAS */}
            <Route
              path="/carrito"
              element={
                <PrivateRoute>
                  <>
                    <header className="header">
                      <Link
                        to="/"
                        style={{ textDecoration: 'none' }}
                      >
                        <h1>Tienda NBA</h1>
                      </Link>

                      <HeaderActions
                        onToggleColor={handleToggleColor}
                      />
                    </header>

                    <Carrito />
                  </>
                </PrivateRoute>
              }
            />

          </Routes>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

// NAVEGACIÓN SUPERIOR
function HeaderActions({ onToggleColor }) {
  const { session, logout } = useAuth();

  // Obtener cantidad de productos del carrito
  const { cantidadTotal } = useCart();

  return (
    <nav
      className="header-actions"
      aria-label="Navegación de cuenta"
    >

      {/* MODO OSCURO */}
      <OnOff onToggle={onToggleColor} />

      {/* CATÁLOGO */}
      <Link
        className="header-link"
        to="/productos"
      >
        Catálogo
      </Link>

      {/* CARRITO CON CONTADOR */}
      <Link
        className="header-link"
        to="/carrito"
      >
        🛒 Carrito ({cantidadTotal})
      </Link>

      {/* OPCIONES DEL ADMINISTRADOR */}
      {session?.role === 'ADMIN' && (
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

// RUTAS PROTEGIDAS
function PrivateRoute({ children }) {
  const { session } = useAuth();
  const location = useLocation();

  return session
    ? children
    : (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
}

// RUTAS SOLO PARA ADMINISTRADORES
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

export default App;
