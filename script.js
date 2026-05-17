function binomial(n, k) {
  if (k < 0 || k > n) return 0;

  let result = 1;
  const limit = Math.min(k, n - k);

  for (let i = 1; i <= limit; i++) {
    result = result * (n - limit + i) / i;
  }

  return result;
}

function GenerateBezierCurvePoints(P, n) {
  const curvePoints = [];

  if (P.length === 0 || n <= 0) {
    return curvePoints;
  }

  if (n === 1) {
    return [{ x: P[0].x, y: P[0].y }];
  }

  const degree = P.length - 1;
  const coefficients = [];

  for (let i = 0; i <= degree; i++) {
    coefficients.push(binomial(degree, i));
  }

  for (let j = 0; j < n; j++) {
    const t = j / (n - 1);
    const s = 1 - t;
    let x = 0;
    let y = 0;

    for (let i = 0; i <= degree; i++) {
      const weight = coefficients[i] * Math.pow(t, i) * Math.pow(s, degree - i);
      x += weight * P[i].x;
      y += weight * P[i].y;
    }

    curvePoints.push({ x: x, y: y });
  }

  return curvePoints;
}

function drawPoint(ctx, point, radius, fill, stroke) {
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawPolyline(ctx, points, color, width) {
  if (points.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
}

function drawScene(ctx, controlPoints, curvePoints) {
  const canvas = ctx.canvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawPolyline(ctx, controlPoints, "#9aa7b4", 1.5);
  drawPolyline(ctx, curvePoints, "#d12c4f", 3);

  for (let i = 0; i < curvePoints.length; i++) {
    if (i % 8 === 0 || i === curvePoints.length - 1) {
      drawPoint(ctx, curvePoints[i], 2.5, "#d12c4f", "#d12c4f");
    }
  }

  for (let i = 0; i < controlPoints.length; i++) {
    drawPoint(ctx, controlPoints[i], 7, "#1f6feb", "#ffffff");
    ctx.fillStyle = "#25313f";
    ctx.font = "13px Arial, Helvetica, sans-serif";
    ctx.fillText("P" + i, controlPoints[i].x + 10, controlPoints[i].y - 10);
  }
}

function canvasPointFromEvent(canvas, event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: (event.clientX - rect.left) * canvas.width / rect.width,
    y: (event.clientY - rect.top) * canvas.height / rect.height
  };
}

if (typeof module !== "undefined") {
  module.exports = { GenerateBezierCurvePoints };
}

if (typeof document !== "undefined") {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const statusElement = document.getElementById("status");
  const pointCountInput = document.getElementById("pointCount");
  const generateButton = document.getElementById("generateButton");
  const clearButton = document.getElementById("clearButton");
  const controlPoints = [];
  let curvePoints = [];

  function updateStatus() {
    if (controlPoints.length < 2) {
      statusElement.textContent = "Zadato je " + controlPoints.length + " upravljackih tacaka. Za krivu su potrebne barem 2.";
    } else if (curvePoints.length === 0) {
      statusElement.textContent = "Zadato je " + controlPoints.length + " upravljackih tacaka. Kliknite na dugme za generisanje.";
    } else {
      statusElement.textContent = "Generisana je Bezierova kriva sa " + curvePoints.length + " tacaka i " + controlPoints.length + " upravljackih tacaka.";
    }
  }

  canvas.addEventListener("click", function(event) {
    controlPoints.push(canvasPointFromEvent(canvas, event));
    curvePoints = [];
    drawScene(ctx, controlPoints, curvePoints);
    updateStatus();
  });

  generateButton.addEventListener("click", function() {
    const pointCount = Math.max(2, Math.min(1000, Number(pointCountInput.value) || 100));
    pointCountInput.value = pointCount;

    if (controlPoints.length >= 2) {
      curvePoints = GenerateBezierCurvePoints(controlPoints, pointCount);
    }

    drawScene(ctx, controlPoints, curvePoints);
    updateStatus();
  });

  clearButton.addEventListener("click", function() {
    controlPoints.length = 0;
    curvePoints = [];
    drawScene(ctx, controlPoints, curvePoints);
    updateStatus();
  });

  drawScene(ctx, controlPoints, curvePoints);
  updateStatus();
}
