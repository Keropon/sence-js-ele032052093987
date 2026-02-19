const express = require('express');
const hbs = require('hbs');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.set('view engine', 'hbs');

hbs.registerPartials(path.join(__dirname, '/views/partials'));

app.get('/', (req, res) => {
  const contenido = fs.readFileSync('mensajes.json', 'utf-8');
  const mensajes = JSON.parse(contenido);
  res.render('mensajes', { mensajes });
});

app.post('/nuevo-mensaje', (req, res) => {
  const nuevoMensaje = {
    usuario: req.body.usuario,
    mensaje: req.body.mensaje
  };

  const contenido = fs.readFileSync('mensajes.json', 'utf-8');
  const mensajes = JSON.parse(contenido);

  mensajes.push(nuevoMensaje);

  const nuevoContenido = JSON.stringify(mensajes, null, 2);

  fs.writeFileSync('mensajes.json', nuevoContenido);

  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
