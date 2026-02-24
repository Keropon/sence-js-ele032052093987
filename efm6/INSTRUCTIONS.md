# KanbanPro — Instrucciones

## Requisitos

- Node.js 18+
- npm

---

## Configuración inicial

Instala todas las dependencias del proyecto (Express, GSAP, Tailwind, Nodemon, etc.):

```bash
npm install
```

Antes de correr el proyecto por primera vez, modifica el archivo de config de tailwind según consideres necesario (tailwing.config.js) y compila el CSS **una sola vez** (Tailwind tomará `src/input.css` y generará `public/style.css`, que será el único archivo CSS utilizado por el proyecto):

```bash
npm run build:css
```

---

## Correr el proyecto

Arranca el servidor de desarrollo. Nodemon se encarga de reiniciarlo automáticamente cada vez que edites `app.js`:

```bash
npm start
```

El proyecto queda disponible en **http://localhost:3000**

---

## Mantener el CSS al día

Cada vez que modifiques `src/input.css`, necesitas recompilar el archivo. Lo más cómodo es dejar este comando corriendo en una segunda terminal, al lado del servidor:

```bash
npm run watch:css
```

Si prefieres hacerlo a mano después de cada cambio:

```bash
npm run build:css
```

---

## Datos

Toda la información de la app vive en **`data.json`**, en la raíz del proyecto.
El servidor lo lee y escribe directamente en cada solicitud sin base de datos de por medio.

Se pueden respaldar y restaurar los datos usando los botones **Exportar / Importar** que están en el Dashboard.
