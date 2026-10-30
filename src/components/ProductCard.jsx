
import React from 'react';
import { Link } from 'react-router-dom';
import OnOff from './OnOff';

// Imágenes guardadas en public/Images/Productos
const imagenesProductos = {
  'Jersey LeBron James #23 Lakers':
    '/Images/Productos/JerseyLeBronJames.jpg',

  'Jersey Stephen Curry #30 Warriors':
    '/Images/Productos/JerseyStephenCurry.jpg',

  'Zapatillas Nike Luka 2':
    '/Images/Productos/ZapatillasNikeLuka2.jpg'
};

const ProductCard = ({ producto, onAddToCart }) => {

  const precio = Number(producto.precio);

  // Buscar la imagen local según el nombre
  const imagenLocal = imagenesProductos[producto.nombre?.trim()];

  // Priorizar la imagen del frontend
  const imagen = imagenLocal || producto.imagen;

  return (
    <div className="product-card">

      {/* IMAGEN DEL PRODUCTO */}
      <div className="product-image-container">

        {imagen ? (
          <img
            src={imagen}
            alt={producto.nombre}
            className="product-image"
            style={{
              width: '100%',
              height: '220px',
              objectFit: 'contain',
              borderRadius: '8px',
              marginBottom: '15px'
            }}
          />
        ) : (
          <div
            className="product-image product-image-empty"
            role="img"
            aria-label={`Sin imagen: ${producto.nombre}`}
          />
        )}

      </div>

      {/* NOMBRE DEL PRODUCTO */}
      <h3
        className="product-name"
        style={{ marginTop: 0 }}
      >
        {producto.nombre}
      </h3>

      {/* DESCRIPCIÓN */}
      <p className="product-description">
        {producto.descripcion}
      </p>

      {/* PRECIO */}
      <p
        className="precio product-price"
        style={{
          fontSize: '1.3rem',
          fontWeight: 'bold',
          marginBottom: '15px'
        }}
      >
        {Number.isFinite(precio)
          ? new Intl.NumberFormat('es-AR', {
              style: 'currency',
              currency: 'ARS',
              maximumFractionDigits: 0
            }).format(precio)
          : 'Precio no disponible'}
      </p>

      {/* BOTÓN AÑADIR AL CARRITO */}
      {onAddToCart ? (
        <button
          className="btn-onoff"
          type="button"
          onClick={() => onAddToCart(producto)}
        >
          🛒 Añadir al carrito
        </button>
      ) : (
        <OnOff />
      )}

      {/* BOTÓN VER DETALLE */}
      <Link
        to={`/producto/${producto.id}`}
        className="btn-onoff"
        style={{
          textDecoration: 'none',
          display: 'block',
          textAlign: 'center',
          marginTop: '10px'
        }}
      >
        Ver Detalle
      </Link>

    </div>
  );
};

export default ProductCard;
