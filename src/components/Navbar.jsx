import { Link } from "react-router-dom";
import OnOff from "./OnOff";
import { useAuth } from "../auth/AuthContext";

export default function Navbar({ cantidadCarrito, onToggleColor }) {
  const { session, logout } = useAuth();

  // Verificamos si es administrador
  const isAdmin = session?.role === "ADMIN";

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
        {/* SOLO MOSTRAMOS EL CARRITO SI NO ES ADMIN */}
        {!isAdmin && (
          <span aria-label="Productos agregados al carrito">
            <Link to="/carrito" style={{ textDecoration: 'none', color: 'inherit' }}>
              🛒 {cantidadCarrito}
            </Link>
          </span>
        )}
        <OnOff onToggle={onToggleColor} />
        {isAdmin && <Link to="/crear">Añadir producto</Link>}
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