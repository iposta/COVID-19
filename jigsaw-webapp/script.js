const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d');
const input = document.getElementById('imageUpload');

let img, pieces = [], rows = 3, cols = 3, pieceW, pieceH;
let selected = null, offsetX = 0, offsetY = 0;

input.addEventListener('change', handleImage);
canvas.addEventListener('mousedown', onDown);
canvas.addEventListener('mousemove', onMove);
canvas.addEventListener('mouseup', onUp);
canvas.addEventListener('mouseleave', onUp);

function handleImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    img = new Image();
    img.onload = () => initPuzzle();
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function initPuzzle() {
  canvas.width = img.width + 200;
  canvas.height = img.height + 200;
  pieceW = Math.floor(img.width / cols);
  pieceH = Math.floor(img.height / rows);
  pieces = [];
  const edges = [];
  for (let y = 0; y < rows; y++) {
    edges[y] = [];
    for (let x = 0; x < cols; x++) {
      const edge = { top: 0, left: 0, right: 0, bottom: 0 };
      if (y > 0) {
        edge.top = -edges[y - 1][x].bottom;
      } else {
        edge.top = 0;
      }
      if (x > 0) {
        edge.left = -edges[y][x - 1].right;
      } else {
        edge.left = 0;
      }
      if (y < rows - 1) {
        edge.bottom = Math.random() > 0.5 ? 1 : -1;
      }
      if (x < cols - 1) {
        edge.right = Math.random() > 0.5 ? 1 : -1;
      }
      edges[y][x] = edge;
    }
  }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const pieceCanvas = document.createElement('canvas');
      pieceCanvas.width = pieceW + 40;
      pieceCanvas.height = pieceH + 40;
      const pctx = pieceCanvas.getContext('2d');
      pctx.translate(20,20);
      createPiecePath(pctx, edges[y][x], pieceW, pieceH);
      pctx.clip();
      pctx.drawImage(img, -x * pieceW, -y * pieceH);
      const piece = {
        canvas: pieceCanvas,
        correctX: x * pieceW + 100,
        correctY: y * pieceH + 100,
        x: Math.random() * (canvas.width - pieceCanvas.width),
        y: Math.random() * (canvas.height - pieceCanvas.height),
        width: pieceCanvas.width,
        height: pieceCanvas.height,
        solved: false
      };
      pieces.push(piece);
    }
  }
  draw();
}

function createPiecePath(ctx, edge, w, h) {
  const size = Math.min(w, h) / 3;
  ctx.beginPath();
  ctx.moveTo(0,0);
  // top
  if (edge.top === 0) {
    ctx.lineTo(w,0);
  } else {
    ctx.lineTo(w/3,0);
    ctx.bezierCurveTo(w/2, -edge.top*size, w/2, -edge.top*size, 2*w/3,0);
    ctx.lineTo(w,0);
  }
  // right
  if (edge.right === 0) {
    ctx.lineTo(w,h);
  } else {
    ctx.lineTo(w,h/3);
    ctx.bezierCurveTo(w+edge.right*size, h/2, w+edge.right*size, h/2, w,2*h/3);
    ctx.lineTo(w,h);
  }
  // bottom
  if (edge.bottom === 0) {
    ctx.lineTo(0,h);
  } else {
    ctx.lineTo(2*w/3,h);
    ctx.bezierCurveTo(w/2, h+edge.bottom*size, w/2, h+edge.bottom*size, w/3,h);
    ctx.lineTo(0,h);
  }
  // left
  if (edge.left === 0) {
    ctx.closePath();
  } else {
    ctx.lineTo(0,2*h/3);
    ctx.bezierCurveTo(-edge.left*size, h/2, -edge.left*size, h/2, 0,h/3);
    ctx.closePath();
  }
}

function onDown(e) {
  const pos = getMousePos(e);
  for (let i = pieces.length - 1; i >= 0; i--) {
    const p = pieces[i];
    if (isInside(pos, p)) {
      selected = p;
      offsetX = pos.x - p.x;
      offsetY = pos.y - p.y;
      pieces.splice(i,1);
      pieces.push(p);
      break;
    }
  }
}

function onMove(e) {
  if (!selected) return;
  const pos = getMousePos(e);
  selected.x = pos.x - offsetX;
  selected.y = pos.y - offsetY;
  draw();
}

function onUp() {
  if (!selected) return;
  if (Math.abs(selected.x - selected.correctX) < 20 && Math.abs(selected.y - selected.correctY) < 20) {
    selected.x = selected.correctX;
    selected.y = selected.correctY;
    selected.solved = true;
  }
  selected = null;
  draw();
}

function isInside(pos, piece) {
  return pos.x > piece.x && pos.x < piece.x + piece.width &&
         pos.y > piece.y && pos.y < piece.y + piece.height;
}

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for (const p of pieces) {
    ctx.drawImage(p.canvas, p.x, p.y);
  }
}
