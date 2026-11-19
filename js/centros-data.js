// Catálogo base de centros de reciclaje.
const defaultCenters = [
  {
    id: "centro-verde",
    name: "Centro Verde",
    icon: "🌱",
    location: "Monterrey, Nuevo León",
    materials: ["plastico", "papel", "carton"],
    materialText: "Plástico, Papel y Cartón",
    description: "Centro de ejemplo para recibir plástico, papel y cartón."
  },
  {
    id: "ecorecicla",
    name: "EcoRecicla",
    icon: "♻️",
    location: "San Nicolás, Nuevo León",
    materials: ["vidrio", "metal", "plastico"],
    materialText: "Vidrio, Metal y Plástico",
    description: "Centro de ejemplo para recibir vidrio, metal y plástico."
  },
  {
    id: "punto-limpio",
    name: "Punto Limpio",
    icon: "🌎",
    location: "Guadalupe, Nuevo León",
    materials: ["papel", "carton", "electronicos"],
    materialText: "Papel, Cartón y Electrónicos",
    description: "Centro de ejemplo para recibir papel, cartón y residuos electrónicos."
  }
];

// Los cambios se guardan en el navegador y se comparten entre las páginas de EcoPuntos.
function readSavedCenters() {
  try {
    const saved = JSON.parse(localStorage.getItem("centrosEcoPuntos") || "null");
    return Array.isArray(saved) ? saved : null;
  } catch {
    return null;
  }
}

let centers = readSavedCenters() || defaultCenters.map((center) => ({ ...center, materials: [...center.materials] }));

function saveCenters(nextCenters) {
  try {
    localStorage.setItem("centrosEcoPuntos", JSON.stringify(nextCenters));
    centers = nextCenters;
    return true;
  } catch {
    return false;
  }
}
