import React, { useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import ProductList from './components/ProductList';
import ProductDetail from './components/ProductDetail';
import OnOff from './components/OnOff';
import './App.css';

function App() {
  const [modoActivo, setModoActivo] = useState(false);
  const estaAutenticado = false;
  const handleToggleColor = (estado) => {
    setModoActivo(estado);
  };

  return (
    <div className={`app-container ${modoActivo ? 'modo-claro' : 'modo-oscuro'}`}>
      <header className="header">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1>Tienda NBA</h1>
        </Link>
        <p className="subtitle">Explora nuestra colección exclusiva de productos oficiales</p>

        <div style={{ marginTop: '20px' }}>
          <OnOff onToggle={handleToggleColor} />
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/producto/:id" element={<ProductDetail />} />
          <Route path="/carrito" element={estaAutenticado ? <h2>Carrito Protegido</h2> : <Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;