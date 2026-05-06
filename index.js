const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path'); // <-- Importante para encontrar el HTML
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Sirve archivos como el index.html

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Ruta para mostrar tu página de Vida Verde y Lavandas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Ruta para registrar usuarios en la base de datos
app.post('/registrar', async (req, res) => {
    const { nombre, password } = req.body;
    if (!nombre || !password) {
        return res.status(400).json({ error: "Campos obligatorios" });
    }
    try {
        await pool.query('INSERT INTO usuarios (nombre, password) VALUES ($1, $2)', [nombre, password]);
        res.json({ mensaje: "Registro exitoso" });
    } catch (err) {
        if (err.code === '23505') {
            res.status(400).json({ error: "El nombre ya está registrado" });
        } else {
            res.status(500).json({ error: "Error en el servidor" });
        }
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
