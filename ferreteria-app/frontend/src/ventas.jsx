import React, { useEffect, useState } from 'react';

function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [idEditando, setIdEditando] = useState(null);

  // Datos principales del formulario
  const [formVenta, setFormVenta] = useState({
    id_cliente: '',
    fecha_venta: new Date().toISOString().split('T')[0]
  });

  // Lista dinámica de productos con precio y subtotal individual
  const [itemsVenta, setItemsVenta] = useState([
    { id_producto: '', precio_unitario: 0, cantidad: 1 }
  ]);

  // Cargar datos iniciales
  const cargarVentas = () => {
    fetch('http://backend-production-4d48.up.railway.app/api/ventas')
      .then((res) => res.json())
      .then((data) => setVentas(data))
      .catch((err) => console.error('Error al cargar ventas:', err));
  };

  const cargarProductos = () => {
    fetch('http://backend-production-4d48.up.railway.app/api/productos')
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error('Error al cargar productos:', err));
  };

  const cargarClientes = () => {
    fetch('http://backend-production-4d48.up.railway.app/api/clientes')
      .then((res) => res.json())
      .then((data) => setClientes(data))
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
      fetch(`http://backend-production-4d48.up.railway.app/api/ventas/${id}`, {
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

  // Enviar formulario
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

      fetch(`http://backend-production-4d48.up.railway.app/api/ventas/${idEditando}`, {
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

    fetch('http://backend-production-4d48.up.railway.app/api/ventas', {
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Formulario de Registro / Edición */}
      <div className="bg-white shadow-md rounded-lg p-6 w-full lg:w-3/4">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">
          {idEditando ? '✏️ Editar Venta' : '🛒 Registrar Venta y Calcular Cuenta'}
        </h2>
        
        <form onSubmit={handleVentaSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cliente:</label>
              <select
                required
                value={formVenta.id_cliente}
                onChange={(e) => setFormVenta({ ...formVenta, id_cliente: e.target.value })}
                className="w-full p-2.5 border rounded-lg bg-white text-slate-700 focus:ring focus:ring-amber-200 outline-none"
              >
                <option value="">Selecciona un cliente</option>
                {clientes.map((cli) => (
                  <option key={cli.id_cliente} value={cli.id_cliente}>
                    {cli.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Venta:</label>
              <input
                type="date"
                required
                value={formVenta.fecha_venta}
                onChange={(e) => setFormVenta({ ...formVenta, fecha_venta: e.target.value })}
                className="w-full p-2.5 border rounded-lg focus:ring focus:ring-amber-200 outline-none"
              />
            </div>
          </div>

          {/* Sección Dinámica de Productos */}
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block font-bold text-slate-800">Detalle de Productos y Precios:</label>
              {!idEditando && (
                <button
                  type="button"
                  onClick={agregarFilaProducto}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  + Agregar otro producto
                </button>
              )}
            </div>

            {itemsVenta.map((item, index) => {
              const subtotal = (Number(item.precio_unitario) || 0) * (Number(item.cantidad) || 0);
              return (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center mb-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {/* Selector de Producto */}
                  <div className="sm:col-span-5">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Producto</label>
                    <select
                      required
                      value={item.id_producto}
                      onChange={(e) => actualizarFilaItem(index, 'id_producto', e.target.value)}
                      className="w-full p-2 border rounded-lg bg-white text-slate-700 outline-none text-sm"
                    >
                      <option value="">Seleccione producto</option>
                      {productos.map((prod) => (
                        <option key={prod.id_producto} value={prod.id_producto}>
                          {prod.nombre} (Stock: {prod.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Precio Unitario (Automático) */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Precio Unit.</label>
                    <div className="p-2 bg-white border rounded-lg text-sm font-medium text-slate-700 text-right">
                      ${Number(item.precio_unitario).toFixed(2)}
                    </div>
                  </div>

                  {/* Cantidad */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Cantidad</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={item.cantidad}
                      onChange={(e) => actualizarFilaItem(index, 'cantidad', e.target.value)}
                      className="w-full p-2 border rounded-lg outline-none text-sm text-center font-semibold"
                    />
                  </div>

                  {/* Subtotal */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Subtotal</label>
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-sm font-bold text-amber-700 text-right">
                      ${subtotal.toFixed(2)}
                    </div>
                  </div>

                  {/* Botón Eliminar Fila */}
                  <div className="sm:col-span-1 flex justify-center items-end pt-5">
                    {itemsVenta.length > 1 && !idEditando && (
                      <button
                        type="button"
                        onClick={() => eliminarFilaProducto(index)}
                        className="bg-red-500 hover:bg-red-600 text-white w-9 h-9 rounded-lg text-sm transition-colors flex items-center justify-center font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Total a Pagar en Grande */}
            <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center mt-4 shadow-md">
              <span className="text-base font-medium tracking-wide">Total General a Pagar:</span>
              <span className="text-2xl font-black text-amber-400">
                ${calcularTotalPagar().toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex space-x-3 pt-3">
            <button
              type="submit"
              className={`w-full p-3 rounded-xl text-white font-bold transition-colors shadow-sm ${
                idEditando ? 'bg-amber-500 hover:bg-amber-600' : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {idEditando ? 'Actualizar Venta' : 'Confirmar y Registrar Venta'}
            </button>

            {idEditando && (
              <button
                type="button"
                onClick={resetearFormulario}
                className="w-1/3 bg-slate-400 text-white p-3 rounded-xl hover:bg-slate-500 font-bold transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabla de Historial de Ventas */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-3 text-slate-800">Historial de Ventas Registradas</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-50 text-orange-800 text-sm">
                <th className="p-3 border">ID</th>
                <th className="p-3 border">Producto</th>
                <th className="p-3 border">Cliente</th>
                <th className="p-3 border">Cantidad</th>
                <th className="p-3 border">Fecha de Venta</th>
                <th className="p-3 border text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {ventas.map((vta) => {
                const idVenta = vta.id_venta || vta.id;
                return (
                  <tr key={idVenta} className="hover:bg-slate-50">
                    <td className="p-3 border">{idVenta}</td>
                    <td className="p-3 border font-medium text-slate-800">{vta.producto || 'Producto desconocido'}</td>
                    <td className="p-3 border text-slate-600">{vta.cliente || 'Cliente genérico'}</td>
                    <td className="p-3 border font-semibold text-orange-600">{vta.cantidad} un.</td>
                    <td className="p-3 border">
                      {vta.fecha_venta ? new Date(vta.fecha_venta).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-3 border text-center space-x-2">
                      <button
                        onClick={() => handleEditarClick(vta)}
                        className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded-md text-xs font-semibold transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminarClick(idVenta)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-semibold transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Ventas;