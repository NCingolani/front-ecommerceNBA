import React from 'react';
import ProductList from './components/ProductList';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <h1>Tienda NBA</h1>
        <p className="subtitle">Explora nuestra colección exclusiva de productos oficiales</p>
      </header>
      <main>
        <ProductList />
      </main>
    </div>
  );
}

export default App;