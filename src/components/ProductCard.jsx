
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Imágenes guardadas en public/Images/Productos
const imagenesProductos = {
  'Jersey LeBron James #23 Lakers':
    '/Images/Productos/JerseyLeBronJames.jpg',
  'Jersey LeBron James Lakers':
    '/Images/Productos/JerseyLeBronJames.jpg',
  'Jersey Stephen Curry #30 Warriors':
    '/Images/Productos/JerseyStephenCurry.jpg',
  'Jersey Stephen Curry Warriors':
    '/Images/Productos/JerseyStephenCurry.jpg',
  'Zapatillas Nike Luka 2':
    '/Images/Productos/ZapatillasNikeLuka2.jpg'
};

const ProductCard = ({ producto, onAddToCart, onEliminar }) => {
  const { session } = useAuth();
  const esAdmin = session?.role === 'ADMIN';

  const precio = Number(producto.precio);

  // Buscar la imagen local según el nombre
  const imagenLocal = imagenesProductos[producto.nombre?.trim()];

  // Priorizar la imagen del frontend
  const imagen = imagenLocal || producto.imagen;

  // Eliminar producto (solo administrador)
  const handleDelete = async () => {
    if (!window.confirm(`¿Eliminar "${producto.nombre}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/productos/${producto.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${
            session?.token || localStorage.getItem('token')
          }`
        }
      });

      if (!res.ok) {
        throw new Error(
          'Error al eliminar producto. Verificá tener rol ADMIN.'
        );
      }

      if (onEliminar) {
        onEliminar(producto.id);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Agregar producto al carrito
  const handleAddToCart = () => {
    if (typeof onAddToCart === 'function') {
      onAddToCart(producto);
    } else {
      console.warn(
        'El carrito todavía no está conectado a ProductCard.'
      );
    }
  };

  return (
    <div
      className="product-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box'
      }}
    >

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

      {/* BOTONES DEL PRODUCTO */}
      <div
        className="product-buttons"
        style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '100%'
        }}
      >

        {/* BOTÓN VER DETALLES */}
        <Link
          to={`/producto/${producto.id}`}
          className="btn-onoff"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            minHeight: '44px',
            boxSizing: 'border-box',
            textAlign: 'center'
          }}
        >
          Ver detalles
        </Link>

        {/* BOTÓN AÑADIR AL CARRITO */}
        <button
          className="btn-onoff"
          type="button"
          onClick={handleAddToCart}
          style={{
            width: '100%',
            minHeight: '44px',
            boxSizing: 'border-box',
            cursor: 'pointer'
          }}
        >
          🛒 Añadir al carrito
        </button>

        {/* BOTÓN ELIMINAR (SOLO ADMIN) */}
        {esAdmin && (
          <button
            type="button"
            onClick={handleDelete}
            className="btn-onoff activo"
            style={{
              width: '100%',
              minHeight: '44px',
              boxSizing: 'border-box',
              cursor: 'pointer'
            }}
          >
            🗑 Eliminar
          </button>
        )}

      </div>
    </div>
  );
};

export default ProductCard;

