function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pointInRectangle(point, rectangle) {
  return point.x >= rectangle.x1 &&
    point.x <= rectangle.x2 &&
    point.y >= rectangle.y1 &&
    point.y <= rectangle.y2;
}

function generatePoints(canvas) {
  const points = [];
  const used = new Set();
  const margin = 28;

  while (points.length < 100) {
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

function generateRectangle(canvas, points) {
  const margin = 28;
  const width = randomInteger(170, 340);
  const height = randomInteger(110, 230);
  const point = points[randomInteger(0, points.length - 1)];
  const minX = Math.max(margin, point.x - width);
  const maxX = Math.min(point.x, canvas.width - margin - width);
  const minY = Math.max(margin, point.y - height);
  const maxY = Math.min(point.y, canvas.height - margin - height);
  const x1 = randomInteger(minX, maxX);
  const y1 = randomInteger(minY, maxY);

  return {
    x1: x1,
    y1: y1,
    x2: x1 + width,
    y2: y1 + height
  };
}

function bruteForceSearch(points, rectangle) {
  const inside = [];
  const outside = [];

  for (const point of points) {
    if (pointInRectangle(point, rectangle)) {
      inside.push(point);
    } else {
      outside.push(point);
    }
  }

  return {
    inside: inside,
    outside: outside
  };
}

function drawPoint(ctx, point, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
  ctx.fill();
}

function drawRectangle(ctx, rectangle) {
  ctx.fillStyle = "rgba(21, 101, 192, 0.08)";
  ctx.strokeStyle = "#1565c0";
  ctx.lineWidth = 3;
  ctx.fillRect(
    rectangle.x1,
    rectangle.y1,
    rectangle.x2 - rectangle.x1,
    rectangle.y2 - rectangle.y1
  );
  ctx.strokeRect(
    rectangle.x1,
    rectangle.y1,
    rectangle.x2 - rectangle.x1,
    rectangle.y2 - rectangle.y1
  );
}

function drawScene(ctx, points, rectangle, result) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  drawRectangle(ctx, rectangle);

  for (const point of result.outside) {
    drawPoint(ctx, point, "#c62828");
  }

  for (const point of result.inside) {
    drawPoint(ctx, point, "#2e7d32");
  }
}

function logResult(result) {
  const pointsForTable = result.inside.map(function(point, index) {
    return {
      redniBroj: index + 1,
      x: point.x,
      y: point.y
    };
  });

  console.log("Broj tacaka u pravougaoniku: " + result.inside.length);
  console.log("Tacke u pravougaoniku:", result.inside);

  if (pointsForTable.length > 0) {
    console.table(pointsForTable);
  }
}

function runSearch(canvas, ctx, statusElement) {
  const points = generatePoints(canvas);
  const rectangle = generateRectangle(canvas, points);
  const result = bruteForceSearch(points, rectangle);

  drawScene(ctx, points, rectangle, result);
  logResult(result);

  statusElement.textContent = "Generisano je 100 tacaka. U pravougaoniku je " +
    result.inside.length + " tacaka.";
}

if (typeof module !== "undefined") {
  module.exports = {
    pointInRectangle: pointInRectangle,
    generatePoints: generatePoints,
    generateRectangle: generateRectangle,
    bruteForceSearch: bruteForceSearch
  };
}

if (typeof document !== "undefined") {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const statusElement = document.getElementById("status");
  const generateButton = document.getElementById("generateButton");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  generateButton.addEventListener("click", function() {
    runSearch(canvas, ctx, statusElement);
  });
}
