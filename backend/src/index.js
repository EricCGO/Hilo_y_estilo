import express from 'express';

const app = express();
app.use(express.json());

// Ruta de prueba para verificar que la API vive
app.get('/api/hola', (_req, res) => {
  res.json({ mensaje: 'Hola desde el backend de Hilo y Estilo 👋' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend escuchando en http://localhost:${PORT}`);
});
