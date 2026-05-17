const EPSILON = 0.000001;
const HORIZONTAL_COUNT = 9;
const VERTICAL_COUNT = 9;
const RANDOM_COUNT = 12;

var horizontalSegments = [];
var verticalSegments = [];
var randomSegments = [];
var intersectionPoints = [];

function syncGlobalArrays() {
  if (typeof window !== "undefined") {
    window.horizontalSegments = horizontalSegments;
    window.verticalSegments = verticalSegments;
    window.randomSegments = randomSegments;
    window.intersectionPoints = intersectionPoints;
  }
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makePoint(x, y) {
  return { x: x, y: y };
}

function makeSegment(a, b, name) {
  return {
    a: a,
    b: b,
    name: name,
    intersects: false
  };
}

function resetSegments(segments) {
  for (const segment of segments) {
    segment.intersects = false;
  }
}

function normalizeInterval(a, b) {
  return {
    min: Math.min(a, b),
    max: Math.max(a, b)
  };
}

function isBetween(value, a, b) {
  const interval = normalizeInterval(a, b);
  return value >= interval.min - EPSILON && value <= interval.max + EPSILON;
}

function roundCoordinate(value) {
  return Math.round(value * 100) / 100;
}

function cross(a, b, c) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function isPointOnSegment(point, segment) {
  return Math.abs(cross(segment.a, segment.b, point)) <= EPSILON &&
    isBetween(point.x, segment.a.x, segment.b.x) &&
    isBetween(point.y, segment.a.y, segment.b.y);
}

function horizontalVerticalIntersection(horizontal, vertical) {
  const x = vertical.a.x;
  const y = horizontal.a.y;

  if (
    isBetween(x, horizontal.a.x, horizontal.b.x) &&
    isBetween(y, vertical.a.y, vertical.b.y)
  ) {
    return makePoint(x, y);
  }

  return null;
}

function lineSegmentsIntersection(first, second) {
  const p = first.a;
  const p2 = first.b;
  const q = second.a;
  const q2 = second.b;
  const d1 = cross(p, p2, q);
  const d2 = cross(p, p2, q2);
  const d3 = cross(q, q2, p);
  const d4 = cross(q, q2, p2);

  if (
    Math.max(Math.min(p.x, p2.x), Math.min(q.x, q2.x)) >
      Math.min(Math.max(p.x, p2.x), Math.max(q.x, q2.x)) + EPSILON ||
    Math.max(Math.min(p.y, p2.y), Math.min(q.y, q2.y)) >
      Math.min(Math.max(p.y, p2.y), Math.max(q.y, q2.y)) + EPSILON
  ) {
    return null;
  }

  if (Math.abs(d1) <= EPSILON && isPointOnSegment(q, first)) {
    return makePoint(q.x, q.y);
  }

  if (Math.abs(d2) <= EPSILON && isPointOnSegment(q2, first)) {
    return makePoint(q2.x, q2.y);
  }

  if (Math.abs(d3) <= EPSILON && isPointOnSegment(p, second)) {
    return makePoint(p.x, p.y);
  }

  if (Math.abs(d4) <= EPSILON && isPointOnSegment(p2, second)) {
    return makePoint(p2.x, p2.y);
  }

  if (d1 * d2 > EPSILON || d3 * d4 > EPSILON) {
    return null;
  }

  const denominator = (p.x - p2.x) * (q.y - q2.y) -
    (p.y - p2.y) * (q.x - q2.x);

  if (Math.abs(denominator) <= EPSILON) {
    return null;
  }

  const firstLine = p.x * p2.y - p.y * p2.x;
  const secondLine = q.x * q2.y - q.y * q2.x;
  const x = (firstLine * (q.x - q2.x) - (p.x - p2.x) * secondLine) /
    denominator;
  const y = (firstLine * (q.y - q2.y) - (p.y - p2.y) * secondLine) /
    denominator;

  return makePoint(roundCoordinate(x), roundCoordinate(y));
}

function addIntersection(result, point, first, second) {
  first.intersects = true;
  second.intersects = true;
  result.push({
    x: roundCoordinate(point.x),
    y: roundCoordinate(point.y),
    first: first.name,
    second: second.name
  });
}

function generateHorizontalSegments(canvas, count) {
  const segments = [];
  const margin = 38;

  for (let i = 0; i < count; i++) {
    const length = randomInteger(190, 370);
    const x = randomInteger(margin, canvas.width - margin - length);
    const y = randomInteger(margin, canvas.height - margin);
    segments.push(makeSegment(
      makePoint(x, y),
      makePoint(x + length, y),
      "H" + (i + 1)
    ));
  }

  return segments;
}

function generateVerticalSegments(canvas, count) {
  const segments = [];
  const margin = 38;

  for (let i = 0; i < count; i++) {
    const length = randomInteger(140, 300);
    const x = randomInteger(margin, canvas.width - margin);
    const y = randomInteger(margin, canvas.height - margin - length);
    segments.push(makeSegment(
      makePoint(x, y),
      makePoint(x, y + length),
      "V" + (i + 1)
    ));
  }

  return segments;
}

function generateRandomSegments(canvas, count) {
  const segments = [];
  const margin = 42;

  while (segments.length < count) {
    const a = makePoint(
      randomInteger(margin, canvas.width - margin),
      randomInteger(margin, canvas.height - margin)
    );
    const b = makePoint(
      randomInteger(margin, canvas.width - margin),
      randomInteger(margin, canvas.height - margin)
    );
    const dx = a.x - b.x;
    const dy = a.y - b.y;

    if (Math.sqrt(dx * dx + dy * dy) >= 110) {
      segments.push(makeSegment(a, b, "S" + (segments.length + 1)));
    }
  }

  return segments;
}

function findHorizontalVerticalIntersections(horizontal, vertical) {
  const result = [];
  resetSegments(horizontal);
  resetSegments(vertical);

  for (const hSegment of horizontal) {
    for (const vSegment of vertical) {
      const point = horizontalVerticalIntersection(hSegment, vSegment);

      if (point !== null) {
        addIntersection(result, point, hSegment, vSegment);
      }
    }
  }

  return result;
}

function findLineSegmentIntersections(segments) {
  const result = [];
  resetSegments(segments);

  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const point = lineSegmentsIntersection(segments[i], segments[j]);

      if (point !== null) {
        addIntersection(result, point, segments[i], segments[j]);
      }
    }
  }

  return result;
}

function drawSegment(ctx, segment) {
  ctx.strokeStyle = segment.intersects ? "#2e7d32" : "#263238";
  ctx.lineWidth = segment.intersects ? 4 : 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(segment.a.x, segment.a.y);
  ctx.lineTo(segment.b.x, segment.b.y);
  ctx.stroke();
}

function drawIntersection(ctx, point) {
  ctx.fillStyle = "#c62828";
  ctx.beginPath();
  ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
  ctx.fill();
}

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawScene(ctx, segments, intersections) {
  clearCanvas(ctx);

  for (const segment of segments) {
    drawSegment(ctx, segment);
  }

  for (const point of intersections) {
    drawIntersection(ctx, point);
  }
}

function logIntersections(title, intersections) {
  console.log(title);
  console.log("Broj presjeka: " + intersections.length);
  console.table(intersections);
}

function runHorizontalVerticalDemo(canvas, ctx, statusElement) {
  let attempts = 0;

  do {
    horizontalSegments = generateHorizontalSegments(canvas, HORIZONTAL_COUNT);
    verticalSegments = generateVerticalSegments(canvas, VERTICAL_COUNT);
    intersectionPoints = findHorizontalVerticalIntersections(
      horizontalSegments,
      verticalSegments
    );
    attempts++;
  } while (intersectionPoints.length === 0 && attempts < 50);

  drawScene(ctx, horizontalSegments.concat(verticalSegments), intersectionPoints);
  syncGlobalArrays();
  logIntersections("Presjeci horizontalnih i vertikalnih duzi", intersectionPoints);

  statusElement.textContent = "Generisano je " + HORIZONTAL_COUNT +
    " horizontalnih i " + VERTICAL_COUNT + " vertikalnih duzi. Broj presjeka: " +
    intersectionPoints.length + ".";
}

function runRandomSegmentDemo(canvas, ctx, statusElement) {
  let attempts = 0;

  do {
    randomSegments = generateRandomSegments(canvas, RANDOM_COUNT);
    intersectionPoints = findLineSegmentIntersections(randomSegments);
    attempts++;
  } while (intersectionPoints.length === 0 && attempts < 50);

  drawScene(ctx, randomSegments, intersectionPoints);
  syncGlobalArrays();
  logIntersections("Presjeci proizvoljnih duzi", intersectionPoints);

  statusElement.textContent = "Generisano je " + RANDOM_COUNT +
    " proizvoljnih duzi. Broj presjeka: " + intersectionPoints.length + ".";
}

if (typeof module !== "undefined") {
  module.exports = {
    horizontalVerticalIntersection: horizontalVerticalIntersection,
    lineSegmentsIntersection: lineSegmentsIntersection,
    findHorizontalVerticalIntersections: findHorizontalVerticalIntersections,
    findLineSegmentIntersections: findLineSegmentIntersections,
    generateHorizontalSegments: generateHorizontalSegments,
    generateVerticalSegments: generateVerticalSegments,
    generateRandomSegments: generateRandomSegments,
    isPointOnSegment: isPointOnSegment
  };
}

if (typeof document !== "undefined") {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  const statusElement = document.getElementById("status");
  const axisButton = document.getElementById("axisButton");
  const randomButton = document.getElementById("randomButton");

  clearCanvas(ctx);
  syncGlobalArrays();

  axisButton.addEventListener("click", function() {
    runHorizontalVerticalDemo(canvas, ctx, statusElement);
  });

  randomButton.addEventListener("click", function() {
    runRandomSegmentDemo(canvas, ctx, statusElement);
  });
}
