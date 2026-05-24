const EPSILON = 0.000001;
const POINT_RADIUS = 5;

var points = [];
var segments = [];

function syncGlobalArrays() {
  if (typeof window !== "undefined") {
    window.points = points;
    window.segments = segments;
  }
}

function makePoint(x, y) {
  return { x: x, y: y };
}

function makeSegment(firstIndex, secondIndex, inputPoints) {
  return {
    firstIndex: firstIndex,
    secondIndex: secondIndex,
    a: inputPoints[firstIndex],
    b: inputPoints[secondIndex]
  };
}

function distanceSquared(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function triangleAreaTwice(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function getCircumcircle(a, b, c) {
  const d = 2 * (
    a.x * (b.y - c.y) +
    b.x * (c.y - a.y) +
    c.x * (a.y - b.y)
  );

  if (Math.abs(d) <= EPSILON) {
    return null;
  }

  const aLength = a.x * a.x + a.y * a.y;
  const bLength = b.x * b.x + b.y * b.y;
  const cLength = c.x * c.x + c.y * c.y;
  const x = (
    aLength * (b.y - c.y) +
    bLength * (c.y - a.y) +
    cLength * (a.y - b.y)
  ) / d;
  const y = (
    aLength * (c.x - b.x) +
    bLength * (a.x - c.x) +
    cLength * (b.x - a.x)
  ) / d;
  const center = makePoint(x, y);

  return {
    center: center,
    radiusSquared: distanceSquared(center, a)
  };
}

function addUniqueSegment(result, firstIndex, secondIndex, inputPoints) {
  const a = Math.min(firstIndex, secondIndex);
  const b = Math.max(firstIndex, secondIndex);

  for (const segment of result) {
    if (segment.firstIndex === a && segment.secondIndex === b) {
      return;
    }
  }

  result.push(makeSegment(a, b, inputPoints));
}

function isPointInsideCircle(point, circle) {
  return distanceSquared(point, circle.center) < circle.radiusSquared - EPSILON;
}

function delaunayTriangulation(inputPoints) {
  const result = [];

  for (let i = 0; i < inputPoints.length - 2; i++) {
    for (let j = i + 1; j < inputPoints.length - 1; j++) {
      for (let k = j + 1; k < inputPoints.length; k++) {
        if (Math.abs(triangleAreaTwice(inputPoints[i], inputPoints[j], inputPoints[k])) <= EPSILON) {
          continue;
        }

        const circle = getCircumcircle(inputPoints[i], inputPoints[j], inputPoints[k]);
        let validTriangle = circle !== null;

        for (let m = 0; m < inputPoints.length && validTriangle; m++) {
          if (m !== i && m !== j && m !== k && isPointInsideCircle(inputPoints[m], circle)) {
            validTriangle = false;
          }
        }

        if (validTriangle) {
          addUniqueSegment(result, i, j, inputPoints);
          addUniqueSegment(result, i, k, inputPoints);
          addUniqueSegment(result, j, k, inputPoints);
        }
      }
    }
  }

  return result;
}

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawSegment(ctx, segment) {
  ctx.strokeStyle = "#146c94";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(segment.a.x, segment.a.y);
  ctx.lineTo(segment.b.x, segment.b.y);
  ctx.stroke();
}

function drawPoint(ctx, point) {
  ctx.fillStyle = "#c62828";
  ctx.beginPath();
  ctx.arc(point.x, point.y, POINT_RADIUS, 0, 2 * Math.PI);
  ctx.fill();
}

function drawScene(ctx) {
  clearCanvas(ctx);

  for (const segment of segments) {
    drawSegment(ctx, segment);
  }

  for (const point of points) {
    drawPoint(ctx, point);
  }
}

function updateStatus(statusElement) {
  statusElement.textContent = "Tacke: " + points.length + " | Duzi: " + segments.length;
}

function getCanvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return makePoint(
    (event.clientX - rect.left) * scaleX,
    (event.clientY - rect.top) * scaleY
  );
}

function hasNearbyPoint(point) {
  for (const existingPoint of points) {
    if (distanceSquared(point, existingPoint) <= POINT_RADIUS * POINT_RADIUS * 4) {
      return true;
    }
  }

  return false;
}

function addPoint(canvas, ctx, statusElement, event) {
  const point = getCanvasPoint(canvas, event);

  if (!hasNearbyPoint(point)) {
    points.push(point);
    segments = [];
    drawScene(ctx);
    updateStatus(statusElement);
    syncGlobalArrays();
  }
}

function triangulate(ctx, statusElement) {
  segments = delaunayTriangulation(points);
  drawScene(ctx);
  updateStatus(statusElement);
  syncGlobalArrays();
  console.log("Delaunay triangulacija");
  console.log("Broj tacaka: " + points.length);
  console.log("Broj duzi: " + segments.length);
  console.table(segments);
}

function clearAll(ctx, statusElement) {
  points = [];
  segments = [];
  drawScene(ctx);
  updateStatus(statusElement);
  syncGlobalArrays();
}

if (typeof module !== "undefined") {
  module.exports = {
    delaunayTriangulation: delaunayTriangulation,
    getCircumcircle: getCircumcircle,
    triangleAreaTwice: triangleAreaTwice,
    distanceSquared: distanceSquared
  };
}

if (typeof document !== "undefined") {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const statusElement = document.getElementById("status");
  const clearButton = document.getElementById("clearButton");

  clearCanvas(ctx);
  syncGlobalArrays();

  canvas.addEventListener("click", function(event) {
    addPoint(canvas, ctx, statusElement, event);
  });

  document.addEventListener("keydown", function(event) {
    if (event.key.toLowerCase() === "t") {
      triangulate(ctx, statusElement);
    }
  });

  clearButton.addEventListener("click", function() {
    clearAll(ctx, statusElement);
  });
}
