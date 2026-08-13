export const TALLER_CONFIG = {
  nombre: "Taller Fix",
  subtitulo: "Gestión de Equipos",
  // Plantilla de mensaje para WhatsApp
  mensajeWhatsapp: (cliente, equipo, precio) =>
    `¡Hola ${cliente}! 🛠️ Te avisamos que el trabajo en tu *${equipo}* ya está finalizado.\n\nPresupuesto final: *$${precio}*.\n\nYa podés pasar a retirarlo. ¡Te esperamos!`
};