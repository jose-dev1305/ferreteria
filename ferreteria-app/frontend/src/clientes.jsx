import React, { useState, useEffect } from 'react';

const Clientes = () => {
    // Estado para el formulario con los campos exactos de tu base de datos
    const [form, setForm] = useState({
        nombre: '',
        telefono: '',
        email: '',
        fecha_registro: ''
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
            const respuesta = await fetch('http://backend-production-4d48.up.railway.app/api/clientes');
            const datos = await respuesta.json();
            setClientes(datos);
        } catch (error) {
            console.error('Error al obtener los clientes:', error);
        }
    };

    useEffect(() => {
        obtenerClientes();
    }, []);

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
                ? `http://backend-production-4d48.up.railway.app/api/clientes/${editandoId}` 
                : 'http://backend-production-4d48.up.railway.app/api/clientes';
            
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
                setForm({ nombre: '', telefono: '', email: '', fecha_registro: '' });
                setEditandoId(null);
                obtenerClientes();
            } else {
                alert('Error: ' + resultado.error);
            }
        } catch (error) {
            console.error('Error al guardar el cliente:', error);
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
            const respuesta = await fetch(`http://backend-production-4d48.up.railway.app/api/clientes/${id}`, {
                method: 'DELETE'
            });

            if (respuesta.ok) {
                alert('Cliente eliminado correctamente');
                obtenerClientes();
            } else {
                const resultado = await respuesta.json();
                alert('Error al eliminar: ' + resultado.error);
            }
        } catch (error) {
            console.error('Error al eliminar el cliente:', error);
        }
    };

    // Filtrar clientes para la búsqueda en tiempo real
    const clientesFiltrados = clientes.filter(cliente => 
        (cliente.nombre && cliente.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
        (cliente.email && cliente.email.toLowerCase().includes(busqueda.toLowerCase())) ||
        (cliente.telefono && cliente.telefono.includes(busqueda))
    );

    return (
        <div className="p-6 bg-gray-900 min-h-screen text-white">
            
            {/* Formulario de Alta / Edición de Clientes */}
            <form onSubmit={handleSubmit} className="mb-8 bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                <h2 className="text-xl font-bold text-white mb-1">
                    {editandoId ? '✏️ Editar Cliente' : 'Registro de Clientes'}
                </h2>
                <p className="text-gray-400 text-sm mb-6">
                    {editandoId ? 'Modifique los datos necesarios del cliente.' : 'Ingrese los datos para dar de alta un nuevo cliente.'}
                </p>
                
                <div className="mb-4">
                    <label className="block text-gray-300 text-xs font-bold uppercase mb-2">Nombre Completo / Razón Social</label>
                    <input 
                        type="text" 
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder="Ej. Juan Pérez" 
                        className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
                        required 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-gray-300 text-xs font-bold uppercase mb-2">Teléfono</label>
                        <input 
                            type="text" 
                            name="telefono"
                            value={form.telefono}
                            onChange={handleChange}
                            placeholder="Ej. 555-0192" 
                            className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 text-xs font-bold uppercase mb-2">Correo Electrónico (Email)</label>
                        <input 
                            type="email" 
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Ej. correo@email.com" 
                            className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 text-xs font-bold uppercase mb-2">Fecha de Registro</label>
                        <input 
                            type="date" 
                            name="fecha_registro"
                            value={form.fecha_registro}
                            onChange={handleChange}
                            className="w-full p-3 rounded bg-gray-900 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
                            required 
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        type="submit" 
                        className={`w-full p-3 rounded font-bold transition shadow-lg ${editandoId ? 'bg-yellow-600 hover:bg-yellow-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}
                    >
                        {editandoId ? '💾 Guardar Cambios del Cliente' : '+ Guardar Nuevo Cliente'}
                    </button>
                    
                    {editandoId && (
                        <button 
                            type="button" 
                            onClick={() => { setEditandoId(null); setForm({ nombre: '', telefono: '', email: '', fecha_registro: '' }); }}
                            className="bg-gray-600 hover:bg-gray-500 text-white px-4 rounded font-bold transition"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            {/* Directorio General de Clientes */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            📋 Directorio General de Clientes
                        </h2>
                        <p className="text-gray-400 text-sm">Busque, filtre y administre la cartera de clientes registrados.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <input 
                            type="text" 
                            placeholder="Buscar por nombre, correo..." 
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="p-2 px-4 rounded bg-gray-900 text-white border border-gray-700 text-sm focus:outline-none focus:border-blue-500 w-full md:w-64"
                        />
                        <div className="bg-gray-900 border border-gray-700 px-4 py-2 rounded text-sm font-semibold text-blue-400 whitespace-nowrap">
                            Total: {clientesFiltrados.length}
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-gray-300">
                        <thead>
                            <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                                <th className="p-3">ID</th>
                                <th className="p-3">Cliente</th>
                                <th className="p-3">Teléfono</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Fecha Registro</th>
                                <th className="p-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clientesFiltrados.length > 0 ? (
                                clientesFiltrados.map((cliente) => (
                                    <tr key={cliente.id_cliente} className="border-b border-gray-700 hover:bg-gray-750 transition">
                                        <td className="p-3 font-mono text-gray-400">#{cliente.id_cliente}</td>
                                        <td className="p-3 font-medium text-white">{cliente.nombre}</td>
                                        <td className="p-3">{cliente.telefono || 'Sin registrar'}</td>
                                        <td className="p-3">{cliente.email || 'Sin registrar'}</td>
                                        <td className="p-3">
                                            {cliente.fecha_registro ? new Date(cliente.fecha_registro).toLocaleDateString() : 'Sin fecha'}
                                        </td>
                                        <td className="p-3 text-right space-x-2">
                                            <button 
                                                onClick={() => iniciarEdicion(cliente)}
                                                className="bg-yellow-600/80 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-bold transition"
                                            >
                                                Editar
                                            </button>
                                            <button 
                                                onClick={() => eliminarCliente(cliente.id_cliente)}
                                                className="bg-red-600/80 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold transition"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center p-6 text-gray-500">
                                        No se encontraron clientes registrados.
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