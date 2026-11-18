// Entregas de EcoPuntos guardadas por usuario (SCRUM-67).
// Todas las entregas viven en localStorage bajo "entregasEcoPuntos";
// cada una guarda el correo del usuario que la registró.

function obtenerEntregas() {
  try {
    return JSON.parse(localStorage.getItem("entregasEcoPuntos")) || [];
  } catch (error) {
    return [];
  }
}

// Entregas de un usuario, de la más reciente a la más antigua.
function obtenerEntregasDeUsuario(correo) {
  return obtenerEntregas()
    .filter(function (entrega) {
      return entrega.usuario === correo;
    })
    .sort(function (a, b) {
      return b.fecha.localeCompare(a.fecha) || b.registradaEn.localeCompare(a.registradaEn);
    });
}

// Agregar una entrega a la lista guardada y devolverla con su id.
function guardarEntrega(datos) {
  const entregas = obtenerEntregas();

  const entrega = {
    id: Date.now(),
    usuario: datos.usuario,
    centro: datos.centro,
    material: datos.material,
    cantidad: datos.cantidad,
    unidad: datos.unidad,
    fecha: datos.fecha,
    notas: datos.notas,
    registradaEn: new Date().toISOString()
  };

  entregas.push(entrega);
  localStorage.setItem("entregasEcoPuntos", JSON.stringify(entregas));
  return entrega;
}
