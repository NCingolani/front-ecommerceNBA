
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const MisPedidos = () => {
  const { session } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    const cargarPedidos = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/pedidos/mis-pedidos', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        if (!response.ok) {
          throw new Error(
            `No se pudieron cargar tus pedidos. HTTP ${response.status}`
          );
        }

        const datos = await response.json();

        if (activo) {
          setPedidos(datos);
        }
      } catch (err) {
        if (activo) {
          setError(err.message);
        }
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    if (session?.token) {
      cargarPedidos();
    } else {
      setLoading(false);
      setError('No encontramos una sesión válida.');
    }

    return () => {
      activo = false;
    };
  }, [session?.token]);

  const formatearPrecio = (precio) =>
    Number(precio || 0).toLocaleString('es-AR', {
      style: 'currency',
      currency: 'ARS',
    });

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';

    const valor = new Date(fecha);
    return Number.isNaN(valor.getTime())
      ? 'Fecha no disponible'
      : valor.toLocaleString('es-AR');
  };

  return (
    <main
      style={{
        maxWidth: 1050,
        margin: '0 auto',
        padding: '36px 20px 70px',
        minHeight: '65vh',
      }}
    >
      <h1>📦 Mis pedidos</h1>
      <p>Consultá las compras que realizaste en Tienda NBA.</p>

      {loading && <p>Cargando tus pedidos...</p>}

      {error && (
        <p role="alert" style={{ color: '#e74c3c' }}>
          {error}
        </p>
      )}

      {!loading && !error && pedidos.length === 0 && (
        <section style={{
          padding: 30,
          border: '1px solid #ccc',
          borderRadius: 12,
          marginTop: 25,
        }}>
          <h2>Todavía no tenés pedidos</h2>
          <p>Cuando realices una compra, podrás verla acá.</p>
          <Link to="/productos">Explorar productos</Link>
        </section>
      )}

      {!loading && !error && pedidos.map((pedido) => (
        <article
          key={pedido.id}
          style={{
            background: '#fff',
            color: '#171717',
            borderRadius: 14,
            padding: 24,
            marginTop: 22,
            boxShadow: '0 3px 14px rgba(0,0,0,0.12)',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 15,
            flexWrap: 'wrap',
          }}>
            <h2 style={{ margin: 0 }}>
              Pedido #{pedido.id}
            </h2>

            <span style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '7px 12px',
              borderRadius: 20,
              fontWeight: 600,
            }}>
              {pedido.estado === 'CONFIRMADO_SIMULADO'
                ? 'Compra simulada confirmada'
                : pedido.estado}
            </span>
          </div>

          <p style={{ color: '#666' }}>
            {formatearFecha(pedido.fecha)}
          </p>

          <hr />

          <h3>Productos comprados</h3>

          {(pedido.detalles || []).map((detalle, indice) => (
            <div
              key={`${pedido.id}-${indice}`}
              style={{
                padding: '12px 0',
                borderBottom: '1px solid #eee',
              }}
            >
              <strong>{detalle.nombre}</strong>
              <p>Cantidad: {detalle.cantidad}</p>
              <p>
                Precio unitario: {formatearPrecio(detalle.precioUnitario)}
              </p>
              <p>
                Subtotal: {formatearPrecio(detalle.subtotal)}
              </p>
            </div>
          ))}

          <h2 style={{ textAlign: 'right', marginTop: 22 }}>
            Total: {formatearPrecio(pedido.total)}
          </h2>
        </article>
      ))}
    </main>
  );
};

export default MisPedidos;
