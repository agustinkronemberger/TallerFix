import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();


// Middlewares
app.use(cors());
app.use(express.json()); // Permite que el servidor entienda datos en formato JSON

// Ruta de prueba base
app.get('/', (req, res) => {
  res.send('¡El motor de automatizaciones está funcionando perfectamente!');
});

app.post('/reparaciones', async (req, res) => {
    // Recibimos 'telefono' en vez de 'email'
    const { dni, cliente, telefono, equipo, trabajo, precio } = req.body;
    try {
        let clienteEncontrado = await prisma.cliente.findUnique({
            where: { dni: dni }
        });

        if (!clienteEncontrado) {
            clienteEncontrado = await prisma.cliente.create({
                data: { dni, nombre: cliente, telefono }
            });
        } else {
            clienteEncontrado = await prisma.cliente.update({
                where: { dni: dni },
                data: { nombre: cliente, telefono: telefono || clienteEncontrado.telefono }
            });
        }

        const nuevaReparacion = await prisma.reparacion.create({
            data: {
                equipo, trabajo, precio: parseFloat(precio) || 0,
                clienteId: clienteEncontrado.id
            },
            include: { cliente: true }
        });
        res.json(nuevaReparacion);
    } catch (error) {
        console.error("ERROR:", error);
        res.status(400).json({ error: 'Error al registrar.' });
    }
}); 

// GET: Ver reparaciones (Le agregamos el teléfono a la respuesta)
app.get('/reparaciones', async (req, res) => {
    try {
        const reparaciones = await prisma.reparacion.findMany({
            include: { cliente: true },
            orderBy: { createdAt: 'desc' }
        });

        const formatoLimpio = reparaciones.map(rep => ({
            id: rep.id,
            equipo: rep.equipo,
            trabajo: rep.trabajo,
            estado: rep.estado,
            precio: rep.precio,
            cliente: rep.cliente.nombre,
            telefono: rep.cliente.telefono // <-- Agregamos esto
        }));
  
        res.json(formatoLimpio);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener reparaciones' });
    }
});

// PUT: Actualizar estado (Mucho más limpio, ya no manda mail por atrás)
app.put('/reparaciones/:id', async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    try {
        const actualizada = await prisma.reparacion.update({
            where: { id },
            data: { estado }
        });
        res.json(actualizada);
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar' });
    }
});

// Levantar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidorrrr corriendo en http://localhost:${PORT}`);
});

// Ruta para eliminar una reparación por ID
app.delete('/reparaciones/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.reparacion.delete({
            where: { id: id }
        });
        res.status(200).json({ message: 'Reparación eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar:', error);
        res.status(500).json({ error: 'No se pudo eliminar la reparación' });
    }
});