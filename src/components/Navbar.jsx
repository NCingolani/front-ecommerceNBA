import { Link } from "react-router-dom";

export default function Navbar({ busqueda, setBusqueda, cantidadCarrito }) {
  return (
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
          🛒 {cantidadCarrito}
        </span>
      </div>
    </header>
  );
}