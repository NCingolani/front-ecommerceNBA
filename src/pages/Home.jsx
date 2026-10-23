import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Categorias from "../components/Categorias";
import Footer from "../components/Footer";
import "./Home.css";

const pesos = (valor) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  // Llamada a la base de datos (API)
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // Reemplaza estas URLs con los endpoints de tu backend (Ej: Node/Express, Firebase, etc.)
        const resProductos = await fetch("http://localhost:3000/api/productos");
        const dataProductos = await resProductos.json();
        
        const resCategorias = await fetch("http://localhost:3000/api/categorias");
        const dataCategorias = await resCategorias.json();

        setProductos(dataProductos);
        setCategorias(dataCategorias);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerDatos();
  }, []); // El array vacío asegura que solo se ejecute una vez al montar el componente

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarAlCarrito = (producto) => {
    setCarrito((anterior) => [...anterior, producto]);
  };

  return (
    <div className="nba-home">
      <Navbar 
        busqueda={busqueda} 
        setBusqueda={setBusqueda} 
        cantidadCarrito={carrito.length} 
      />

      <main>
        {/* HERO */}
        <section id="inicio" className="nba-hero">
          <Link
            to="/productos"
            className="nba-banner-link"
            aria-label="Ver productos NBA"
          />
        </section>

        {/* COMPONENTE CATEGORÍAS */}
        {!cargando && <Categorias categorias={categorias} />}

        {/* PRODUCTOS DESTACADOS */}
        <section id="productos" className="nba-section">
          <div className="nba-heading">
            <h2>PRODUCTOS DESTACADOS</h2>
            <Link to="/productos">Ver todos los productos →</Link>
          </div>

          {cargando ? (
            <p>Cargando información de la base de datos...</p>
          ) : (
            <>
              <div className="nba-productos">
                {productosFiltrados.map((producto) => (
                  <article className="nba-card" key={producto.id}>
                    <div className="nba-card-imagen">
                      <img src={producto.imagen} alt={producto.nombre} />
                    </div>

                    <div className="nba-card-info">
                      <h3>{producto.nombre}</h3>
                      <strong>{pesos(producto.precio)}</strong>
                      <p className="nba-stars">
                        ★★★★★ <small>(98)</small>
                      </p>

                      <Link to={`/producto/${producto.id}`} className="nba-ver-detalle">
                        Ver detalle →
                      </Link>

                      <button type="button" onClick={() => agregarAlCarrito(producto)}>
                        🛒 Añadir al carrito
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {productosFiltrados.length === 0 && (
                <p>No hay productos con ese nombre.</p>
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

      <Footer />
    </div>
  );
}