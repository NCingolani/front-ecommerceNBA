import { Link } from "react-router-dom";
import OnOff from "./OnOff";
import { useAuth } from "../auth/AuthContext";

export default function Navbar({ cantidadCarrito, onToggleColor }) {
  const { session, logout } = useAuth();

  return (
    <header className="nba-navbar">
      <Link to="/" className="nba-logo">
        ◉ Tienda <span>NBA</span>
      </Link>

      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/productos">Productos</Link>
        <a href="/#categorias">Categorías</a>
        <a href="/#ofertas">Ofertas</a>
        <a href="/#footer">Contacto</a>
      </nav>

      <div className="nba-nav-right">
        <span aria-label="Productos agregados al carrito">
          🛒 {cantidadCarrito}
        </span>
        <OnOff onToggle={onToggleColor} />
        {session?.role === "ADMIN" && <Link to="/crear">Añadir producto</Link>}
        {session ? (
          <button className="nba-auth-button" type="button" onClick={logout}>Cerrar sesión</button>
        ) : (
          <>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/registro">Crear cuenta</Link>
          </>
        )}
      </div>
    </header>
  );
}
