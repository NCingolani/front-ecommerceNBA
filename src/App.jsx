import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Home from './pages/Home';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import ProductCreate from './components/ProductCreate';
import AuthPage from './components/AuthPage';
import { AuthProvider, useAuth } from './auth/AuthContext';
import './App.css';

function App() {
  const [modoActivo, setModoActivo] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const agregarAlCarrito = (producto, cantidad = 1) => {
    setCarrito((items) => [...items, ...Array(cantidad).fill(producto)]);
  };

  return (
    <AuthProvider>
      <div className={`app-container ${modoActivo ? 'modo-claro' : 'modo-oscuro'}`}>
        <Navbar
          cantidadCarrito={carrito.length}
          onToggleColor={setModoActivo}
        />
        <Routes>
          <Route
            path="/"
            element={<Home onAddToCart={agregarAlCarrito} />}
          />
          <Route
            path="/productos"
            element={<ProductList onAddToCart={agregarAlCarrito} />}
          />
          <Route path="/producto/:id" element={<ProductDetail onAddToCart={agregarAlCarrito} />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/registro" element={<AuthPage mode="register" />} />
          <Route
            path="/crear"
            element={
              <AdminRoute>
                <ProductCreate />
              </AdminRoute>
            }
          />

          <Route
            path="/carrito"
            element={
              <PrivateRoute>
                <h2>Carrito Protegido</h2>
              </PrivateRoute>
            }
          />
        </Routes>
        <Footer />
      </div>
    </AuthProvider>
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
