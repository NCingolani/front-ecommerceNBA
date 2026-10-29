import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import "./Home.css";

export default function Home({ onAddToCart }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const respuesta = await fetch("/api/productos");
        if (!respuesta.ok) throw new Error("No se pudieron cargar los productos.");

        const datos = await respuesta.json();
        setProductos(Array.isArray(datos) ? datos : []);
      } catch (error) {
        console.error("Error al obtener los productos:", error);
        setError("No se pudieron cargar los productos. Intenta nuevamente más tarde.");
      } finally {
        setCargando(false);
      }
    };

    obtenerDatos();
  }, []);

  const categorias = [...new Set(productos.map((producto) => producto.nombreCategoria).filter(Boolean))]
    .map((nombre) => ({ nombre }));

  return (
    <div className="nba-home">
      <main>
        {/* HERO */}
        <section id="inicio" className="nba-hero">
          <Link
            to="/productos"
            className="nba-banner-link"
            aria-label="Ver productos NBA"
          />
        </section>

        <section id="categorias" className="nba-section">
          <div className="nba-heading">
            <h2>CATEGORÍAS</h2>
            <Link to="/productos">Ver todos los productos →</Link>
          </div>
          {categorias.length > 0 ? (
            <div className="nba-categorias nba-categorias-lista">
              {categorias.map((categoria) => (
                <Link
                  to={`/productos?categoria=${encodeURIComponent(categoria.nombre)}`}
                  className="nba-categoria"
                  key={categoria.nombre}
                >
                  <div>
                    <h3>{categoria.nombre}</h3>
                    <small>Ver productos →</small>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p>Explorá todas nuestras categorías desde el catálogo.</p>
          )}
        </section>

        {/* PRODUCTOS DESTACADOS */}
        <section id="productos" className="nba-section">
          <div className="nba-heading">
            <h2>PRODUCTOS DESTACADOS</h2>
            <Link to="/productos">Ver todos los productos →</Link>
          </div>

          {cargando ? (
            <p>Cargando información de la base de datos...</p>
          ) : error ? (
            <p role="alert">{error}</p>
          ) : (
            <>
              <div className="nba-productos">
                {productos.map((producto) => (
                  <ProductCard
                    key={producto.id}
                    producto={producto}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>

              {productos.length === 0 && (
                <p>No hay productos disponibles.</p>
              )}
            </>
          )}
        </section>

        {/* BANNER DE OFERTAS */}
        <section id="ofertas" className="nba-ofertas">
          <h2>
            EQUÍPATE <span>COMO LOS GRANDES</span>
          </h2>
          <p>HASTA 30% DE DESCUENTO EN PRODUCTOS SELECCIONADOS</p>
          <Link to="/productos" className="nba-btn">
            Ver productos →
          </Link>
        </section>

        {/* BENEFICIOS */}
        <section className="nba-section">
          <div className="nba-heading">
            <h2>¿POR QUÉ ELEGIRNOS?</h2>
          </div>
          <div className="nba-beneficios">
            <div>
              🚚 <strong>Envíos a todo el país</strong>
              <small>Rápidos y seguros</small>
            </div>
            <div>
              🛡️ <strong>Productos originales</strong>
              <small>Calidad garantizada</small>
            </div>
            <div>
              💳 <strong>Múltiples medios de pago</strong>
              <small>Tarjetas y transferencias</small>
            </div>
            <div>
              🎧 <strong>Atención personalizada</strong>
              <small>Estamos para ayudarte</small>
            </div>
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="nba-newsletter">
          <div>
            <h2>✉ SUSCRIBITE A NUESTRO NEWSLETTER</h2>
            <p>Recibí ofertas exclusivas, lanzamientos y novedades.</p>
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Tu correo electrónico..." required />
            <button type="submit">Suscribirme</button>
          </form>
        </section>
      </main>

    </div>
  );
}
