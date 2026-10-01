import React, { useState } from 'react';
import ProductList from './components/ProductList';
import OnOff from './components/OnOff';
import './App.css';

function App() {
  const [modoActivo, setModoActivo] = useState(false);

  const handleToggleColor = (estado) => {
    setModoActivo(estado);
  };

  return (
    <div className={`app-container ${modoActivo ? 'modo-claro' : 'modo-oscuro'}`}>
      <header className="header">
        <h1>Tienda NBA</h1>
        <p className="subtitle">Explora nuestra colección exclusiva de productos oficiales</p>

        <div style={{ marginTop: '20px' }}>
          <OnOff onToggle={handleToggleColor} />
        </div>
      </header>

      <main>
        <ProductList />
      </main>
    </div>
  );
}

export default App;