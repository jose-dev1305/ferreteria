const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();

// Middlewares para procesar datos
app.use(cors());
app.use(express.json());

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Verificando las pruebas de funcionamiento de la conexión
db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('✅ Conectado exitosamente a la base de datos ferreteria_db en XAMPP');
});

// Ruta de prueba para el navegador
app.get('/', (req, res) => {
    res.send('API de la Ferretería funcionando al 100%');
});

// --- RUTAS GET (CONSULTAS) ---

app.get('/api/productos', (req, res) => {
    const query = `
        SELECT p.id_producto, p.nombre, p.precio, p.stock, p.id_proveedor, pr.nombre_empresa AS proveedor 
        FROM productos p 
        LEFT JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/clientes', (req, res) => {
    db.query('SELECT * FROM clientes', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/proveedores', (req, res) => {
    db.query('SELECT * FROM proveedores', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/ventas', (req, res) => {
    const query = `
        SELECT v.id_venta, v.id_producto, v.id_cliente, p.nombre AS producto, c.nombre AS cliente, v.cantidad, v.total, v.fecha_venta 
        FROM ventas v
        LEFT JOIN productos p ON v.id_producto = p.id_producto
        LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});


// --- RUTAS POST (REGISTROS) ---

app.post('/api/productos', (req, res) => {
    const { nombre, precio, stock, id_proveedor } = req.body;
    const query = 'INSERT INTO productos (nombre, precio, stock, id_proveedor) VALUES (?, ?, ?, ?)';
    
    db.query(query, [nombre, precio, stock, id_proveedor], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Producto registrado exitosamente', id: result.insertId });
    });
});

app.post('/api/clientes', (req, res) => {
    const { nombre, telefono, email, fecha_registro } = req.body;
    const query = 'INSERT INTO clientes (nombre, telefono, email, fecha_registro) VALUES (?, ?, ?, ?)';
    
    db.query(query, [nombre, telefono || null, email, fecha_registro], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Cliente registrado exitosamente', id: result.insertId });
    });
});

app.post('/api/proveedores', (req, res) => {
    const { nombre_empresa, telefono, direccion } = req.body;
    const query = 'INSERT INTO proveedores (nombre_empresa, telefono, direccion) VALUES (?, ?, ?)';
    
    db.query(query, [nombre_empresa, telefono, direccion], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Proveedor registrado exitosamente', id: result.insertId });
    });
});

// Registrar una venta con múltiples productos o formato clásico (Actualizado con cálculo de 'total')
app.post('/api/ventas', (req, res) => {
    const { id_cliente, fecha_venta, productos, id_producto, cantidad, precio_unitario } = req.body;

    if (id_producto && !productos) {
        const total = (Number(precio_unitario) || 0) * (Number(cantidad) || 0);
        const query = 'INSERT INTO ventas (id_producto, id_cliente, cantidad, total, fecha_venta) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [id_producto, id_cliente, cantidad, total, fecha_venta], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Venta registrada exitosamente', id: result.insertId });
        });
        return;
    }

    if (productos && productos.length > 0) {
        const queries = productos.map(item => {
            return new Promise((resolve, reject) => {
                const totalItem = (Number(item.precio_unitario) || 0) * (Number(item.cantidad) || 0);
                const query = 'INSERT INTO ventas (id_producto, id_cliente, cantidad, total, fecha_venta) VALUES (?, ?, ?, ?, ?)';
                db.query(query, [item.id_producto, id_cliente, item.cantidad, totalItem, fecha_venta], (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
        });

        Promise.all(queries)
            .then(() => res.json({ message: '¡Ventas con múltiples productos registradas exitosamente!' }))
            .catch(err => res.status(500).json({ error: err.message }));
    } else {
        res.status(400).json({ error: 'No se proporcionaron productos para la venta' });
    }
});


// --- RUTAS PUT Y DELETE (MODIFICAR Y ELIMINAR) ---

app.put('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock, id_proveedor } = req.body;
    const query = 'UPDATE productos SET nombre = ?, precio = ?, stock = ?, id_proveedor = ? WHERE id_producto = ?';

    db.query(query, [nombre, precio, stock, id_proveedor, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Producto actualizado exitosamente' });
    });
});

app.delete('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM productos WHERE id_producto = ?';

    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Producto eliminado exitosamente' });
    });
});

app.put('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, telefono, email, fecha_registro } = req.body;
    const query = 'UPDATE clientes SET nombre = ?, telefono = ?, email = ?, fecha_registro = ? WHERE id_cliente = ?';

    db.query(query, [nombre, telefono || null, email, fecha_registro, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Cliente actualizado exitosamente' });
    });
});

app.delete('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM clientes WHERE id_cliente = ?';

    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Cliente eliminado exitosamente' });
    });
});

app.put('/api/proveedores/:id', (req, res) => {
    const { id } = req.params;
    const { nombre_empresa, telefono, direccion } = req.body;
    const query = 'UPDATE proveedores SET nombre_empresa = ?, telefono = ?, direccion = ? WHERE id_proveedor = ?';

    db.query(query, [nombre_empresa, telefono, direccion, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Proveedor actualizado exitosamente' });
    });
});

app.delete('/api/proveedores/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM proveedores WHERE id_proveedor = ?';

    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Proveedor eliminado exitosamente' });
    });
});

app.put('/api/ventas/:id', (req, res) => {
    const { id } = req.params;
    const { id_producto, id_cliente, cantidad, precio_unitario, fecha_venta } = req.body;
    const total = (Number(precio_unitario) || 0) * (Number(cantidad) || 0);
    const query = 'UPDATE ventas SET id_producto = ?, id_cliente = ?, cantidad = ?, total = ?, fecha_venta = ? WHERE id_venta = ?';

    db.query(query, [id_producto, id_cliente, cantidad, total, fecha_venta, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Venta actualizada exitosamente' });
    });
});

app.delete('/api/ventas/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM ventas WHERE id_venta = ?';

    db.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Venta eliminada exitosamente' });
    });
});

// Levantar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});