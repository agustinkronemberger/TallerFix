import { useEffect, useState } from 'react';
import { TALLER_CONFIG } from './config';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function Reparaciones() {
  const [reparaciones, setReparaciones] = useState([]);
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cliente, setCliente] = useState('');
  const [equipo, setEquipo] = useState('');
  const [trabajo, setTrabajo] = useState('');
  const [precio, setPrecio] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  useEffect(() => {
    cargarReparaciones();
  }, []);

  const cargarReparaciones = async () => {
    try {
      const res = await fetch(`${API_URL}/reparaciones`);
      const data = await res.json();
      setReparaciones(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar reparaciones:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/reparaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni, cliente, telefono, equipo, trabajo, precio })
    });

    setDni(''); setCliente(''); setTelefono(''); setEquipo(''); setTrabajo(''); setPrecio('');
    cargarReparaciones();
  };

  const formatearTelefonoWA = (numero) => {
    if (!numero) return '';
    let limpio = numero.replace(/\D/g, '');
    if (limpio.startsWith('0')) limpio = limpio.slice(1);
    if (limpio.startsWith('549') && limpio.length === 13) return limpio;
    if (limpio.length === 10) return `549${limpio}`;
    if (limpio.startsWith('54') && limpio.length === 12) return `549${limpio.slice(2)}`;
    return limpio;
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    await fetch(`${API_URL}/reparaciones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    });

    if (nuevoEstado === 'Listo') {
      const rep = reparaciones.find((r) => r.id === id);
      if (rep && rep.telefono) {
        const telefonoWA = formatearTelefonoWA(rep.telefono);
        const mensaje = TALLER_CONFIG.mensajeWhatsapp(rep.cliente, rep.equipo, rep.precio);
        const urlWs = `https://wa.me/${telefonoWA}?text=${encodeURIComponent(mensaje)}`;
        window.open(urlWs, '_blank');
      } else {
        alert("El equipo se marcó como Listo, pero el cliente no tiene un teléfono registrado para avisarle.");
      }
    }
    cargarReparaciones();
  };

  const borrarReparacion = async (id) => {
    await fetch(`${API_URL}/reparaciones/${id}`, { method: 'DELETE' });
    cargarReparaciones();
  };

  const getStatusColor = (estado) => {
    if (estado === 'Ingresado') return 'var(--state-ingresado)';
    if (estado === 'En Proceso') return 'var(--state-proceso)';
    if (estado === 'Listo') return 'var(--state-listo)';
    return 'gray';
  };

  const reparacionesFiltradas = reparaciones.filter((rep) => {
    const termino = busqueda.toLowerCase();
    const coincideTexto = rep.cliente.toLowerCase().includes(termino) || rep.equipo.toLowerCase().includes(termino);
    const coincideEstado = filtroEstado === 'Todos' || rep.estado === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  return (
    <main className="app-header">
      <header className="app-header">
        <h1>🛠️ {TALLER_CONFIG.nombre} - {TALLER_CONFIG.subtitulo}</h1>
      </header>

      <section className="form-section">
        <h2>Ingresar Nuevo Equipo</h2>
        <form onSubmit={handleSubmit} className="form-group">
          <input 
            type="text" 
            placeholder="Nombre del Cliente" 
            value={cliente} 
            onChange={e => setCliente(e.target.value)} 
            required 
            className="input-field" 
          />
          <input 
            type="text" 
            placeholder="DNI del Cliente" 
            value={dni} 
            onChange={e => setDni(e.target.value)} 
            required 
            className="input-field" 
          />
          <input 
            type="tel" 
            placeholder="Teléfono del Cliente (ej: 3413555444)" 
            value={telefono} 
            onChange={e => setTelefono(e.target.value)} 
            className="input-field" 
          />
          <input 
            type="text" 
            placeholder="Equipo (Ej: Notebook Dell Inspiron)" 
            value={equipo} 
            onChange={e => setEquipo(e.target.value)} 
            required 
            className="input-field" 
          />
          <input 
            type="text" 
            placeholder="Trabajo a realizar (Ej: Limpieza y pasta térmica)" 
            value={trabajo} 
            onChange={e => setTrabajo(e.target.value)} 
            required 
            className="input-field" 
          />
          <input 
            type="number" 
            placeholder="Presupuesto estimado ($)" 
            value={precio} 
            onChange={e => setPrecio(e.target.value)} 
            className="input-field" 
          />
          <button type="submit" className="btn-primary">Registrar Ingreso</button>
        </form>
      </section>

      <section>
        <h2>Equipos en el Taller</h2>
        <div className="filtros-container">
          {['Todos', 'Ingresado', 'En Proceso', 'Listo'].map((estado) => (
            <button 
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`btn-filtro ${filtroEstado === estado ? 'activo' : ''}`}
            >
              {estado}
            </button>
          ))}
        </div>

        <div className="search-container">
          <input 
            type="text" 
            placeholder="🔍 Buscar por cliente o equipo..." 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)} 
            className="input-field search-input"
          />
        </div>

        {reparacionesFiltradas.length === 0 ? (
          <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
            No se encontraron equipos...
          </p>
        ) : (
          <div className="repair-list">
            {reparacionesFiltradas.map((rep) => (
              <article key={rep.id} className="repair-card">
                <div className="repair-info">
                  <h4>{rep.equipo} - <span className="repair-client">{rep.cliente}</span></h4>
                  <p className="repair-details">{rep.trabajo} | Presupuesto: ${rep.precio}</p>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(rep.estado) }}>
                    {rep.estado}
                  </span>
                </div>

                <div className="repair-controls">
                  <select 
                    value={rep.estado} 
                    onChange={(e) => cambiarEstado(rep.id, e.target.value)}
                    className="select-status"
                    aria-label="Cambiar estado del equipo"
                  >
                    <option value="Ingresado">Ingresado</option>
                    <option value="En Proceso">En Proceso</option>
                    <option value="Listo">Listo</option>
                  </select>
                  <button onClick={() => borrarReparacion(rep.id)} className="btn-danger" aria-label="Eliminar registro">
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}