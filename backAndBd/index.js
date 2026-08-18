import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { verificarApiKey } from './middleware/auth.js';

const app = express();

// Instancia única de Prisma (Singleton) para evitar saturar conexiones
const globalForPrisma = global;
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Middlewares
app.use(cors({ origin: 'https://taller-sanmartin.vercel.app' }));
app.use(express.json());

// Ruta de prueba base
app.get('/', (req, res) => {
  res.send('¡El motor de automatizaciones está funcionando perfectamente!');
});

// ==================== REPARACIONES ====================

app.post('/reparaciones', async (req, res) => {
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

app.get('/reparaciones', verificarApiKey, rutasReparaciones, async (req, res) => {
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
            telefono: rep.cliente.telefono
        }));
  
        res.json(formatoLimpio);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener reparaciones' });
    }
});

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

// ==================== CLIENTES ====================

app.get('/clientes',verificarApiKey, rutasClientes, async (req, res) => {
    try {
        const clientes = await prisma.cliente.findMany({
            include: { reparaciones: true }
        });
        res.json(clientes);
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({ error: 'Error al obtener la lista de clientes' });
    }
});

app.put('/clientes/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, dni, telefono } = req.body;
    try {
        const clienteActualizado = await prisma.cliente.update({
            where: { id },
            data: { nombre, dni, telefono }
        });
        res.json(clienteActualizado);
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        res.status(400).json({ error: 'No se pudieron actualizar los datos del cliente' });
    }
});

app.delete('/clientes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.cliente.delete({
            where: { id }
        });
        res.status(200).json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        res.status(500).json({ error: 'No se pudo eliminar el cliente' });
    }
});

// Levantar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

// Ruta pública para que UptimeRobot/Render sigan respondiendo OK sin fallar
app.get('/health', (req, res) => res.status(200).send('OK'));

// middleware/auth.js
export const verificarApiKey = (req, res, next) => {
  const apiKeyCliente = req.headers['x-api-key'];
  const apiKeyServidor = process.env.X_API_KEY;

  if (!apiKeyCliente || apiKeyCliente !== apiKeyServidor) {
    return res.status(401).json({ error: 'Acceso no autorizado: API Key inválida o ausente' });
  }

  next(); // La clave es correcta, continúa con la ruta
};