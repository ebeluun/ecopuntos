// Los datos de los centros vienen de js/centros-data.js (variable "centers").
const centersGrid = document.getElementById("centers-grid");
const searchInput = document.getElementById("search-centers");
const filterButtons = document.querySelectorAll(".filter-button");
const resultsMessage = document.getElementById("results-message");\nconst feedback=document.getElementById("centers-feedback"), centerDialog=document.getElementById("center-edit-dialog"), centerForm=document.getElementById("center-edit-form"), centerError=document.getElementById("center-edit-error");\nlet editingCenterId=null;\nconst labels={plastico:"Plástico",papel:"Papel",carton:"Cartón",vidrio:"Vidrio",metal:"Metal",electronicos:"Electrónicos"};

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
    message.textContent = "No se encontraron centros. Intenta con otra búsqueda.";
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

      card.append(title, location, materialsTitle, materials, detailsButton);\n      if(getActiveUser()){const actions=document.createElement("div");actions.className="center-card-actions";const edit=document.createElement("button");edit.type="button";edit.textContent="Editar";edit.addEventListener("click",()=>openCenterEditor(center));const del=document.createElement("button");del.type="button";del.textContent="Eliminar";del.addEventListener("click",()=>deleteCenter(center.id));actions.append(edit,del);card.appendChild(actions);}
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


function getActiveUser(){try{const u=JSON.parse(localStorage.getItem("usuarioActivo")||"null");return u&&u.correo?u:null;}catch{return null;}}
function openCenterEditor(c){if(!getActiveUser())return;editingCenterId=c.id;centerError.textContent="";centerForm.elements.name.value=c.name;centerForm.elements.location.value=c.location||"";centerForm.elements.icon.value=c.icon||"♻️";centerForm.elements.description.value=c.description||"";centerForm.querySelectorAll('input[name="materials"]').forEach(x=>x.checked=c.materials.includes(x.value));centerDialog.showModal();}
function closeCenterEditor(){if(centerDialog.open)centerDialog.close();editingCenterId=null;centerError.textContent="";}
document.getElementById("cancel-center-edit").addEventListener("click",closeCenterEditor);
centerDialog.addEventListener("click",e=>{if(e.target===centerDialog)closeCenterEditor();});
centerForm.addEventListener("submit",e=>{e.preventDefault();centerError.textContent="";if(!getActiveUser()||!centerForm.reportValidity())return;const name=centerForm.elements.name.value.trim(),location=centerForm.elements.location.value.trim(),icon=centerForm.elements.icon.value.trim(),description=centerForm.elements.description.value.trim(),materials=Array.from(centerForm.querySelectorAll('input[name="materials"]:checked')).map(x=>x.value);if(!materials.length){centerError.textContent="Selecciona al menos un material.";return;}const all=obtenerTodosLosCentros();if(all.some(c=>c.id!==editingCenterId&&c.name.toLowerCase()===name.toLowerCase())){centerError.textContent="Ya existe un centro con ese nombre.";return;}const next=all.map(c=>c.id===editingCenterId?{...c,name,location,icon,description,materials,materialText:materials.map(m=>labels[m]).join(", ")}:c);try{guardarCentros(next);centers.splice(0,centers.length,...obtenerCentrosPublicos());document.dispatchEvent(new CustomEvent("centros-actualizados"));closeCenterEditor();showCenterFeedback("Centro actualizado correctamente.","success");}catch{centerError.textContent="No se pudieron guardar los cambios."; }});
function deleteCenter(id){if(!getActiveUser())return;const all=obtenerTodosLosCentros(),c=all.find(x=>x.id===id);if(!c||!confirm("¿Eliminar "+c.name+" del catálogo público? Sus entregas anteriores se conservarán."))return;try{guardarCentros(all.map(x=>x.id===id?{...x,active:false}:x));centers.splice(0,centers.length,...obtenerCentrosPublicos());showCenters();showCenterFeedback("Centro eliminado del catálogo público.","success");}catch{showCenterFeedback("No se pudo eliminar el centro.","error");}}
function showCenterFeedback(message,type){feedback.textContent=message;feedback.className="centers-feedback "+type;}
\n// Mostrar los centros al cargar la página.
showCenters();
