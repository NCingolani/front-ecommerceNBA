import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// IMÁGENES PREDEFINIDAS
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

const CATEGORIAS = [
  'Jersey',
  'Shorts',
  'Zapatillas',
  'Accesorios'
];

const TALLES = [
  'S', 'M', 'L', 'XL', 'XXL',
  '40', '42', '44', 'Único'
];

const normalizarCategoria = (categoria) => {
  if (['Camisetas', 'Camiseta', 'Jerseys'].includes(categoria)) {
    return 'Jersey';
  }

  return categoria || 'Jersey';
};

const crearFormulario = (producto) => ({
  nombre: producto.nombre || '',
  precio: String(producto.precio ?? ''),
  descripcion: producto.descripcion || '',
  nombreCategoria: normalizarCategoria(
    producto.nombreCategoria
  ),
  talle: producto.talle || 'L',
  stock: String(producto.stock ?? 0),
  imagen: producto.imagen || '',
  etiquetas: (producto.etiquetas || []).join(', ')
});

const ProductCard = ({
  producto,
  onAddToCart,
  onEliminar,
  onActualizar
}) => {

  const { session } = useAuth();
  const esAdmin = session?.role === 'ADMIN';

  // STOCK DISPONIBLE
  const stockDisponible = Number(producto.stock ?? 0);
  const sinStock = stockDisponible <= 0;

  // ESTADOS DE ELIMINACIÓN
  const [confirmarEliminar, setConfirmarEliminar] =
    useState(false);

  const [eliminando, setEliminando] = useState(false);

  // ESTADOS DE EDICIÓN
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [formulario, setFormulario] = useState(
    () => crearFormulario(producto)
  );

  const [archivoImagen, setArchivoImagen] = useState(null);
  const [previewImagen, setPreviewImagen] = useState('');

  // MENSAJES
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  // IMAGEN ACTUAL
  const imagenActual =
    producto.imagen ||
    imagenesProductos[producto.nombre?.trim()] ||
    '';

  // VISTA PREVIA DE ARCHIVO LOCAL
  useEffect(() => {
    if (!archivoImagen) {
      setPreviewImagen('');
      return;
    }

    const urlTemporal = URL.createObjectURL(archivoImagen);

    setPreviewImagen(urlTemporal);

    return () => {
      URL.revokeObjectURL(urlTemporal);
    };
  }, [archivoImagen]);

  const imagenEdicion =
    previewImagen ||
    formulario.imagen ||
    imagenActual;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulario((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const abrirEdicion = () => {
    setFormulario(crearFormulario(producto));
    setArchivoImagen(null);
    setMensajeError('');
    setMensajeExito('');
    setConfirmarEliminar(false);
    setEditando(true);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setFormulario(crearFormulario(producto));
    setArchivoImagen(null);
    setMensajeError('');
  };

  const handleImagenChange = (e) => {
    const archivo = e.target.files?.[0];

    if (!archivo) {
      setArchivoImagen(null);
      return;
    }

    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!tiposPermitidos.includes(archivo.type)) {
      setMensajeError(
        'Solo se permiten imágenes JPG, PNG o WebP.'
      );
      e.target.value = '';
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setMensajeError(
        'La imagen no puede superar los 5 MB.'
      );
      e.target.value = '';
      return;
    }

    setMensajeError('');
    setArchivoImagen(archivo);
  };

  const handleGuardarCambios = async (e) => {
    e.preventDefault();

    if (!esAdmin || guardando) return;

    setGuardando(true);
    setMensajeError('');
    setMensajeExito('');

    const token =
      session?.token || localStorage.getItem('token');

    try {

      if (!token) {
        throw new Error(
          'Iniciá sesión como administrador.'
        );
      }

      let urlImagen = formulario.imagen;

      if (archivoImagen) {

        const formData = new FormData();
        formData.append('archivo', archivoImagen);

        const respuestaImagen = await fetch(
          '/api/productos/imagen',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: formData
          }
        );

        if (!respuestaImagen.ok) {
          throw new Error(
            `Error al subir imagen: ${respuestaImagen.status}`
          );
        }

        const resultadoImagen =
          await respuestaImagen.json();

        if (!resultadoImagen.url) {
          throw new Error(
            'El servidor no devolvió la URL de la imagen.'
          );
        }

        urlImagen = resultadoImagen.url;
      }

      if (!urlImagen) {
        throw new Error(
          'El producto debe tener una imagen.'
        );
      }

      const precioNumerico = Number(formulario.precio);
      const stockNumerico = Number(formulario.stock);

      if (
        !formulario.nombre.trim() ||
        formulario.precio.trim() === '' ||
        !Number.isFinite(precioNumerico) ||
        precioNumerico < 0
      ) {
        throw new Error(
          'Ingresá un nombre y un precio válido.'
        );
      }

      if (
        formulario.stock.trim() === '' ||
        !Number.isInteger(stockNumerico) ||
        stockNumerico < 0
      ) {
        throw new Error(
          'Ingresá un stock válido.'
        );
      }

      const productoActualizado = {
        nombre: formulario.nombre.trim(),
        precio: precioNumerico,
        descripcion: formulario.descripcion.trim(),
        nombreCategoria: formulario.nombreCategoria,
        talle: formulario.talle,
        stock: stockNumerico,
        imagen: urlImagen,
        etiquetas: formulario.etiquetas
          .split(',')
          .map((etiqueta) => etiqueta.trim())
          .filter(Boolean)
      };

      const respuesta = await fetch(
        `/api/productos/${producto.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(productoActualizado)
        }
      );

      if (!respuesta.ok) {
        throw new Error(
          `Error al modificar producto: ${respuesta.status}`
        );
      }

      const productoGuardado = await respuesta.json();

      if (onActualizar) {
        onActualizar(productoGuardado);
      }

      setArchivoImagen(null);
      setEditando(false);

      setMensajeExito(
        '¡Producto actualizado correctamente!'
      );

    } catch (error) {
      setMensajeError(error.message);

    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async () => {

    if (!esAdmin || eliminando) return;

    setEliminando(true);
    setMensajeError('');
    setMensajeExito('');

    try {

      const token =
        session?.token || localStorage.getItem('token');

      if (!token) {
        throw new Error(
          'Iniciá sesión como administrador.'
        );
      }

      const res = await fetch(
        `/api/productos/${producto.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!res.ok) {
        throw new Error(
          'Error al eliminar producto. Verificá tener rol ADMIN.'
        );
      }

      setConfirmarEliminar(false);

      if (onEliminar) {
        onEliminar(producto.id);
      }

    } catch (err) {
      setMensajeError(err.message);
      setConfirmarEliminar(false);

    } finally {
      setEliminando(false);
    }
  };

  const handleAddToCart = () => {
    if (sinStock) {
      setMensajeError('Este producto no tiene stock disponible.');
      return;
    }

    if (typeof onAddToCart === 'function') {
      onAddToCart(producto);
    } else {
      console.warn(
        'El carrito todavía no está conectado a ProductCard.'
      );
    }
  };

  const formatearPrecio = (valor) => {
    const numero = Number(valor);

    return Number.isFinite(numero)
      ? new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
      }).format(numero)
      : 'Precio no disponible';
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

      {/* IMAGEN */}
      <div className="product-image-container">
        {imagenActual ? (
          <img
            src={imagenActual}
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

      <h3 className="product-name" style={{ marginTop: 0 }}>
        {producto.nombre}
      </h3>

      <p className="product-description">
        {producto.descripcion}
      </p>

      <p
        className="precio product-price"
        style={{
          fontSize: '1.3rem',
          fontWeight: 'bold',
          marginBottom: '6px'
        }}
      >
        {formatearPrecio(producto.precio)}
      </p>

      {/* INDICADOR DE STOCK */}
      <p
        style={{
          fontSize: '0.85rem',
          fontWeight: 'bold',
          marginTop: 0,
          marginBottom: '15px',
          color: sinStock ? '#dc2626' : '#15803d'
        }}
      >
        {sinStock ? 'Sin stock' : `Stock disponible: ${stockDisponible}`}
      </p>

      {mensajeExito && (
        <p role="status" style={{ color: '#15803d', fontWeight: 'bold', fontSize: '0.85rem' }}>
          {mensajeExito}
        </p>
      )}

      {mensajeError && (
        <p role="alert" style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '0.85rem' }}>
          {mensajeError}
        </p>
      )}

      {/* FORMULARIO DE EDICIÓN */}
      {esAdmin && editando && (
        <form
          onSubmit={handleGuardarCambios}
          style={{
            backgroundColor: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            color: '#0f172a'
          }}
        >
          <h4 style={{ margin: 0 }}>✏️ Editar producto</h4>
          <label style={estilos.label}>
            Nombre
            <input type="text" name="nombre" value={formulario.nombre} onChange={handleChange} required style={estilos.input} />
          </label>
          <label style={estilos.label}>
            Precio (ARS)
            <input type="number" name="precio" min="0" step="any" value={formulario.precio} onChange={handleChange} required style={estilos.input} />
          </label>
          <label style={estilos.label}>
            Descripción
            <textarea name="descripcion" value={formulario.descripcion} onChange={handleChange} rows="3" style={estilos.input} />
          </label>
          <label style={estilos.label}>
            Categoría
            <select name="nombreCategoria" value={formulario.nombreCategoria} onChange={handleChange} style={estilos.input}>
              {CATEGORIAS.map((categoria) => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </label>
          <label style={estilos.label}>
            Talle
            <select name="talle" value={formulario.talle} onChange={handleChange} style={estilos.input}>
              {TALLES.map((talle) => (
                <option key={talle} value={talle}>{talle}</option>
              ))}
            </select>
          </label>
          <label style={estilos.label}>
            Stock disponible
            <input type="number" name="stock" min="0" step="1" value={formulario.stock} onChange={handleChange} required style={estilos.input} />
          </label>
          <label style={estilos.label}>
            Etiquetas separadas por coma
            <input type="text" name="etiquetas" value={formulario.etiquetas} onChange={handleChange} style={estilos.input} />
          </label>
          <label style={estilos.label}>
            Ruta o URL de imagen
            <input type="text" name="imagen" value={formulario.imagen} onChange={handleChange} style={estilos.input} placeholder="/uploads/imagen.jpg" />
          </label>
          <label style={estilos.label}>
            O seleccionar nueva imagen
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImagenChange} style={estilos.input} />
          </label>
          {imagenEdicion && (
            <img src={imagenEdicion} alt="Vista previa de edición" style={{ width: '100%', height: '150px', objectFit: 'contain', backgroundColor: '#ffffff', borderRadius: '8px' }} />
          )}
          <button type="submit" disabled={guardando} style={{ ...estilos.botonGuardar, opacity: guardando ? 0.6 : 1 }}>
            {guardando ? 'Guardando...' : '✓ Guardar cambios'}
          </button>
          <button type="button" onClick={cancelarEdicion} disabled={guardando} style={estilos.botonCancelar}>
            Cancelar
          </button>
        </form>
      )}

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

        {/* SOLO MOSTRAMOS EL BOTON DE AÑADIR SI NO ES ADMIN Y BLOQUEAMOS SI NO HAY STOCK */}
        {!esAdmin && (
          <button
            className="btn-onoff"
            type="button"
            disabled={sinStock}
            onClick={handleAddToCart}
            style={{
              width: '100%',
              minHeight: '44px',
              boxSizing: 'border-box',
              cursor: sinStock ? 'not-allowed' : 'pointer',
              opacity: sinStock ? 0.5 : 1
            }}
          >
            {sinStock ? '🚫 Sin stock' : '🛒 Añadir al carrito'}
          </button>
        )}

        {/* EDITAR PRODUCTO - SOLO ADMIN */}
        {esAdmin && (
          <Link
            to={`/editar/${producto.id}`}
            className="btn-onoff"
            style={{
              width: '100%',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              textDecoration: 'none',
              backgroundColor: '#1D428A',
              color: '#ffffff',
              borderRadius: '25px',
              fontWeight: 'bold'
            }}
          >
            ✏️ Editar producto
          </Link>
        )}

        {/* ELIMINAR SOLO ADMIN */}
        {esAdmin && (
          <div>
            <button
              type="button"
              onClick={() => {
                setMensajeError('');
                setConfirmarEliminar(true);
              }}
              disabled={eliminando || guardando}
              className="btn-onoff activo"
              style={{
                width: '100%',
                minHeight: '44px'
              }}
            >
              🗑 Eliminar
            </button>

            {confirmarEliminar && (
              <div
                className="confirmar-eliminar"
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  color: '#0f172a',
                  marginTop: '10px'
                }}
              >
                <p>¿Seguro que querés eliminar este producto?</p>
                <button type="button" onClick={handleDelete} disabled={eliminando}>
                  {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
                <button type="button" onClick={() => setConfirmarEliminar(false)} disabled={eliminando}>
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const estilos = {
  label: { display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.85rem', fontWeight: 'bold', color: '#0f172a' },
  input: { width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '7px', backgroundColor: '#ffffff', color: '#0f172a', boxSizing: 'border-box', fontSize: '0.9rem' },
  botonGuardar: { backgroundColor: '#1D428A', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 'bold', cursor: 'pointer' },
  botonCancelar: { backgroundColor: '#ffffff', color: '#1D428A', border: '1px solid #1D428A', borderRadius: '8px', padding: '10px', fontWeight: 'bold', cursor: 'pointer' }
};

export default ProductCard;