const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// FUNCIÓN PARA CREAR LA TABLA AUTOMÁTICAMENTE
const crearTabla = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);
    console.log("Tabla 'usuarios' lista o ya existente.");
  } catch (err) {
    console.error("Error al crear la tabla:", err);
  }
};
crearTabla(); // Se ejecuta al arrancar el servidor

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/registrar', async (req, res) => {
    const { nombre, password } = req.body;
    try {
        await pool.query('INSERT INTO usuarios (nombre, password) VALUES ($1, $2)', [nombre, password]);
        res.json({ mensaje: "Registro exitoso" });
    } catch (err) {
        if (err.code === '23505') res.status(400).json({ error: "El nombre ya existe" });
        else res.status(500).json({ error: "Error en el servidor" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
