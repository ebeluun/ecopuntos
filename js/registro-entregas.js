
// Registro de entregas asociado a la cuenta que inició sesión.

const deliveryForm = document.getElementById("delivery-form");
const centerSelect = document.getElementById("center");
const materialSelect = document.getElementById("material");
const dateInput = document.getElementById("date");
const formMessage = document.getElementById("form-message");
const confirmationDialog = document.getElementById("delivery-confirmation");
const closeConfirmationButton = document.getElementById("close-confirmation");

// Obtener al usuario que inició sesión.
function getActiveUser() {
    try {
        return JSON.parse(localStorage.getItem("usuarioActivo") || "null");
    } catch (error) {
        console.error("Error al obtener la sesión:", error);
        return null;
    }
}

// Obtener las entregas guardadas.
function getSavedDeliveries() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("entregasEcoPuntos") || "[]"
        );

        return Array.isArray(saved) ? saved : [];
    } catch (error) {
        console.error("Error al obtener las entregas:", error);
        return [];
    }
}

// Obtener la fecha local actual en formato YYYY-MM-DD.
function getLocalDate() {
    const today = new Date();

    return new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];
}

// Nombres de los materiales.
const materialNames = {
    plastico: "Plástico",
    papel: "Papel",
    carton: "Cartón",
    vidrio: "Vidrio",
    metal: "Metal",
    electronicos: "Electrónicos"
};

// Comprobar que exista una sesión activa.
const activeUser = getActiveUser();

if (!activeUser || !activeUser.correo) {
    window.location.replace("login.html");
} else {
    initializeDeliveryForm();
}

function initializeDeliveryForm() {

    // Verificar que existan los elementos necesarios.
    if (
        !deliveryForm ||
        !centerSelect ||
        !materialSelect ||
        !dateInput ||
        !formMessage
    ) {
        console.error("No se encontraron todos los elementos del formulario.");
        return;
    }

    // Verificar que los centros estén disponibles.
    if (!Array.isArray(centers)) {
        console.error("No se pudieron cargar los centros de reciclaje.");
        return;
    }

    const localDate = getLocalDate();

    // Establecer la fecha actual y evitar fechas futuras.
    dateInput.value = localDate;
    dateInput.max = localDate;

    // Cargar los centros disponibles.
    centers.forEach((center) => {
        const option = document.createElement("option");

        option.value = center.id;
        option.textContent = center.name;

        centerSelect.appendChild(option);
    });

    // Actualizar los materiales según el centro seleccionado.
    centerSelect.addEventListener("change", () => {

        const selectedCenter = centers.find(
            (center) => center.id === centerSelect.value
        );

        materialSelect.replaceChildren();

        const firstOption = document.createElement("option");

        firstOption.value = "";
        firstOption.textContent = selectedCenter
            ? "Selecciona un material"
            : "Primero selecciona un centro";

        materialSelect.appendChild(firstOption);

        if (!selectedCenter) {
            materialSelect.disabled = true;
            return;
        }

        selectedCenter.materials.forEach((material) => {
            const option = document.createElement("option");

            option.value = material;
            option.textContent = materialNames[material] || material;

            materialSelect.appendChild(option);
        });

        materialSelect.disabled = false;
    });

    // Cerrar la ventana de confirmación.
    if (closeConfirmationButton && confirmationDialog) {
        closeConfirmationButton.addEventListener("click", () => {
            confirmationDialog.close();
        });

        confirmationDialog.addEventListener("click", (event) => {
            if (event.target === confirmationDialog) {
                confirmationDialog.close();
            }
        });
    }

    // Procesar el envío del formulario.
    deliveryForm.addEventListener("submit", (event) => {

        event.preventDefault();

        formMessage.textContent = "";
        formMessage.className = "form-message";

        // Comprobar los campos obligatorios del formulario.
        if (!deliveryForm.checkValidity()) {
            deliveryForm.reportValidity();
            return;
        }

        // Obtener los valores ingresados.
        const selectedCenter = centers.find(
            (center) => center.id === centerSelect.value
        );

        const quantity = Number(
            document.getElementById("quantity").value
        );

        const unit = document.getElementById("unit").value;
        const selectedDate = dateInput.value;
        const notes = document.getElementById("notes").value.trim();

        // Validar el centro seleccionado.
        if (!selectedCenter) {
            formMessage.textContent = "Selecciona un centro de reciclaje válido.";
            formMessage.className = "form-message error";
            centerSelect.focus();
            return;
        }

        // Validar que el material corresponda al centro.
        if (
            !Array.isArray(selectedCenter.materials) ||
            !selectedCenter.materials.includes(materialSelect.value)
        ) {
            formMessage.textContent =
                "Selecciona un material disponible en ese centro.";

            formMessage.className = "form-message error";
            materialSelect.focus();
            return;
        }

        // Validar que la cantidad sea un número mayor que cero.
        if (!Number.isFinite(quantity) || quantity <= 0) {
            formMessage.textContent =
                "La cantidad debe ser un número mayor que cero.";

            formMessage.className = "form-message error";
            document.getElementById("quantity").focus();
            return;
        }

        // Validar que la unidad sea permitida.
        if (!["kg", "piezas"].includes(unit)) {
            formMessage.textContent =
                "Selecciona una unidad de medida válida.";

            formMessage.className = "form-message error";
            document.getElementById("unit").focus();
            return;
        }

        // Validar que la fecha exista y no sea futura.
        if (
            !selectedDate ||
            !/^\d{4}-\d{2}-\d{2}$/.test(selectedDate) ||
            selectedDate > localDate
        ) {
            formMessage.textContent =
                "Selecciona una fecha válida que no sea futura.";

            formMessage.className = "form-message error";
            dateInput.focus();
            return;
        }

        // Crear el registro de la entrega.
        const delivery = {
            id: (window.crypto && window.crypto.randomUUID)
                ? window.crypto.randomUUID()
                : "entrega-" + Date.now() + "-" +
                    Math.floor(Math.random() * 100000),

            ownerEmail: activeUser.correo.trim().toLowerCase(),
            center: selectedCenter.name,
            centerId: selectedCenter.id,
            material: materialNames[materialSelect.value],
            materialKey: materialSelect.value,
            quantity: quantity,
            unit: unit,
            date: selectedDate,
            notes: notes,
            createdAt: new Date().toISOString()
        };

        // Recuperar las entregas anteriores y agregar la nueva.
        const deliveries = getSavedDeliveries();

        deliveries.push(delivery);

        // Guardar los datos en el navegador.
        try {
            localStorage.setItem(
                "entregasEcoPuntos",
                JSON.stringify(deliveries)
            );
        } catch (error) {
            console.error("Error al guardar la entrega:", error);

            formMessage.textContent =
                "No se pudo guardar la entrega. Revisa el espacio disponible en el navegador.";

            formMessage.className = "form-message error";
            return;
        }

        // Mostrar mensaje de éxito.
        formMessage.textContent =
            "Tu entrega se registró correctamente.";

        formMessage.className = "form-message success";

        // Mostrar los datos de la entrega registrada.
        showDeliveryConfirmation(delivery);

        // Limpiar el formulario después de guardar.
        deliveryForm.reset();

        dateInput.value = localDate;
        dateInput.max = localDate;

        materialSelect.disabled = true;
        materialSelect.replaceChildren();

        const placeholder = document.createElement("option");

        placeholder.value = "";
        placeholder.textContent = "Primero selecciona un centro";

        materialSelect.appendChild(placeholder);
    });
}

// Mostrar la ventana con los datos de la entrega.
function showDeliveryConfirmation(delivery) {

    if (!confirmationDialog) return;

    const formattedDate = new Date(
        delivery.date + "T00:00:00"
    ).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    document.getElementById("confirm-center").textContent =
        delivery.center;

    document.getElementById("confirm-material").textContent =
        delivery.material;

    document.getElementById("confirm-quantity").textContent =
        delivery.quantity + " " +
        (delivery.unit === "kg" ? "kg" : "piezas");

    document.getElementById("confirm-date").textContent =
        formattedDate;

    document.getElementById("confirm-notes").textContent =
        delivery.notes || "Sin observaciones";

    if (typeof confirmationDialog.showModal === "function") {
        confirmationDialog.showModal();
    }
}
