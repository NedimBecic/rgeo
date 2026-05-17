function sqr(x) {
  return x * x;
}

function pointDistanceSquared(A, B) {
  return sqr(A.x - B.x) + sqr(A.y - B.y);
}

function GenerateCurvePoints_Adaptive(phi, psi, tmin, tmax, h, d) {
  const points = [];
  const direction = tmax >= tmin ? 1 : -1;
  let step = Math.abs(h) * direction;
  const desiredDistanceSquared = d * d;
  const smallestAcceptedDistanceSquared = sqr(0.3 * d);
  const intervalLength = Math.abs(tmax - tmin);
  const smallestStep = Math.max(intervalLength * 1e-9, 1e-12);

  if (intervalLength === 0 || step === 0 || d <= 0) {
    return [{ x: phi(tmin), y: psi(tmin) }];
  }

  let t = tmin;
  let currentPoint = { x: phi(t), y: psi(t) };
  let lastAcceptedPoint = currentPoint;

  points.push(currentPoint);

  while ((tmax - t) * direction > 1e-12) {
    if (Math.abs(step) > Math.abs(tmax - t)) {
      step = tmax - t;
    }

    const previousPoint = currentPoint;
    let nextT = t + step;
    let nextPoint = { x: phi(nextT), y: psi(nextT) };
    let reductions = 0;

    while (
      pointDistanceSquared(previousPoint, nextPoint) > desiredDistanceSquared &&
      Math.abs(step) > smallestStep &&
      reductions < 80
    ) {
      step *= 0.8;
      nextT = t + step;
      nextPoint = { x: phi(nextT), y: psi(nextT) };
      reductions++;
    }

    if (pointDistanceSquared(lastAcceptedPoint, nextPoint) > smallestAcceptedDistanceSquared) {
      points.push(nextPoint);
      lastAcceptedPoint = nextPoint;
    }

    t = nextT;
    currentPoint = nextPoint;
    step *= 1.2;
  }

  const finalPoint = { x: phi(tmax), y: psi(tmax) };

  if (pointDistanceSquared(lastAcceptedPoint, finalPoint) > 1e-16) {
    points.push(finalPoint);
  }

  return points;
}

function createCurves() {
  return [
    {
      name: "Lissajousova kriva",
      color: "#0f766e",
      tmin: 0,
      tmax: 2 * Math.PI,
      h: 0.08,
      d: 0.045,
      phi: function(t) {
        return Math.sin(3 * t + Math.PI / 2);
      },
      psi: function(t) {
        return Math.sin(4 * t);
      }
    },
    {
      name: "Hipotrohoida",
      color: "#d97706",
      tmin: 0,
      tmax: 6 * Math.PI,
      h: 0.08,
      d: 0.12,
      phi: function(t) {
        const R = 5;
        const r = 3;
        const a = 5;
        return (R - r) * Math.cos(t) + a * Math.cos((R - r) * t / r);
      },
      psi: function(t) {
        const R = 5;
        const r = 3;
        const a = 5;
        return (R - r) * Math.sin(t) - a * Math.sin((R - r) * t / r);
      }
    },
    {
      name: "Epicikloida",
      color: "#2563eb",
      tmin: 0,
      tmax: 2 * Math.PI,
      h: 0.07,
      d: 0.1,
      phi: function(t) {
        const R = 3;
        const r = 1;
        return (R + r) * Math.cos(t) - r * Math.cos((R + r) * t / r);
      },
      psi: function(t) {
        const R = 3;
        const r = 1;
        return (R + r) * Math.sin(t) - r * Math.sin((R + r) * t / r);
      }
    },
    {
      name: "Leptir kriva",
      color: "#be123c",
      tmin: 0,
      tmax: 12 * Math.PI,
      h: 0.08,
      d: 0.08,
      phi: function(t) {
        const factor = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - sqr(sqr(Math.sin(t / 12))) * Math.sin(t / 12);
        return Math.sin(t) * factor;
      },
      psi: function(t) {
        const factor = Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - sqr(sqr(Math.sin(t / 12))) * Math.sin(t / 12);
        return Math.cos(t) * factor;
      }
    }
  ];
}

function curveBounds(points) {
  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  return { minX: minX, maxX: maxX, minY: minY, maxY: maxY };
}

function mapPoint(point, bounds, area) {
  const width = Math.max(bounds.maxX - bounds.minX, 1e-9);
  const height = Math.max(bounds.maxY - bounds.minY, 1e-9);
  const scale = 0.78 * Math.min(area.width / width, area.height / height);
  const centerX = area.x + area.width / 2;
  const centerY = area.y + area.height / 2 + 12;
  const middleX = (bounds.minX + bounds.maxX) / 2;
  const middleY = (bounds.minY + bounds.maxY) / 2;

  return {
    x: centerX + (point.x - middleX) * scale,
    y: centerY - (point.y - middleY) * scale
  };
}

function drawPolyline(ctx, points, bounds, area, color) {
  if (points.length === 0) return;

  ctx.beginPath();

  for (let i = 0; i < points.length; i++) {
    const mapped = mapPoint(points[i], bounds, area);

    if (i === 0) {
      ctx.moveTo(mapped.x, mapped.y);
    } else {
      ctx.lineTo(mapped.x, mapped.y);
    }
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.4;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
}

function drawCurvePanel(ctx, curve, area) {
  const points = GenerateCurvePoints_Adaptive(curve.phi, curve.psi, curve.tmin, curve.tmax, curve.h, curve.d);
  const bounds = curveBounds(points);

  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(area.x, area.y, area.width, area.height);
  ctx.strokeStyle = "#d6dee3";
  ctx.lineWidth = 1;
  ctx.strokeRect(area.x + 0.5, area.y + 0.5, area.width - 1, area.height - 1);

  ctx.fillStyle = "#1f2937";
  ctx.font = "700 18px Arial, Helvetica, sans-serif";
  ctx.fillText(curve.name, area.x + 22, area.y + 34);
  ctx.fillStyle = "#64748b";
  ctx.font = "14px Arial, Helvetica, sans-serif";
  ctx.fillText("Broj tacaka: " + points.length, area.x + 22, area.y + 56);

  drawPolyline(ctx, points, bounds, {
    x: area.x + 18,
    y: area.y + 64,
    width: area.width - 36,
    height: area.height - 84
  }, curve.color);

  return points.length;
}

function drawScene(canvas, ctx, statusElement) {
  const curves = createCurves();
  const padding = 18;
  const gap = 18;
  const panelWidth = (canvas.width - 2 * padding - gap) / 2;
  const panelHeight = (canvas.height - 2 * padding - gap) / 2;
  let totalPoints = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < curves.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);

    totalPoints += drawCurvePanel(ctx, curves[i], {
      x: padding + col * (panelWidth + gap),
      y: padding + row * (panelHeight + gap),
      width: panelWidth,
      height: panelHeight
    });
  }

  statusElement.textContent = "Iscrtane su 4 krive sa ukupno " + totalPoints + " adaptivno generisanih tacaka.";
}

if (typeof module !== "undefined") {
  module.exports = { GenerateCurvePoints_Adaptive };
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
