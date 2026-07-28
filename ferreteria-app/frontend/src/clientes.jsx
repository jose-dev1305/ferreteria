import React, { useState, useEffect } from 'react';

// Endpoint HTTPS centralizado
const API_BASE = 'https://backend-production-4d48.up.railway.app/api';

const Clientes = () => {
  // Estado para el formulario con los campos de la base de datos
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    fecha_registro: new Date().toISOString().split('T')[0]
  });

  // Estado para almacenar la lista de clientes
  const [clientes, setClientes] = useState([]);

  // Estado para la barra de búsqueda en tiempo real
  const [busqueda, setBusqueda] = useState('');

  // Estado para saber si estamos editando un cliente
  const [editandoId, setEditandoId] = useState(null);

  // 1. Obtener todos los clientes desde el backend
  const obtenerClientes = async () => {
    try {
      const respuesta = await fetch(`${API_BASE}/clientes`);
      if (!respuesta.ok) throw new Error('Error al obtener la lista de clientes');
      const datos = await respuesta.json();
      setClientes(Array.isArray(datos) ? datos : []);
    } catch (error) {
      console.error('Error al obtener los clientes:', error);
      setClientes([]);
    }
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  // Limpiar y resetear formulario
  const resetearFormulario = () => {
    setForm({
      nombre: '',
      telefono: '',
      email: '',
      fecha_registro: new Date().toISOString().split('T')[0]
    });
    setEditandoId(null);
  };

  // 2. Manejar cambios en los inputs del formulario
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // 3. Enviar el formulario (Guardar nuevo o Actualizar existente)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editandoId
        ? `${API_BASE}/clientes/${editandoId}`
        : `${API_BASE}/clientes`;

      const metodo = editandoId ? 'PUT' : 'POST';

      const respuesta = await fetch(url, {
        method: metodo,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        alert(editandoId ? 'Cliente actualizado exitosamente' : 'Cliente guardado exitosamente');
        resetearFormulario();
        obtenerClientes();
      } else {
        alert('Error: ' + (resultado.error || resultado.message || 'No se pudo procesar la solicitud'));
      }
    } catch (error) {
      console.error('Error al guardar el cliente:', error);
      alert('Ocurrió un error al conectar con el servidor.');
    }
  };

  // 4. Preparar formulario para Editar un cliente
  const iniciarEdicion = (cliente) => {
    setForm({
      nombre: cliente.nombre || '',
      telefono: cliente.telefono || '',
      email: cliente.email || '',
      fecha_registro: cliente.fecha_registro ? cliente.fecha_registro.split('T')[0] : ''
    });
    setEditandoId(cliente.id_cliente);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 5. Eliminar un cliente
  const eliminarCliente = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) return;

    try {
      const respuesta = await fetch(`${API_BASE}/clientes/${id}`, {
        method: 'DELETE'
      });

      if (respuesta.ok) {
        alert('Cliente eliminado correctamente');
        obtenerClientes();
      } else {
        const resultado = await respuesta.json();
        alert('Error al eliminar: ' + (resultado.error || resultado.message || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error al eliminar el cliente:', error);
      alert('Ocurrió un error al conectar con el servidor.');
    }
  };

  // Filtrar clientes para la búsqueda en tiempo real
  const clientesFiltrados = clientes.filter((cliente) => {
    const texto = busqueda.toLowerCase();
    const nombre = (cliente.nombre || '').toLowerCase();
    const email = (cliente.email || '').toLowerCase();
    const telefono = (cliente.telefono || '').toLowerCase();
    const id = String(cliente.id_cliente || '');

    return nombre.includes(texto) || email.includes(texto) || telefono.includes(texto) || id.includes(texto);
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12 w-full text-slate-100">
      {/* Formulario de Alta / Edición de Clientes */}
      <div className="bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-2xl p-6 md:p-8 border border-slate-800 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-slate-800 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-3">
              <span className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl text-lg border border-blue-500/30">👥</span>
              {editandoId ? 'Actualizar Datos del Cliente' : 'Gestión y Registro de Clientes'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {editandoId ? `Modificando la información del cliente ID: #${editandoId}` : 'Ingrese la información personal y de contacto para registrar un nuevo cliente.'}
            </p>
          </div>
          {editandoId && (
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs px-3.5 py-1.5 rounded-lg uppercase tracking-wider">
              Modo Edición Activo
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre Completo / Razón Social */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Nombre Completo / Razón Social
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Ej. Juan Pérez o Comercializadora S.A."
              className="w-full p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-white font-medium transition-all text-sm placeholder-slate-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Teléfono */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Ej. 555-0192"
                className="w-full p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-white font-medium transition-all text-sm placeholder-slate-600"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Correo Electrónico (Email)
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Ej. correo@cliente.com"
                className="w-full p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-white font-medium transition-all text-sm placeholder-slate-600"
              />
            </div>

            {/* Fecha de Registro */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Fecha de Registro
              </label>
              <input
                type="date"
                name="fecha_registro"
                value={form.fecha_registro}
                onChange={handleChange}
                className="w-full p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-white font-medium transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-800">
            <button
              type="submit"
              className={`w-full sm:flex-1 py-3.5 px-6 rounded-xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm ${
                editandoId
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30'
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
              }`}
            >
              <span>{editandoId ? '💾' : '➕'}</span>
              {editandoId ? 'Guardar Cambios del Cliente' : 'Guardar Nuevo Cliente'}
            </button>

            {editandoId && (
              <button
                type="button"
                onClick={resetearFormulario}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors text-sm border border-slate-700"
              >
                Cancelar Edición
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Directorio General de Clientes */}
      <div className="bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-2xl p-6 md:p-8 border border-slate-800 w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
              <span>📋</span> Directorio General de Clientes
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Busque, consulte y administre la cartera de clientes registrados en el sistema.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            {/* Barra de Búsqueda */}
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre, correo, teléfono..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm font-medium focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none text-white transition-all placeholder-slate-500"
              />
            </div>

            {/* Contador de Clientes */}
            <div className="bg-blue-600/10 text-blue-400 font-extrabold text-xs px-4 py-3 rounded-xl border border-blue-500/20 text-center whitespace-nowrap">
              Total: {clientesFiltrados.length}
            </div>
          </div>
        </div>

        {/* Tabla de Clientes */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">ID</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4">Email</th>
                <th className="p-4">Fecha Registro</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800/60">
              {clientesFiltrados.map((cliente) => (
                <tr key={cliente.id_cliente} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-mono text-slate-500 font-bold">#{cliente.id_cliente}</td>
                  <td className="p-4 font-bold text-white">{cliente.nombre}</td>
                  <td className="p-4 text-slate-300 font-medium">
                    {cliente.telefono ? (
                      <span className="flex items-center gap-1.5">
                        <span className="text-slate-500">📞</span> {cliente.telefono}
                      </span>
                    ) : (
                      <span className="text-slate-600 italic">Sin registrar</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-300 font-medium">
                    {cliente.email ? (
                      <span className="text-blue-400 hover:underline">
                        {cliente.email}
                      </span>
                    ) : (
                      <span className="text-slate-600 italic">Sin registrar</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-300">
                    {cliente.fecha_registro ? new Date(cliente.fecha_registro).toLocaleDateString() : 'Sin fecha'}
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <button
                      onClick={() => iniciarEdicion(cliente)}
                      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarCliente(cliente.id_cliente)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500 font-medium text-sm">
                    No se encontraron clientes registrados que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clientes;