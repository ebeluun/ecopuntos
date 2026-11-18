// Mostrar el nombre de la persona que inició sesión en los encabezados.
document.addEventListener("DOMContentLoaded", function () {
  const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo") || "null");
  const navegaciones = document.querySelectorAll("header nav");

  navegaciones.forEach(function (nav) {
    // Evitar duplicar el saludo si el script se carga más de una vez.
    if (nav.querySelector(".user-session")) return;

    if (!usuarioActivo || !usuarioActivo.nombre) return;

    // Ocultar accesos para iniciar sesión o crear cuenta cuando ya hay sesión.
    nav.querySelectorAll('a[href*="login.html"], a[href*="registro.html"], a[href*="#login-dialog"]').forEach(function (link) {
      link.hidden = true;
    });

    const session = document.createElement("span");
    session.className = "user-session";

    const name = document.createElement("span");
    name.className = "user-session-name";
    name.textContent = "Hola, " + usuarioActivo.nombre;

    const logout = document.createElement("a");
    logout.className = "user-session-logout";
    logout.href = "#";
    logout.textContent = "Cerrar sesión";
    logout.addEventListener("click", function (event) {
      event.preventDefault();
      localStorage.removeItem("usuarioActivo");
      window.location.href = "login.html";
    });

    session.append(name, logout);
    nav.appendChild(session);
  });
});
