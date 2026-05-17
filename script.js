function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function pixelKey(x, y) {
  return x + "," + y;
}

function addPixel(pixels, x, y, intensity) {
  const key = pixelKey(x, y);
  const value = clamp01(intensity);

  if (!pixels.has(key) || pixels.get(key) < value) {
    pixels.set(key, value);
  }
}

function addSymmetricPixels(pixels, X, Y, x, y, intensity) {
  addPixel(pixels, X + x, Y + y, intensity);
  addPixel(pixels, X - x, Y + y, intensity);
  addPixel(pixels, X + x, Y - y, intensity);
  addPixel(pixels, X - x, Y - y, intensity);
  addPixel(pixels, X + y, Y + x, intensity);
  addPixel(pixels, X - y, Y + x, intensity);
  addPixel(pixels, X + y, Y - x, intensity);
  addPixel(pixels, X - y, Y - x, intensity);
}

function CombinePixel(ctx, X, Y, graylevel) {
  if (X < 0 || Y < 0 || X >= ctx.canvas.width || Y >= ctx.canvas.height) {
    return;
  }

  const pixdata = ctx.getImageData(X, Y, 1, 1).data;
  const pixc = pixdata[3] === 0 ? 255 : pixdata[0];
  const comblevel = Math.max(Math.round(graylevel) + pixc - 255, 0);

  ctx.fillStyle = "rgb(" + comblevel + "," + comblevel + "," + comblevel + ")";
  ctx.fillRect(X, Y, 1, 1);
}

function CircleDraw_Antialiased(ctx, X, Y, r) {
  const radius = Math.max(0, r);
  const pixels = new Map();
  const limit = Math.ceil(radius / Math.sqrt(2));

  for (let x = 0; x <= limit; x++) {
    const exactY = Math.sqrt(radius * radius - x * x);
    const y1 = Math.floor(exactY);
    const y2 = y1 + 1;
    const fraction = exactY - y1;

    addSymmetricPixels(pixels, X, Y, x, y1, 1 - fraction);

    if (fraction > 0) {
      addSymmetricPixels(pixels, X, Y, x, y2, fraction);
    }
  }

  for (const entry of pixels) {
    const parts = entry[0].split(",");
    const graylevel = 255 * (1 - entry[1]);
    CombinePixel(ctx, Number(parts[0]), Number(parts[1]), graylevel);
  }
}

function drawScene(canvas, ctx, statusElement) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let r = 5; r <= 100; r += 5) {
    CircleDraw_Antialiased(ctx, 300, 150, r);
  }

  ctx.fillStyle = "#d62828";
  ctx.beginPath();
  ctx.arc(300, 150, 3, 0, 2 * Math.PI);
  ctx.fill();

  statusElement.textContent = "Iscrtano je 20 koncentricnih kruznica. Centar: (300, 150), poluprecnici: 5 do 100.";
}

if (typeof module !== "undefined") {
  module.exports = { CircleDraw_Antialiased, CombinePixel };
}

if (typeof document !== "undefined") {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const statusElement = document.getElementById("status");
  const drawButton = document.getElementById("drawButton");

  drawButton.addEventListener("click", function() {
    drawScene(canvas, ctx, statusElement);
  });

  drawScene(canvas, ctx, statusElement);
}
