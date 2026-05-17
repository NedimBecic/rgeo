function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pointInRectangle(point, rectangle) {
  return point.x >= rectangle.x1 &&
    point.x <= rectangle.x2 &&
    point.y >= rectangle.y1 &&
    point.y <= rectangle.y2;
}

function createCellMatrix(p, q) {
  const C = [];

  for (let row = 0; row < p; row++) {
    const gridRow = [];

    for (let col = 0; col < q; col++) {
      gridRow.push([]);
    }

    C.push(gridRow);
  }

  return C;
}

function MakeGrid(P, p, q) {
  let x1 = Infinity;
  let x2 = -Infinity;
  let y1 = Infinity;
  let y2 = -Infinity;

  for (const point of P) {
    x1 = Math.min(x1, point.x);
    x2 = Math.max(x2, point.x);
    y1 = Math.min(y1, point.y);
    y2 = Math.max(y2, point.y);
  }

  if (P.length === 0) {
    x1 = 0;
    x2 = 1;
    y1 = 0;
    y2 = 1;
  } else {
    const width = x2 - x1;
    const height = y2 - y1;
    x2 += width === 0 ? 1 : 0.01 * width;
    y2 += height === 0 ? 1 : 0.01 * height;
  }

  const G = {
    p: p,
    q: q,
    x1: x1,
    x2: x2,
    y1: y1,
    y2: y2,
    C: createCellMatrix(p, q)
  };

  const w = (G.x2 - G.x1) / G.q;
  const h = (G.y2 - G.y1) / G.p;

  for (const point of P) {
    const row = clamp(Math.floor((point.y - G.y1) / h), 0, G.p - 1);
    const col = clamp(Math.floor((point.x - G.x1) / w), 0, G.q - 1);
    G.C[row][col].push(point);
  }

  return G;
}

function RectangularSearch_GridMethod(G, R) {
  const rectangle = {
    x1: Math.min(R.x1, R.x2),
    x2: Math.max(R.x1, R.x2),
    y1: Math.min(R.y1, R.y2),
    y2: Math.max(R.y1, R.y2)
  };

  const Q = [];
  const w = (G.x2 - G.x1) / G.q;
  const h = (G.y2 - G.y1) / G.p;
  const col1 = clamp(Math.floor((rectangle.x1 - G.x1) / w), 0, G.q - 1);
  const col2 = clamp(Math.floor((rectangle.x2 - G.x1) / w), 0, G.q - 1);
  const row1 = clamp(Math.floor((rectangle.y1 - G.y1) / h), 0, G.p - 1);
  const row2 = clamp(Math.floor((rectangle.y2 - G.y1) / h), 0, G.p - 1);

  for (let row = row1; row <= row2; row++) {
    for (let col = col1; col <= col2; col++) {
      for (const point of G.C[row][col]) {
        if (pointInRectangle(point, rectangle)) {
          Q.push(point);
        }
      }
    }
  }

  return Q;
}

function generatePoints(canvas) {
  const count = randomInteger(50, 100);
  const points = [];
  const used = new Set();
  const margin = 36;

  while (points.length < count) {
    const x = randomInteger(margin, canvas.width - margin);
    const y = randomInteger(margin, canvas.height - margin);
    const key = x + "," + y;

    if (!used.has(key)) {
      used.add(key);
      points.push({ x: x, y: y });
    }
  }

  return points;
}

function generateRectangle(canvas) {
  const width = randomInteger(150, 300);
  const height = randomInteger(90, 190);
  const x1 = randomInteger(80, canvas.width - width - 80);
  const y1 = randomInteger(70, canvas.height - height - 70);

  return {
    x1: x1,
    x2: x1 + width,
    y1: y1,
    y2: y1 + height
  };
}

function drawPoint(ctx, point, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
  ctx.fill();
}

function drawGrid(ctx, G) {
  const w = (G.x2 - G.x1) / G.q;
  const h = (G.y2 - G.y1) / G.p;

  ctx.strokeStyle = "#d7e0e6";
  ctx.lineWidth = 1;

  for (let col = 0; col <= G.q; col++) {
    const x = G.x1 + col * w;
    ctx.beginPath();
    ctx.moveTo(x, G.y1);
    ctx.lineTo(x, G.y2);
    ctx.stroke();
  }

  for (let row = 0; row <= G.p; row++) {
    const y = G.y1 + row * h;
    ctx.beginPath();
    ctx.moveTo(G.x1, y);
    ctx.lineTo(G.x2, y);
    ctx.stroke();
  }
}

function drawRectangle(ctx, R) {
  const width = R.x2 - R.x1;
  const height = R.y2 - R.y1;

  ctx.fillStyle = "rgba(229, 87, 53, 0.12)";
  ctx.strokeStyle = "#e55735";
  ctx.lineWidth = 3;
  ctx.fillRect(R.x1, R.y1, width, height);
  ctx.strokeRect(R.x1, R.y1, width, height);
}

function drawScene(ctx, points, grid, rectangle, foundPoints) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  drawGrid(ctx, grid);
  drawRectangle(ctx, rectangle);

  for (const point of points) {
    drawPoint(ctx, point, 4, "#23424a");
  }

  for (const point of foundPoints) {
    drawPoint(ctx, point, 7, "#c81d25");
    drawPoint(ctx, point, 3, "#ffffff");
  }
}

function runDemo(canvas, ctx, statusElement) {
  const points = generatePoints(canvas);
  const p = 8;
  const q = 10;
  const grid = MakeGrid(points, p, q);
  const rectangle = generateRectangle(canvas);
  const foundPoints = RectangularSearch_GridMethod(grid, rectangle);

  drawScene(ctx, points, grid, rectangle, foundPoints);

  statusElement.textContent = "Broj tacaka: " + points.length +
    ". Format mreze: " + p + " x " + q +
    ". Tacaka u pravougaoniku: " + foundPoints.length + ".";
}

if (typeof module !== "undefined") {
  module.exports = { MakeGrid, RectangularSearch_GridMethod, pointInRectangle };
}

if (typeof document !== "undefined") {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const statusElement = document.getElementById("status");
  const generateButton = document.getElementById("generateButton");

  generateButton.addEventListener("click", function() {
    runDemo(canvas, ctx, statusElement);
  });

  runDemo(canvas, ctx, statusElement);
}
