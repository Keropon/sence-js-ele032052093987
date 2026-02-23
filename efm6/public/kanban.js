'use strict';

// afterMove runs synchronously inside the transition callback,
// guaranteeing the count update sees the already-moved card.
function moveCardToColumn(card, targetCol, afterMove) {
  const doMove = () => {
    targetCol.appendChild(card);
    if (afterMove) afterMove();
  };

  if ('startViewTransition' in document) {
    document.startViewTransition(doMove);
  } else {
    doMove();
  }
}

function updateCount(listEl) {
  const badge = listEl.querySelector('.kanban-list-count');
  if (badge) badge.textContent = listEl.querySelectorAll('.kanban-card').length;
}

function persistMove(cardId, fromBoardId, fromListId, toBoardId, toListId) {
  fetch('/mover-tarjeta', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cardId, fromBoardId, fromListId, toBoardId, toListId })
  })
    .then(r => r.json())
    .then(data => { if (!data.ok) location.reload(); })
    .catch(() => location.reload());
}

// ── GSAP Draggable ───────────────────────────────────
function initGSAPDrag() {
  gsap.registerPlugin(Draggable);

  const dropZones = Array.from(document.querySelectorAll('.kanban-cards'));

  document.querySelectorAll('.kanban-card').forEach(card => {
    const handle = card.querySelector('.kanban-drag-handle');
    if (!handle) return;

    let fromListId, fromBoardId, fromListEl;
    let activeZone = null;

    Draggable.create(card, {
      type:    'x,y',
      trigger: handle,
      zIndex:  1000,

      onDragStart() {
        fromListId  = card.dataset.listId;
        fromBoardId = card.dataset.boardId;
        fromListEl  = card.closest('.kanban-list');
        card.classList.add('dragging');
      },

      onDrag() {
        let found = null;
        for (const zone of dropZones) {
          if (this.hitTest(zone, '30%')) { found = zone; break; }
        }
        if (found !== activeZone) {
          if (activeZone) activeZone.classList.remove('drag-over');
          if (found)      found.classList.add('drag-over');
          activeZone = found;
        }
      },

      onDragEnd() {
        card.classList.remove('dragging');
        if (activeZone) activeZone.classList.remove('drag-over');

        const toZone = activeZone;
        activeZone = null;

        if (!toZone) {
          gsap.set(card, { x: 0, y: 0 });
          return;
        }

        const toListId  = toZone.dataset.listId;
        const toBoardId = toZone.dataset.boardId;

        if (toListId === fromListId && toBoardId === fromBoardId) {
          gsap.set(card, { x: 0, y: 0 });
          return;
        }

        const cardId   = card.dataset.cardId;
        const toListEl = toZone.closest('.kanban-list');

        // Reset GSAP transform before DOM move so view transition captures clean state
        gsap.set(card, { x: 0, y: 0, zIndex: '' });

        moveCardToColumn(card, toZone, () => {
          card.dataset.listId  = toListId;
          card.dataset.boardId = toBoardId;
          updateCount(fromListEl);
          updateCount(toListEl);
        });

        persistMove(cardId, fromBoardId, fromListId, toBoardId, toListId);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof Draggable === 'undefined') {
    console.error('GSAP Draggable not loaded.');
    return;
  }
  initGSAPDrag();
});
