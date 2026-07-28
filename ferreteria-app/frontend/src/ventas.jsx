import React, { useEffect, useState } from 'react';

// Endpoints HTTPS centralizados
const API_BASE = 'https://backend-production-4d48.up.railway.app/api';

function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [idEditando, setIdEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  // Datos principales del formulario
  const [formVenta, setFormVenta] = useState({
    id_cliente: '',
    fecha_venta: new Date().toISOString().split('T')[0]
  });

  // Lista dinámica de productos con precio y subtotal individual
  const [itemsVenta, setItemsVenta] = useState([
    { id_producto: '', precio_unitario: 0, cantidad: 1 }
  ]);

  // Cargar datos iniciales desde la API
  const cargarVentas = () => {
    fetch(`${API_BASE}/ventas`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener ventas');
        return res.json();
      })
      .then((data) => setVentas(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error al cargar ventas:', err));
  };

  const cargarProductos = () => {
    fetch(`${API_BASE}/productos`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener productos');
        return res.json();
      })
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error al cargar productos:', err));
  };

  const cargarClientes = () => {
    fetch(`${API_BASE}/clientes`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener clientes');
        return res.json();
      })
      .then((data) => setClientes(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error al cargar clientes:', err));
  };

  useEffect(() => {
    cargarVentas();
    cargarProductos();
    cargarClientes();
  }, []);

  // Limpiar y resetear formulario
  const resetearFormulario = () => {
    setFormVenta({
      id_cliente: '',
      fecha_venta: new Date().toISOString().split('T')[0]
    });
    setItemsVenta([{ id_producto: '', precio_unitario: 0, cantidad: 1 }]);
    setIdEditando(null);
  };

  // Manejar cambios en la lista de productos
  const agregarFilaProducto = () => {
    setItemsVenta([...itemsVenta, { id_producto: '', precio_unitario: 0, cantidad: 1 }]);
  };

  const eliminarFilaProducto = (index) => {
    if (itemsVenta.length === 1) {
      alert('Debe haber al menos un producto en la venta.');
      return;
    }
    const nuevosItems = itemsVenta.filter((_, i) => i !== index);
    setItemsVenta(nuevosItems);
  };

  const actualizarFilaItem = (index, campo, valor) => {
    const nuevosItems = [...itemsVenta];

    if (campo === 'id_producto') {
      const productoSeleccionado = productos.find(p => String(p.id_producto) === String(valor));
      nuevosItems[index].id_producto = valor;
      nuevosItems[index].precio_unitario = productoSeleccionado ? Number(productoSeleccionado.precio) : 0;
    } else if (campo === 'cantidad') {
      nuevosItems[index].cantidad = valor === '' ? '' : Math.max(1, parseInt(valor) || 1);
    }

    setItemsVenta(nuevosItems);
  };

  // Calcular el total general a pagar
  const calcularTotalPagar = () => {
    return itemsVenta.reduce((acc, item) => {
      const subtotal = (Number(item.precio_unitario) || 0) * (Number(item.cantidad) || 0);
      return acc + subtotal;
    }, 0);
  };

  // Cargar datos para editar
  const handleEditarClick = (vta) => {
    const id = vta.id_venta || vta.id;
    setIdEditando(id);

    const fechaFormateada = vta.fecha_venta 
      ? new Date(vta.fecha_venta).toISOString().split('T')[0] 
      : '';

    const productoEncontrado = productos.find(p => String(p.id_producto) === String(vta.id_producto));
    const precio = productoEncontrado ? Number(productoEncontrado.precio) : 0;

    setFormVenta({
      id_cliente: vta.id_cliente || '',
      fecha_venta: fechaFormateada
    });

    setItemsVenta([
      { id_producto: vta.id_producto || '', precio_unitario: precio, cantidad: vta.cantidad || 1 }
    ]);
  };

  // Eliminar venta
  const handleEliminarClick = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro de venta?')) {
      fetch(`${API_BASE}/ventas/${id}`, {
        method: 'DELETE'
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.message || 'Venta eliminada');
          cargarVentas();
        })
        .catch((err) => console.error('Error al eliminar venta:', err));
    }
  };

  // Enviar formulario (Guardar / Actualizar)
  const handleVentaSubmit = (e) => {
    e.preventDefault();
    const esEdicion = idEditando !== null;
    
    if (esEdicion) {
      const datosActualizados = {
        id_producto: itemsVenta[0].id_producto,
        id_cliente: formVenta.id_cliente,
        cantidad: itemsVenta[0].cantidad,
        precio_unitario: itemsVenta[0].precio_unitario,
        fecha_venta: formVenta.fecha_venta
      };

      fetch(`${API_BASE}/ventas/${idEditando}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosActualizados)
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.message || 'Venta actualizada');
          resetearFormulario();
          cargarVentas();
        })
        .catch((err) => console.error('Error al actualizar venta:', err));
      return;
    }

    const datosNuevos = {
      id_cliente: formVenta.id_cliente,
      fecha_venta: formVenta.fecha_venta,
      productos: itemsVenta
    };

    fetch(`${API_BASE}/ventas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosNuevos)
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || 'Venta registrada con éxito');
        resetearFormulario();
        cargarVentas();
      })
      .catch((err) => console.error('Error al registrar venta:', err));
  };

  // Filtrar ventas por búsqueda
  const ventasFiltradas = ventas.filter((vta) => {
    const texto = busqueda.toLowerCase();
    const producto = (vta.producto || '').toLowerCase();
    const cliente = (vta.cliente || '').toLowerCase();
    const id = String(vta.id_venta || vta.id || '');
    const fecha = vta.fecha_venta ? new Date(vta.fecha_venta).toLocaleDateString() : '';

    return producto.includes(texto) || cliente.includes(texto) || id.includes(texto) || fecha.includes(texto);
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12 w-full text-slate-100">
      {/* Formulario Estilo Dark Dashboard */}
      <div className="bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-2xl p-6 md:p-8 border border-slate-800 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-slate-800 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-3">
              <span className="p-2.5 bg-orange-600/20 text-orange-400 rounded-xl text-lg border border-orange-500/30">🛒</span>
              {idEditando ? 'Actualizar Registro de Venta' : 'Módulo de Facturación y Ventas'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {idEditando ? `Editando la venta ID: #${idEditando}` : 'Seleccione el cliente, agregue los productos y liquide la transacción.'}
            </p>
          </div>
          {idEditando && (
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs px-3.5 py-1.5 rounded-lg uppercase tracking-wider">
              Modo Edición Activo
            </span>
          )}
        </div>

        <form onSubmit={handleVentaSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selector de Cliente */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Cliente
              </label>
              <select
                required
                value={formVenta.id_cliente}
                onChange={(e) => setFormVenta({ ...formVenta, id_cliente: e.target.value })}
                className="w-full p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:bg-slate-950 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none text-white font-medium transition-all text-sm"
              >
                <option value="" className="bg-slate-900 text-slate-400">Seleccione un cliente...</option>
                {clientes.map((cli) => (
                  <option key={cli.id_cliente} value={cli.id_cliente} className="bg-slate-900 text-white">
                    {cli.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha de Venta */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Fecha de Venta
              </label>
              <input
                type="date"
                required
                value={formVenta.fecha_venta}
                onChange={(e) => setFormVenta({ ...formVenta, fecha_venta: e.target.value })}
                className="w-full p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl focus:bg-slate-950 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none text-white font-medium transition-all text-sm"
              />
            </div>
          </div>

          {/* Sección Dinámica de Productos */}
          <div className="border-t border-slate-800 pt-6 mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <label className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <span>📦</span> Productos y Detalle de Cuenta
              </label>
              {!idEditando && (
                <button
                  type="button"
                  onClick={agregarFilaProducto}
                  className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <span>➕</span> Agregar otro producto
                </button>
              )}
            </div>

            <div className="space-y-3">
              {itemsVenta.map((item, index) => {
                const subtotal = (Number(item.precio_unitario) || 0) * (Number(item.cantidad) || 0);
                return (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    {/* Selector de Producto */}
                    <div className="sm:col-span-5">
                      <label className="block text-xs font-bold text-slate-400 mb-1">Producto</label>
                      <select
                        required
                        value={item.id_producto}
                        onChange={(e) => actualizarFilaItem(index, 'id_producto', e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm outline-none focus:border-orange-500"
                      >
                        <option value="" className="bg-slate-900 text-slate-400">Seleccione producto</option>
                        {productos.map((prod) => (
                          <option key={prod.id_producto} value={prod.id_producto} className="bg-slate-900 text-white">
                            {prod.nombre} (Stock: {prod.stock})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Precio Unitario */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 mb-1">Precio Unit.</label>
                      <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm font-bold text-slate-300 text-right">
                        ${Number(item.precio_unitario).toFixed(2)}
                      </div>
                    </div>

                    {/* Cantidad */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 mb-1">Cantidad</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => actualizarFilaItem(index, 'cantidad', e.target.value)}
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-center font-bold text-white outline-none focus:border-orange-500"
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 mb-1">Subtotal</label>
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm font-black text-amber-400 text-right">
                        ${subtotal.toFixed(2)}
                      </div>
                    </div>

                    {/* Botón Eliminar Fila */}
                    <div className="sm:col-span-1 flex justify-center items-end pt-2 sm:pt-5">
                      {itemsVenta.length > 1 && !idEditando && (
                        <button
                          type="button"
                          onClick={() => eliminarFilaProducto(index)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 w-9 h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center"
                          title="Eliminar fila"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total General a Pagar */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 text-white p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-center mt-6 shadow-xl gap-2">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-400">Total General a Pagar:</span>
              <span className="text-3xl font-black text-amber-400 font-mono">
                ${calcularTotalPagar().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-800">
            <button
              type="submit"
              className={`w-full sm:flex-1 py-3.5 px-6 rounded-xl text-white font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm ${
                idEditando 
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30' 
                  : 'bg-orange-600 hover:bg-orange-500 shadow-orange-900/30'
              }`}
            >
              <span>{idEditando ? '💾' : '💳'}</span>
              {idEditando ? 'Actualizar Registro de Venta' : 'Confirmar y Registrar Venta'}
            </button>

            {idEditando && (
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

      {/* Historial de Ventas Registradas */}
      <div className="bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-2xl p-6 md:p-8 border border-slate-800 w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white flex items-center gap-2">
              <span>📋</span> Historial de Ventas Registradas
            </h2>
            <p className="text-sm text-slate-400 mt-1">Consulte las transacciones pasadas, modifique registros o elimine ventas.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            {/* Barra de Búsqueda */}
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Buscar cliente, producto, fecha..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm font-medium focus:bg-slate-950 focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none text-white transition-all"
              />
            </div>

            {/* Contador de Ventas */}
            <div className="bg-orange-600/10 text-orange-400 font-extrabold text-xs px-4 py-3 rounded-xl border border-orange-500/20 text-center">
              Total: {ventasFiltradas.length}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/40">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">ID</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Cantidad</th>
                <th className="p-4">Fecha de Venta</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800/60">
              {ventasFiltradas.map((vta) => {
                const idVenta = vta.id_venta || vta.id;
                return (
                  <tr key={idVenta} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono text-slate-500 font-bold">#{idVenta}</td>
                    <td className="p-4 font-bold text-white">{vta.producto || 'Producto desconocido'}</td>
                    <td className="p-4 text-slate-300 font-medium">{vta.cliente || 'Cliente genérico'}</td>
                    <td className="p-4 text-orange-400 font-bold">{vta.cantidad} un.</td>
                    <td className="p-4 text-slate-300">
                      {vta.fecha_venta ? new Date(vta.fecha_venta).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => handleEditarClick(vta)}
                        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminarClick(idVenta)}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
              {ventasFiltradas.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500 font-medium text-sm">
                    No se encontraron registros de ventas coincidentes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Ventas;