// Interacciones de la página principal de EcoPuntos.

document.querySelectorAll("[data-open-dialog]").forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = document.getElementById(button.dataset.openDialog);
    if (dialog && typeof dialog.showModal === "function") {
      dialog.showModal();
    }
  });
});

document.querySelectorAll(".dialog-close").forEach((button) => {
  button.addEventListener("click", () => {
    const dialog = button.closest("dialog");
    if (dialog) dialog.close();
  });
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

// SCRUM-63: el cuadro de inicio de sesión verifica los datos guardados en el navegador.
const loginForm = document.querySelector(".login-form");

if (loginForm) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = document.getElementById("login-message");
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const user = verificarCredenciales(email, password);

    if (!user) {
      message.textContent = "Correo o contraseña incorrectos. Si aún no tienes cuenta, regístrate.";
      return;
    }

    iniciarSesion(user);
    message.textContent = "¡Bienvenido, " + user.nombre + "!";
    setTimeout(() => {
      window.location.href = "perfil.html";
    }, 800);
  });
}

// Abre el cuadro de inicio de sesión si otra página enlaza a #login-dialog.
if (window.location.hash === "#login-dialog") {
  const loginDialog = document.getElementById("login-dialog");
  if (loginDialog && typeof loginDialog.showModal === "function") {
    loginDialog.showModal();
  }
}
