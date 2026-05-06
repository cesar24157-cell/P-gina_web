const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// CONFIGURACIÓN: Aquí pega la "External Database URL" de Render
const pool = new Pool({
  connectionString:'postgresql://pagina_rb6z_user:h328aWKwLHLMSYl8V5ZnoRoIY51yOOC1@dpg-d7t90freo5us73ft2ub0-a/pagina_rb6z',
  ssl: { rejectUnauthorized: false }
});

app.post('/registrar', async (req, res) => {
    const { nombre, password } = req.body;

    // Validación: Si no hay datos, no se envía nada
    if (!nombre || !password) {
        return res.status(400).json({ error: "Campos obligatorios" });
    }

    try {
        await pool.query('INSERT INTO usuarios (nombre, password) VALUES ($1, $2)', [nombre, password]);
        res.json({ mensaje: "Registro exitoso" });
    } catch (err) {
        if (err.code === '23505') { // Error de nombre duplicado
            res.status(400).json({ error: "El nombre ya está registrado" });
        } else {
            res.status(500).json({ error: "Error en el servidor" });
        }
    }
});

app.listen(3000, () => console.log("Servidor en puerto 3000"));
