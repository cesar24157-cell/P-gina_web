const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const path = require('path');
app.use(express.static(__dirname)); // Esto le dice a Node que use los archivos de la carpeta

app.use(cors());
app.use(express.json());

// Usamos process.env.DATABASE_URL para que sea seguro
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

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
            console.error(err);
            res.status(500).json({ error: "Error en el servidor" });
        }
    }
});

// Render asigna un puerto automáticamente, por eso usamos process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
