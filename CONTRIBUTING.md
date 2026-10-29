# Guía para colaborar

1. Clona el repositorio.
2. Cambia a `develop` y actualiza tu copia.
3. Crea una rama con el nombre de tu tarea.
4. Realiza cambios pequeños y relacionados.
5. Prueba el resultado en tu navegador.
6. Guarda los cambios con un commit descriptivo.
7. Sube tu rama y abre un Pull Request hacia `develop`.
8. Solicita revisión antes de integrar.

Ejemplo de comandos:

```bash
git clone https://github.com/ebeluun/ecopuntos.git
cd ecopuntos
git switch develop
git pull origin develop
git switch -c feature/mi-tarea
git add .
git commit -m "feat: descripcion breve"
git push -u origin feature/mi-tarea
```

No subir contraseñas, tokens, claves API ni archivos con información privada.
