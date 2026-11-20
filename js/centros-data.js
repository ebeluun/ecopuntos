// Datos de los centros de reciclaje de EcoPuntos (SCRUM-82).
//
// El catálogo público, el detalle del centro y el registro de entregas leen los
// centros desde aquí. Si el panel de administración guardó cambios en
// localStorage ("centrosEcoPuntos"), se usan esos; si no, los centros iniciales.
//
// Para el panel de administración (SCRUM-78 a 81):
//   obtenerTodosLosCentros()  -> lista completa, incluidos los desactivados.
//   guardarCentros(lista)     -> guarda la lista; el catálogo la muestra al recargar.
//
// Campos de cada centro:
//   id, name, icon, location, materials (claves: plastico, papel, carton,
//   vidrio, metal, electronicos), description
//   Opcionales: address, schedule, phone, active (false = no se muestra al público).
//   materialText se calcula solo a partir de materials si no viene.

const centrosIniciales = [
  {
    id: "centro-verde",
    name: "Centro Verde",
    icon: "🌱",
    location: "Monterrey, Nuevo León",
    materials: ["plastico", "papel", "carton"],
    description: "Centro de ejemplo para recibir plástico, papel y cartón.",
    active: true
  },
  {
    id: "ecorecicla",
    name: "EcoRecicla",
    icon: "♻️",
    location: "San Nicolás, Nuevo León",
    materials: ["vidrio", "metal", "plastico"],
    description: "Centro de ejemplo para recibir vidrio, metal y plástico.",
    active: true
  },
  {
    id: "punto-limpio",
    name: "Punto Limpio",
    icon: "🌎",
    location: "Guadalupe, Nuevo León",
    materials: ["papel", "carton", "electronicos"],
    description: "Centro de ejemplo para recibir papel, cartón y residuos electrónicos.",
    active: true
  }
];

const nombresMateriales = {
  plastico: "Plástico",
  papel: "Papel",
  carton: "Cartón",
  vidrio: "Vidrio",
  metal: "Metal",
  electronicos: "Electrónicos"
};

// "Plástico, Papel y Cartón" a partir de ["plastico", "papel", "carton"].
function textoMateriales(materiales) {
  const nombres = materiales.map((clave) => nombresMateriales[clave] || clave);
  if (nombres.length <= 1) return nombres.join("");
  return nombres.slice(0, -1).join(", ") + " y " + nombres[nombres.length - 1];
}

// Completar los campos que falten para que ninguna página se rompa.
function completarCentro(centro) {
  const materiales = Array.isArray(centro.materials) ? centro.materials : [];

  return {
    ...centro,
    icon: centro.icon || "♻️",
    location: centro.location || "",
    materials: materiales,
    materialText: centro.materialText || textoMateriales(materiales),
    description: centro.description || "",
    active: centro.active !== false
  };
}

// SCRUM-93: se recuerda la última lectura para no convertir el mismo texto
// muchas veces (por ejemplo, una vez por cada tarjeta del historial).
let cacheCentrosTexto;
let cacheCentrosLista = [];

function obtenerTodosLosCentros() {
  const texto = localStorage.getItem("centrosEcoPuntos");
  if (texto === cacheCentrosTexto) return cacheCentrosLista.map((centro) => ({ ...centro }));

  let lista = centrosIniciales.map(completarCentro);
  try {
    const guardados = JSON.parse(texto);
    if (Array.isArray(guardados)) lista = guardados.map(completarCentro);
  } catch (error) {
    // Si los datos guardados están dañados, se usan los iniciales.
  }

  cacheCentrosTexto = texto;
  cacheCentrosLista = lista;
  return lista.map((centro) => ({ ...centro }));
}

function guardarCentros(lista) {
  localStorage.setItem("centrosEcoPuntos", JSON.stringify(lista));
}

// Solo los centros activos se muestran al público.
function obtenerCentrosPublicos() {
  return obtenerTodosLosCentros().filter((centro) => centro.active);
}

// SCRUM-92: nombre actual del centro de una entrega.
// Si el administrador renombró el centro, se muestra el nombre nuevo;
// si lo desactivó, se avisa; si ya no existe, se usa el nombre guardado.
function nombreCentroDeEntrega(entrega) {
  const centro = obtenerTodosLosCentros().find((item) => item.id === entrega.centerId);
  if (!centro) return entrega.center || "Centro no especificado";
  return centro.active ? centro.name : centro.name + " (ya no disponible)";
}

const centers = obtenerCentrosPublicos();

// Si el administrador cambia los centros en otra pestaña, actualizar la lista.
window.addEventListener("storage", (event) => {
  if (event.key !== "centrosEcoPuntos") return;
  centers.splice(0, centers.length, ...obtenerCentrosPublicos());
  document.dispatchEvent(new CustomEvent("centros-actualizados"));
});
