const express = require('express');
const { engine } = require('express-handlebars');
const fs = require('fs');
const path = require('path');
const DATA_PATH = 'data/data.json';

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use('/gsap', express.static(path.join(__dirname, 'node_modules', 'gsap')));

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    length: arr => Array.isArray(arr) ? arr.length : 0,
    eq: (a, b) => a === b,
    formatDate: s => s ? s.split('-').reverse().join('/') : ''
  }
}));
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/dashboard', (req, res) => {
  const contenido = fs.readFileSync(DATA_PATH, 'utf-8');
  const data = JSON.parse(contenido);
  res.render('dashboard', data);
});

app.post('/nueva-tarjeta', (req, res) => {
  const { boardId, listId, titulo, descripcion, prioridad, tag,
    fecha_inicio, fecha_fin, autor, responsable } = req.body;

  const contenido = fs.readFileSync(DATA_PATH, 'utf-8');
  const data = JSON.parse(contenido);

  const board = data.boards.find(b => b.id === parseInt(boardId));
  if (board) {
    const list = board.lists.find(l => l.id === parseInt(listId));
    if (list) {
      let maxId = 0;
      data.boards.forEach(b => b.lists.forEach(l => l.cards.forEach(c => {
        if (c.id > maxId) maxId = c.id;
      })));

      const today = new Date().toISOString().split('T')[0];

      list.cards.push({
        id: maxId + 1,
        titulo: (titulo || '').trim(),
        descripcion: (descripcion || '').trim(),
        prioridad: prioridad || 'Task',
        tag: tag || 'Feature',
        estado: list.estado || 'Backlog',
        fecha_creacion: today,
        fecha_inicio: fecha_inicio || '',
        fecha_fin: fecha_fin || '',
        autor: (autor || '').trim(),
        responsable: (responsable || '').trim()
      });
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  res.redirect('/dashboard');
});

app.post('/editar-tarjeta', (req, res) => {
  const { cardId, boardId, listId, titulo, descripcion, prioridad, tag,
    fecha_inicio, fecha_fin, autor, responsable } = req.body;

  const contenido = fs.readFileSync(DATA_PATH, 'utf-8');
  const data = JSON.parse(contenido);

  const board = data.boards.find(b => b.id === parseInt(boardId));
  if (board) {
    const list = board.lists.find(l => l.id === parseInt(listId));
    if (list) {
      const card = list.cards.find(c => c.id === parseInt(cardId));
      if (card) {
        card.titulo = (titulo || '').trim();
        card.descripcion = (descripcion || '').trim();
        card.prioridad = prioridad || card.prioridad;
        card.tag = tag || card.tag;
        card.fecha_inicio = fecha_inicio || card.fecha_inicio;
        card.fecha_fin = fecha_fin || card.fecha_fin;
        card.autor = (autor || '').trim() || card.autor;
        card.responsable = (responsable || '').trim() || card.responsable;
      }
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  res.redirect('/dashboard');
});

app.post('/mover-tarjeta', (req, res) => {
  const { cardId, fromBoardId, fromListId, toBoardId, toListId } = req.body;

  const contenido = fs.readFileSync(DATA_PATH, 'utf-8');
  const data = JSON.parse(contenido);

  const fromBoard = data.boards.find(b => b.id === parseInt(fromBoardId));
  const toBoard = data.boards.find(b => b.id === parseInt(toBoardId));

  if (!fromBoard || !toBoard) return res.status(400).json({ ok: false, error: 'Board no encontrado' });

  const fromList = fromBoard.lists.find(l => l.id === parseInt(fromListId));
  const toList = toBoard.lists.find(l => l.id === parseInt(toListId));

  if (!fromList || !toList) return res.status(400).json({ ok: false, error: 'Lista no encontrada' });

  const cardIndex = fromList.cards.findIndex(c => c.id === parseInt(cardId));
  if (cardIndex === -1) return res.status(400).json({ ok: false, error: 'Tarjeta no encontrada' });

  const [card] = fromList.cards.splice(cardIndex, 1);
  card.estado = toList.estado || card.estado;
  toList.cards.push(card);

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  res.json({ ok: true });
});

app.post('/eliminar-tarjeta', (req, res) => {
  const { cardId, boardId, listId } = req.body;

  const contenido = fs.readFileSync(DATA_PATH, 'utf-8');
  const data = JSON.parse(contenido);

  const board = data.boards.find(b => b.id === parseInt(boardId));
  if (board) {
    const list = board.lists.find(l => l.id === parseInt(listId));
    if (list) {
      const cardIndex = list.cards.findIndex(c => c.id === parseInt(cardId));
      if (cardIndex !== -1) list.cards.splice(cardIndex, 1);
    }
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  res.redirect('/dashboard');
});

app.post('/nueva-lista', (req, res) => {
  const { boardId, name } = req.body;

  const contenido = fs.readFileSync(DATA_PATH, 'utf-8');
  const data = JSON.parse(contenido);

  const board = data.boards.find(b => b.id === parseInt(boardId));
  if (board) {
    let maxId = 0;
    data.boards.forEach(b => b.lists.forEach(l => {
      if (l.id > maxId) maxId = l.id;
    }));

    board.lists.push({
      id: maxId + 1,
      name: name.trim(),
      estado: name.trim(),
      cards: []
    });
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  res.redirect('/dashboard');
});

app.post('/eliminar-lista', (req, res) => {
  const { boardId, listId } = req.body;

  const contenido = fs.readFileSync(DATA_PATH, 'utf-8');
  const data = JSON.parse(contenido);

  const board = data.boards.find(b => b.id === parseInt(boardId));
  if (board) {
    const idx = board.lists.findIndex(l => l.id === parseInt(listId));
    if (idx !== -1) board.lists.splice(idx, 1);
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  res.json({ ok: true });
});

app.get('/exportar-datos', (req, res) => {
  res.download(path.join(__dirname, DATA_PATH), 'kanbanpro-export.json');
});

app.post('/importar-datos', (req, res) => {
  const data = req.body;
  if (!data || !data.boards || !Array.isArray(data.boards)) {
    return res.status(400).json({ ok: false, error: 'Formato inválido' });
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`KanbanPro escuchando en http://localhost:${port}`);
});
