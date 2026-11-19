// Perfil e historial construidos con los registros reales de la cuenta activa.
function readActiveUser() {
  try {
    return JSON.parse(localStorage.getItem("usuarioActivo") || "null");
  } catch {
    return null;
  }
}

function readDeliveries() {
  try {
    const records = JSON.parse(localStorage.getItem("entregasEcoPuntos") || "[]");
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

const activeUser = readActiveUser();\nconst editDialog=document.getElementById("editar-entrega-dialog"), editForm=document.getElementById("editar-entrega-form"), editCenter=document.getElementById("editar-centro"), editMaterial=document.getElementById("editar-material"), editError=document.getElementById("editar-error");\nlet editingDeliveryId=null;
if (!activeUser || !activeUser.correo) {
  window.location.replace("login.html");
} else {
  renderUserProfile(activeUser, readDeliveries());\n  initDeliveryEditor();
}

function renderUserProfile(user, allDeliveries) {
  const email = user.correo.toLowerCase();
  const userDeliveries = allDeliveries
    .filter((delivery) => delivery.ownerEmail &&
      delivery.ownerEmail.toLowerCase() === email)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const nameElement = document.getElementById("nombre-perfil");
  if (nameElement) nameElement.textContent = "¡Hola, " + user.nombre + "!";

  const countElement = document.getElementById("total-entregas");
  const kgElement = document.getElementById("total-kilos");
  const piecesElement = document.getElementById("total-piezas");
  if (countElement) countElement.textContent = userDeliveries.length;

  const totalKg = userDeliveries
    .filter((item) => item.unit === "kg")
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalPieces = userDeliveries
    .filter((item) => item.unit === "piezas")
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  if (kgElement) kgElement.textContent = formatQuantity(totalKg) + " kg";
  if (piecesElement) piecesElement.textContent = formatQuantity(totalPieces);

  renderStatistics(userDeliveries);

  const list = document.getElementById("lista-entregas");
  list.replaceChildren();

  if (userDeliveries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "sin-entregas";
    empty.textContent = "Todavía no tienes entregas registradas. ¡Registra tu primera entrega y aparecerá aquí!";
    list.appendChild(empty);
    return;
  }

  userDeliveries.forEach((delivery) => {
    const article = document.createElement("article");
    article.className = "entrega";

    const detail = document.createElement("div");
    detail.className = "entrega-detalle";

    const material = document.createElement("h3");
    material.textContent = delivery.material || "Material";

    const center = document.createElement("p");
    center.textContent = delivery.center || "Centro no especificado";

    const date = document.createElement("p");
    date.textContent = formatDate(delivery.date);

    if (delivery.notes) {
      const notes = document.createElement("p");
      notes.textContent = "Observaciones: " + delivery.notes;
      detail.append(material, center, date, notes);
    } else {
      detail.append(material, center, date);
    }

    const meta = document.createElement("div");
    meta.className = "entrega-meta";
    const quantity = document.createElement("strong");
    quantity.textContent = formatQuantity(Number(delivery.quantity || 0)) +
      " " + (delivery.unit === "kg" ? "kg" : "piezas");
    const label = document.createElement("span");
    label.textContent = "Cantidad entregada";
    meta.append(quantity, label);

    const actions=document.createElement("div"); actions.className="entrega-acciones";\n    const edit=document.createElement("button"); edit.type="button"; edit.textContent="Editar"; edit.addEventListener("click",()=>openDeliveryEditor(delivery));\n    const remove=document.createElement("button"); remove.type="button"; remove.textContent="Eliminar"; remove.addEventListener("click",()=>deleteDelivery(delivery.id));\n    actions.append(edit,remove); meta.appendChild(actions);\n    article.append(detail, meta);
    list.appendChild(article);
  });
}


function initDeliveryEditor(){
 if(!editForm||typeof obtenerCentrosPublicos!=="function")return;
 obtenerCentrosPublicos().forEach(c=>{const o=document.createElement("option");o.value=c.id;o.textContent=c.name;editCenter.appendChild(o);});
 editCenter.addEventListener("change",()=>fillDeliveryMaterials(editCenter.value));
 document.getElementById("cancelar-edicion").addEventListener("click",closeDeliveryEditor);
 editForm.addEventListener("submit",e=>{
  e.preventDefault();editError.textContent="";if(!editForm.reportValidity())return;
  const all=readDeliveries(),i=all.findIndex(d=>d.id===editingDeliveryId&&d.ownerEmail&&d.ownerEmail.toLowerCase()===activeUser.correo.toLowerCase());
  if(i<0){editError.textContent="No se encontró la entrega.";return;}
  const c=obtenerCentrosPublicos().find(x=>x.id===editCenter.value),key=editMaterial.value,q=Number(document.getElementById("editar-cantidad").value),date=document.getElementById("editar-fecha").value;
  if(!c||!c.materials.includes(key)){editError.textContent="Selecciona un material válido para el centro.";return;}
  if(q<=0||!Number.isFinite(q)){editError.textContent="La cantidad debe ser mayor que cero.";return;}
  if(date>todayLocal()){editError.textContent="La fecha no puede ser futura.";return;}
  all[i]={...all[i],center:c.name,centerId:c.id,material:nombresMateriales[key]||key,materialKey:key,quantity:q,unit:document.getElementById("editar-unidad").value,date,notes:document.getElementById("editar-observaciones").value.trim()};
  try{localStorage.setItem("entregasEcoPuntos",JSON.stringify(all));closeDeliveryEditor();renderUserProfile(activeUser,all);}catch{editError.textContent="No se pudieron guardar los cambios.";}
 });
}
function fillDeliveryMaterials(id,key){const c=obtenerCentrosPublicos().find(x=>x.id===id);editMaterial.replaceChildren();const p=document.createElement("option");p.value="";p.textContent=c?"Selecciona material":"Selecciona centro";editMaterial.appendChild(p);if(!c){editMaterial.disabled=true;return;}c.materials.forEach(m=>{const o=document.createElement("option");o.value=m;o.textContent=nombresMateriales[m]||m;editMaterial.appendChild(o);});editMaterial.disabled=false;if(key)editMaterial.value=key;}
function openDeliveryEditor(d){editingDeliveryId=d.id;const c=obtenerCentrosPublicos().find(x=>x.id===d.centerId)||obtenerCentrosPublicos().find(x=>x.name===d.center);editCenter.value=c?c.id:"";fillDeliveryMaterials(editCenter.value,d.materialKey);document.getElementById("editar-cantidad").value=d.quantity;document.getElementById("editar-unidad").value=d.unit||"kg";document.getElementById("editar-fecha").value=d.date||todayLocal();document.getElementById("editar-fecha").max=todayLocal();document.getElementById("editar-observaciones").value=d.notes||"";editError.textContent=c?"":"El centro original ya no está activo. Selecciona otro.";editDialog.showModal();}
function closeDeliveryEditor(){if(editDialog.open)editDialog.close();editingDeliveryId=null;editError.textContent="";}
function deleteDelivery(id){const all=readDeliveries(),d=all.find(x=>x.id===id&&x.ownerEmail&&x.ownerEmail.toLowerCase()===activeUser.correo.toLowerCase());if(!d)return;if(!confirm("¿Eliminar esta entrega? Esta acción no se puede deshacer."))return;const next=all.filter(x=>x.id!==id);try{localStorage.setItem("entregasEcoPuntos",JSON.stringify(next));renderUserProfile(activeUser,next);}catch{alert("No se pudo eliminar el registro.");}}
function todayLocal(){const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);}
\n// SCRUM-76: gráficas de barras con los materiales reciclados y las entregas por mes.
function renderStatistics(deliveries) {
  const materialsChart = document.getElementById("grafica-materiales");
  const monthsChart = document.getElementById("grafica-meses");
  if (!materialsChart || !monthsChart) return;

  // Agrupar por material: número de entregas, kilos y piezas.
  const byMaterial = {};
  deliveries.forEach((delivery) => {
    const name = delivery.material || "Otro";
    if (!byMaterial[name]) byMaterial[name] = { count: 0, kg: 0, pieces: 0 };
    byMaterial[name].count += 1;
    if (delivery.unit === "kg") byMaterial[name].kg += Number(delivery.quantity || 0);
    else byMaterial[name].pieces += Number(delivery.quantity || 0);
  });

  const materialRows = Object.entries(byMaterial)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([name, totals]) => {
      const amounts = [];
      if (totals.kg > 0) amounts.push(formatQuantity(totals.kg) + " kg");
      if (totals.pieces > 0) amounts.push(formatQuantity(totals.pieces) + " piezas");
      return {
        label: name,
        value: totals.count,
        text: totals.count + (totals.count === 1 ? " entrega" : " entregas") +
          (amounts.length ? " · " + amounts.join(" y ") : "")
      };
    });

  drawBars(materialsChart, materialRows,
    "Aún no hay materiales para mostrar. Registra una entrega para ver tu gráfica.");

  // Entregas de los últimos 6 meses, incluido el actual.
  const today = new Date();
  const monthRows = [];
  for (let offset = 5; offset >= 0; offset--) {
    const month = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const key = month.getFullYear() + "-" + String(month.getMonth() + 1).padStart(2, "0");
    const count = deliveries.filter((delivery) => (delivery.date || "").startsWith(key)).length;
    const monthName = month.toLocaleDateString("es-MX", { month: "short" }).replace(".", "");

    monthRows.push({
      label: monthName.charAt(0).toUpperCase() + monthName.slice(1) + " " + month.getFullYear(),
      value: count,
      text: count + (count === 1 ? " entrega" : " entregas")
    });
  }

  const hasRecentDeliveries = monthRows.some((row) => row.value > 0);
  drawBars(monthsChart, hasRecentDeliveries ? monthRows : [],
    "No tienes entregas en los últimos 6 meses.");
}

// Dibujar una lista de barras horizontales; el ancho es proporcional al valor más alto.
function drawBars(container, rows, emptyText) {
  container.replaceChildren();

  if (rows.length === 0) {
    const empty = document.createElement("li");
    empty.className = "barra-vacia";
    empty.textContent = emptyText;
    container.appendChild(empty);
    return;
  }

  const max = Math.max(...rows.map((row) => row.value), 1);

  rows.forEach((row) => {
    const item = document.createElement("li");
    item.className = "barra";

    const label = document.createElement("span");
    label.className = "barra-etiqueta";
    label.textContent = row.label;

    const track = document.createElement("span");
    track.className = "barra-pista";
    track.setAttribute("aria-hidden", "true");

    const fill = document.createElement("span");
    fill.className = "barra-relleno";
    // Un mínimo de 3% para que una barra con valor se vea; las de 0 quedan vacías.
    fill.style.width = row.value > 0 ? Math.max((row.value / max) * 100, 3) + "%" : "0";
    track.appendChild(fill);

    const value = document.createElement("span");
    value.className = "barra-valor";
    value.textContent = row.text;

    item.append(label, track, value);
    container.appendChild(item);
  });
}

function formatQuantity(value) {
  return new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 }).format(value);
}

function formatDate(value) {
  if (!value) return "Fecha no especificada";
  const date = new Date(value + "T00:00:00");
  if (Number.isNaN(date.getTime())) return "Fecha no especificada";
  return date.toLocaleDateString("es-MX", {
    day: "numeric", month: "long", year: "numeric"
  });
}

// Cerrar sesión desde el perfil.
const logoutButton = document.getElementById("cerrar-sesion");
if (logoutButton) {
  logoutButton.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("usuarioActivo");
    window.location.href = "login.html";
  });
}
