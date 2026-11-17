// Validación del formulario de registro e inicio de sesión

const formulario = document.querySelector("form");

if (formulario) {
    formulario.addEventListener("submit", function(event) {
        event.preventDefault();

        const campos = formulario.querySelectorAll("input");
        let formularioCompleto = true;

        campos.forEach(function(campo) {
            if (campo.value.trim() === "") {
                formularioCompleto = false;
            }
        });

        if (!formularioCompleto) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const mensaje = document.querySelector("#mensaje");

        if (mensaje) {
            mensaje.textContent = "Formulario enviado correctamente.";
        } else {
            alert("Datos ingresados correctamente.");
        }
    });
}
