export const API_URL = import.meta.env.VITE_API_URL || 'https://taller-sanmartin-api.onrender.com';

export const SITE_CONFIG = {
  appName: import.meta.env.VITE_APP_NAME || 'Sistema de Gestión',
  subtitle: import.meta.env.VITE_APP_SUBTITLE || 'Control de Trabajos e Ingresos',
  entityName: import.meta.env.VITE_ENTITY_NAME || 'Equipo',
  entityPlural: import.meta.env.VITE_ENTITY_PLURAL || 'Equipos',
  placeholderEntity: import.meta.env.VITE_PLACEHOLDER_ENTITY || 'Ej. Notebook Dell Inspiron',
  placeholderTask: import.meta.env.VITE_PLACEHOLDER_TASK || 'Ej. Limpieza y cambio de pasta térmica',
  mensajeWhatsapp: (cliente, equipo, precio) =>
    `Hola ${cliente}, te avisamos que tu ${equipo} ya está listo para retirar. Presupuesto: $${precio}.`
};