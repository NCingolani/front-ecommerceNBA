import { Link } from "react-router-dom";

export default function Footer() {
  return (
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
        <a href="/#ofertas">Ofertas</a>
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
  );
}
