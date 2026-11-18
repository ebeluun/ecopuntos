// Sesión de EcoPuntos (SCRUM-63 y SCRUM-65).
// Los datos se guardan solo en este navegador con localStorage; no hay servidor.
// Este archivo se carga en el <head> de todas las páginas, antes que los demás scripts.

// Leer un valor JSON de localStorage sin romper la página si está dañado.
function leerJSON(clave, valorPorDefecto) {
  try {
    const valor = JSON.parse(localStorage.getItem(clave));
    return valor === null ? valorPorDefecto : valor;
  } catch (error) {
    return valorPorDefecto;
  }
}

// Usuario que inició sesión, o null si nadie ha iniciado sesión.
function obtenerUsuarioActivo() {
  return leerJSON("usuarioActivo", null);
}

function haySesion() {
  return obtenerUsuarioActivo() !== null;
}

// SCRUM-63: buscar un usuario registrado con ese correo y contraseña.
// Devuelve el usuario encontrado o null si los datos no coinciden.
function verificarCredenciales(correo, contrasena) {
  const usuarios = leerJSON("usuariosEcoPuntos", []);
  const correoNormalizado = correo.trim().toLowerCase();

  return usuarios.find(function (persona) {
    return persona.correo === correoNormalizado &&
      persona.contrasena === contrasena;
  }) || null;
}

// Guardar al usuario como sesión activa (sin la contraseña).
function iniciarSesion(usuario) {
  localStorage.setItem("usuarioActivo", JSON.stringify({
    nombre: usuario.nombre,
    correo: usuario.correo,
    usuario: usuario.usuario
  }));
}

// Página a la que se regresa después de iniciar sesión (?volver=pagina.html).
// Solo se aceptan páginas del propio sitio.
function paginaDeRegreso(paginaPorDefecto) {
  const volver = new URLSearchParams(window.location.search).get("volver");
  return volver && /^[\w-]+\.html$/.test(volver) ? volver : paginaPorDefecto;
}

// SCRUM-65: las páginas con <html data-requiere-sesion> mandan al login si no hay sesión.
if (document.documentElement.hasAttribute("data-requiere-sesion") && !haySesion()) {
  const paginaActual = window.location.pathname.split("/").pop() || "index.html";
  window.location.replace("login.html?volver=" + encodeURIComponent(paginaActual));
}

// SCRUM-65: con sesión iniciada, los enlaces de "Iniciar sesión" pasan a "Mi perfil".
document.addEventListener("DOMContentLoaded", function () {
  if (!haySesion()) return;

  const enlacesLogin = document.querySelectorAll(
    'a[href="login.html"], a[href="index.html#login-dialog"], [data-open-dialog="login-dialog"]'
  );

  enlacesLogin.forEach(function (elemento) {
    const nav = elemento.closest("nav");
    const yaHayPerfil = nav && nav.querySelector('a[href="perfil.html"]');

    // Si el menú ya tiene "Mi perfil", solo se quita "Iniciar sesión" (y su separador).
    if (yaHayPerfil) {
      const anterior = elemento.previousElementSibling;
      if (anterior && anterior.matches('span[aria-hidden="true"]')) anterior.remove();
      elemento.remove();
      return;
    }

    const enlacePerfil = document.createElement("a");
    enlacePerfil.href = "perfil.html";
    enlacePerfil.className = elemento.className;
    enlacePerfil.textContent = "Mi perfil";
    elemento.replaceWith(enlacePerfil);
  });
});
