import { useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const categorias = [
  { nombre: "CAMISETAS", imagen: "/Images/Categoria/camisetasCategorias.png" },
  { nombre: "SHORTS", imagen: "/Images/Categoria/shortCategoria.png" },
  { nombre: "ZAPATILLAS", imagen: "/Images/Categoria/zapatillaCategoria.png" },
  { nombre: "ACCESORIOS", imagen: "/Images/Categoria/accesoriosCategoria.png" },
];

const productos = [
  { id: 1, nombre: "Camiseta Pro Bicolor", precio: 45990, imagen: "/nba/productos/bulls.jpg" },
  { id: 2, nombre: "Camiseta City Edition", precio: 45990, imagen: "/nba/productos/warriors.jpg" },
  { id: 3, nombre: "Camiseta Retro 23", precio: 42990, imagen: "/nba/productos/bulls-retro.jpg" },
  { id: 4, nombre: "Camiseta Clásica 24", precio: 42990, imagen: "/nba/productos/lakers.jpg" },
  { id: 5, nombre: "Zapatillas High Performance", precio: 89990, imagen: "/nba/productos/zapatillas.jpg" },
  { id: 6, nombre: "Shorts Premium", precio: 34990, imagen: "/nba/productos/shorts.jpg" },
  { id: 7, nombre: "Balón Profesional", precio: 29990, imagen: "/nba/productos/balon.jpg" },
  { id: 8, nombre: "Mochila Deportiva", precio: 36990, imagen: "/nba/productos/mochila.jpg" },
];

const pesos = (valor) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(valor);

export default function Home() {
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarAlCarrito = (producto) => {
    setCarrito((anterior) => [...anterior, producto]);
  };

  return (
    <div className="nba-home">
      {/* NAVBAR */}
      <header className="nba-navbar">
        <Link to="/" className="nba-logo">
          ◉ Tienda <span>NBA</span>
        </Link>

        <nav>
          <Link to="/">Inicio</Link>
          <Link to="/productos">Productos</Link>
          <a href="#categorias">Categorías</a>
          <a href="#ofertas">Ofertas</a>
          <a href="#footer">Contacto</a>
        </nav>

        <div className="nba-nav-right">
          <input
            type="search"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <span aria-label="Productos agregados al carrito">
            🛒 {carrito.length}
          </span>
        </div>
      </header>

      <main>
        {/* HERO */}
            
        <section id="inicio" className="nba-hero">
            <Link
                to="/productos"
                className="nba-banner-link"
                aria-label="Ver productos NBA"
            />
        </section>

        {/* CATEGORÍAS */}
        <section id="categorias" className="nba-section">
          <div className="nba-heading">
            <h2>CATEGORÍAS</h2>
            <Link to="/productos">Ver todas las categorías →</Link>
          </div>

          <div className="nba-categorias">
            {categorias.map((categoria) => (
              <Link
                to="/productos"
                className="nba-categoria"
                key={categoria.nombre}
              >
                <img src={categoria.imagen} alt={categoria.nombre} />
                <div>
                  <h3>{categoria.nombre}</h3>
                  <small>Ver productos →</small>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* PRODUCTOS DESTACADOS */}
        <section id="productos" className="nba-section">
          <div className="nba-heading">
            <h2>PRODUCTOS DESTACADOS</h2>
            <Link to="/productos">Ver todos los productos →</Link>
          </div>

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

      {/* FOOTER */}
      <footer id="footer" className="nba-footer">
        <div>
          <h2>
            ◉ Tienda <span>NBA</span>
          </h2>
          <p>Tu tienda de baloncesto online.</p>
        </div>

        <div>
          <h4>Enlaces rápidos</h4>
          <Link to="/">Inicio</Link>
          <Link to="/productos">Productos</Link>
          <a href="#ofertas">Ofertas</a>
        </div>

        <div>
          <h4>Ayuda</h4>
          <p>Preguntas frecuentes</p>
          <p>Envíos y devoluciones</p>
        </div>

        <div>
          <h4>Medios de pago</h4>
          <p>Tarjetas · Transferencias</p>
        </div>
      </footer>
    </div>
  );
}