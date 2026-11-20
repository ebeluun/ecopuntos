// Los datos de los centros vienen de js/centros-data.js (variable "centers").
const centersGrid = document.getElementById("centers-grid");
const searchInput = document.getElementById("search-centers");
const filterButtons = document.querySelectorAll(".filter-button");
const resultsMessage = document.getElementById("results-message");
const feedback=document.getElementById("centers-feedback"), centerDialog=document.getElementById("center-edit-dialog"), centerForm=document.getElementById("center-edit-form"), centerError=document.getElementById("center-edit-error");
let editingCenterId=null;
const labels={plastico:"Plástico",papel:"Papel",carton:"Cartón",vidrio:"Vidrio",metal:"Metal",electronicos:"Electrónicos"};

let activeFilter = "todos";

// Mostrar los centros según la búsqueda y el filtro seleccionado.
function showCenters() {
  const searchText = searchInput.value.trim().toLocaleLowerCase("es");

  const filteredCenters = centers.filter((center) => {
    const matchesSearch = (center.name + " " + center.location)
      .toLocaleLowerCase("es")
      .includes(searchText);
    const matchesMaterial =
      activeFilter === "todos" || center.materials.includes(activeFilter);

    return matchesSearch && matchesMaterial;
  });

  centersGrid.replaceChildren();

  if (filteredCenters.length === 0) {
    const message = document.createElement("p");
    message.className = "no-results";
    message.setAttribute("role", "status");
    message.setAttribute("aria-live", "polite");
    const icon = document.createElement("span");
    icon.className = "no-results-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "⌕";
    const title = document.createElement("strong");
    title.textContent = centers.length === 0
      ? "Aún no hay centros disponibles"
      : "No encontramos resultados";
    const detail = document.createElement("span");
    detail.textContent = centers.length === 0
      ? "Pronto podrás consultar aquí los centros de reciclaje."
      : "Intenta con otro nombre, ubicación o filtro de material.";
    message.append(icon, title, detail);
    centersGrid.appendChild(message);
  } else {
    filteredCenters.forEach((center) => {
      const card = document.createElement("article");
      card.className = "center-card";

      const title = document.createElement("h2");
      title.textContent = center.icon + " " + center.name;

      const location = document.createElement("p");
      location.className = "location";
      location.textContent = "📍 " + center.location;

      const materialsTitle = document.createElement("p");
      materialsTitle.className = "materials-title";
      materialsTitle.textContent = "♻️ Materiales que recibe:";

      const materials = document.createElement("p");
      materials.className = "materials-list";
      materials.textContent = center.materialText;

      const detailsButton = document.createElement("button");
      detailsButton.className = "details-button";
      detailsButton.type = "button";
      detailsButton.textContent = "Ver detalles";
      detailsButton.dataset.details = center.id;

      card.append(title, location, materialsTitle, materials, detailsButton);

      const favoriteButton = document.createElement("button");
      favoriteButton.type = "button";
      favoriteButton.className = "favorite-button";
      favoriteButton.dataset.favorite = center.id;
      favoriteButton.textContent = esFavorito(center.id) ? "★ Quitar de favoritos" : "☆ Agregar a favoritos";
      card.appendChild(favoriteButton);
      if(esAdministrador()){const actions=document.createElement("div");actions.className="center-card-actions";const edit=document.createElement("button");edit.type="button";edit.textContent="Editar";edit.addEventListener("click",()=>openCenterEditor(center));const del=document.createElement("button");del.type="button";del.textContent="Eliminar";del.addEventListener("click",()=>deleteCenter(center.id));actions.append(edit,del);card.appendChild(actions);}
      centersGrid.appendChild(card);
    });
  }

  resultsMessage.textContent =
    filteredCenters.length === 1
      ? "1 centro encontrado"
      : filteredCenters.length + " centros encontrados";
}

// Activar los filtros de materiales.
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    showCenters();
  });
});

// Actualizar resultados al escribir.
searchInput.addEventListener("input", showCenters);

// Abrir la página de detalle del centro seleccionado.
centersGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-details]");
  if (!button) return;

  window.location.href =
    "detalle-centro.html?id=" + encodeURIComponent(button.dataset.details);
});

// SCRUM-82: volver a mostrar el catálogo si el administrador cambió los centros.
document.addEventListener("centros-actualizados", showCenters);


function esAdministrador(){try{const u=JSON.parse(localStorage.getItem("usuarioActivo")||"null");return !!(u&&u.correo&&u.correo.toLowerCase()==="ebelun007@tecmilenio.mx");}catch{return false;}}
function openCenterEditor(c){if(!esAdministrador())return;editingCenterId=c.id;centerError.textContent="";centerForm.elements.name.value=c.name;centerForm.elements.location.value=c.location||"";centerForm.elements.icon.value=c.icon||"♻️";centerForm.elements.description.value=c.description||"";centerForm.querySelectorAll('input[name="materials"]').forEach(x=>x.checked=c.materials.includes(x.value));centerDialog.showModal();}
function closeCenterEditor(){if(centerDialog.open)centerDialog.close();editingCenterId=null;centerError.textContent="";}
document.getElementById("cancel-center-edit").addEventListener("click",closeCenterEditor);
centerDialog.addEventListener("click",e=>{if(e.target===centerDialog)closeCenterEditor();});
centerForm.addEventListener("submit",e=>{e.preventDefault();centerError.textContent="";if(!esAdministrador()||!centerForm.reportValidity())return;const name=centerForm.elements.name.value.trim(),location=centerForm.elements.location.value.trim(),icon=centerForm.elements.icon.value.trim(),description=centerForm.elements.description.value.trim(),materials=Array.from(centerForm.querySelectorAll('input[name="materials"]:checked')).map(x=>x.value);if(!materials.length){centerError.textContent="Selecciona al menos un material.";return;}const all=obtenerTodosLosCentros();if(all.some(c=>c.id!==editingCenterId&&c.name.toLowerCase()===name.toLowerCase())){centerError.textContent="Ya existe un centro con ese nombre.";return;}const next=all.map(c=>c.id===editingCenterId?{...c,name,location,icon,description,materials,materialText:materials.map(m=>labels[m]).join(", ")}:c);try{guardarCentros(next);centers.splice(0,centers.length,...obtenerCentrosPublicos());document.dispatchEvent(new CustomEvent("centros-actualizados"));closeCenterEditor();showCenterFeedback("Centro actualizado correctamente.","success");}catch{centerError.textContent="No se pudieron guardar los cambios."; }});
function deleteCenter(id){if(!esAdministrador())return;const all=obtenerTodosLosCentros(),c=all.find(x=>x.id===id);if(!c||!confirm("¿Eliminar "+c.name+" del catálogo público? Sus entregas anteriores se conservarán."))return;try{guardarCentros(all.map(x=>x.id===id?{...x,active:false}:x));centers.splice(0,centers.length,...obtenerCentrosPublicos());showCenters();showCenterFeedback("Centro eliminado del catálogo público.","success");}catch{showCenterFeedback("No se pudo eliminar el centro.","error");}}
function showCenterFeedback(message,type){feedback.textContent=message;feedback.className="centers-feedback "+type;}

// SCRUM-94: favoritos independientes para cada cuenta.
function obtenerUsuarioActivo() {
  try {
    return JSON.parse(localStorage.getItem("usuarioActivo") || "null");
  } catch {
    return null;
  }
}

function leerFavoritos() {
  try {
    const favoritos = JSON.parse(localStorage.getItem("centrosFavoritosEcoPuntos") || "[]");
    return Array.isArray(favoritos) ? favoritos : [];
  } catch {
    return [];
  }
}

function guardarFavoritos(favoritos) {
  localStorage.setItem("centrosFavoritosEcoPuntos", JSON.stringify(favoritos));
}

function esFavorito(centerId) {
  const usuario = obtenerUsuarioActivo();
  if (!usuario || !usuario.correo) return false;
  return leerFavoritos().some(item =>
    item.ownerEmail === usuario.correo.toLowerCase() && item.centerId === centerId
  );
}

function renderFavoritos() {
  const grid = document.getElementById("favorites-grid");
  const message = document.getElementById("favorites-message");
  const usuario = obtenerUsuarioActivo();
  grid.replaceChildren();

  if (!usuario || !usuario.correo) {
    message.textContent = "Inicia sesión para guardar y consultar tus centros favoritos.";
    const link = document.createElement("a");
    link.href = "login.html";
    link.textContent = "Iniciar sesión";
    link.className = "favorites-login";
    grid.appendChild(link);
    return;
  }

  const email = usuario.correo.toLowerCase();
  const ids = leerFavoritos()
    .filter(item => item.ownerEmail === email)
    .map(item => item.centerId);
  const favoritos = obtenerTodosLosCentros().filter(center => ids.includes(center.id));

  if (favoritos.length === 0) {
    message.textContent = "Todavía no tienes centros favoritos. Agrégalos desde el catálogo.";
    return;
  }

  message.textContent = "Tienes " + favoritos.length +
    (favoritos.length === 1 ? " centro favorito." : " centros favoritos.");

  favoritos.forEach(center => {
    const card = document.createElement("article");
    card.className = "favorite-card";
    const name = document.createElement("strong");
    name.textContent = center.icon + " " + center.name;
    const location = document.createElement("p");
    location.textContent = center.location || "Ubicación no especificada";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Eliminar de favoritos";
    remove.addEventListener("click", () => cambiarFavorito(center.id, false));
    card.append(name, location, remove);
    grid.appendChild(card);
  });
}

function cambiarFavorito(centerId, agregar) {
  const usuario = obtenerUsuarioActivo();
  if (!usuario || !usuario.correo) {
    window.location.href = "login.html";
    return;
  }

  const email = usuario.correo.toLowerCase();
  let favoritos = leerFavoritos().filter(item =>
    !(item.ownerEmail === email && item.centerId === centerId)
  );

  if (agregar) favoritos.push({ ownerEmail: email, centerId });
  try {
    guardarFavoritos(favoritos);
    renderFavoritos();
    showCenters();
  } catch {
    showCenterFeedback("No se pudo actualizar tu lista de favoritos.", "error");
  }
}

centersGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-favorite]");
  if (!button) return;
  const id = button.dataset.favorite;
  cambiarFavorito(id, !esFavorito(id));
});

window.addEventListener("storage", event => {
  if (event.key === "centrosFavoritosEcoPuntos" || event.key === "usuarioActivo") {
    renderFavoritos();
    showCenters();
  }
});

// Mostrar el catálogo y los favoritos al cargar la página.
showCenters();
renderFavoritos();
