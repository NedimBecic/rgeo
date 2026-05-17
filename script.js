const EPSILON = 1e-9;

function cross(A, B, C) {
  return (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
}

function distanceSquared(A, B) {
  const dx = A.x - B.x;
  const dy = A.y - B.y;
  return dx * dx + dy * dy;
}

function areSamePoint(A, B) {
  return Math.abs(A.x - B.x) < EPSILON && Math.abs(A.y - B.y) < EPSILON;
}

function swap(P, i, j) {
  const temp = P[i];
  P[i] = P[j];
  P[j] = temp;
}

function indexOfLexicographicMinimum(P) {
  let best = 0;

  for (let i = 1; i < P.length; i++) {
    if (P[i].x < P[best].x || (P[i].x === P[best].x && P[i].y < P[best].y)) {
      best = i;
    }
  }

  return best;
}

function isBetween(A, B, C) {
  if (Math.abs(cross(A, B, C)) > EPSILON) return false;

  return (
    C.x >= Math.min(A.x, B.x) - EPSILON &&
    C.x <= Math.max(A.x, B.x) + EPSILON &&
    C.y >= Math.min(A.y, B.y) - EPSILON &&
    C.y <= Math.max(A.y, B.y) + EPSILON
  );
}

function chooseNextPoint(P, currentIndex, fixedCount) {
  const current = P[currentIndex];
  let best = -1;

  function testCandidate(index) {
    if (areSamePoint(current, P[index])) return;

    if (best === -1) {
      best = index;
      return;
    }

    const turn = cross(current, P[best], P[index]);

    if (turn < -EPSILON || (Math.abs(turn) <= EPSILON && distanceSquared(current, P[index]) > distanceSquared(current, P[best]))) {
      best = index;
    }
  }

  if (fixedCount > 0) {
    testCandidate(0);
  }

  for (let i = fixedCount + 1; i < P.length; i++) {
    testCandidate(i);
  }

  return best;
}

function moveCollinearPoints(P, currentIndex, endpoint, includeEndpoint) {
  const current = P[currentIndex];
  let hullEnd = currentIndex;

  while (true) {
    let nearest = -1;
    let nearestDistance = Infinity;

    for (let i = hullEnd + 1; i < P.length; i++) {
      const distance = distanceSquared(current, P[i]);

      if (distance > EPSILON && isBetween(current, endpoint, P[i]) && distance < nearestDistance) {
        nearest = i;
        nearestDistance = distance;
      }
    }

    if (nearest === -1) break;
    if (!includeEndpoint && areSamePoint(P[nearest], endpoint)) break;

    hullEnd++;
    swap(P, hullEnd, nearest);

    if (includeEndpoint && areSamePoint(P[hullEnd], endpoint)) break;
  }

  return hullEnd;
}

function ConvexHull_GiftWrapping(P) {
  if (P.length < 3) {
    return { V: P };
  }

  swap(P, 0, indexOfLexicographicMinimum(P));

  let hullEnd = 0;

  while (hullEnd < P.length) {
    const nextIndex = chooseNextPoint(P, hullEnd, hullEnd);

    if (nextIndex === -1 || nextIndex === 0) {
      hullEnd = moveCollinearPoints(P, hullEnd, P[0], false);
      P.length = hullEnd + 1;
      return { V: P };
    }

    const endpoint = P[nextIndex];
    hullEnd = moveCollinearPoints(P, hullEnd, endpoint, true);
  }

  return { V: P };
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePoints(canvas) {
  const points = [];
  const used = new Set();
  const margin = 34;
  const count = randomInteger(50, 100);

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

function drawPoint(ctx, point, radius, color) {
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawHull(ctx, hull) {
  if (hull.length < 2) return;

  ctx.beginPath();
  ctx.moveTo(hull[0].x, hull[0].y);

  for (let i = 1; i < hull.length; i++) {
    ctx.lineTo(hull[i].x, hull[i].y);
  }

  ctx.closePath();
  ctx.fillStyle = "rgba(20, 108, 148, 0.11)";
  ctx.fill();
  ctx.strokeStyle = "#146c94";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.stroke();
}

function drawScene(ctx, points, hull) {
  const canvas = ctx.canvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawHull(ctx, hull);

  for (const point of points) {
    drawPoint(ctx, point, 4, "#26384f");
  }

  for (const point of hull) {
    drawPoint(ctx, point, 7, "#d62828");
  }
}

function runDemo(canvas, ctx, statusElement) {
  const points = generatePoints(canvas);
  const hullInput = points.slice();
  const hull = ConvexHull_GiftWrapping(hullInput).V;

  drawScene(ctx, points, hull);
  statusElement.textContent = "Broj tacaka: " + points.length + ". Broj tacaka na omotacu: " + hull.length + ".";
}

if (typeof module !== "undefined") {
  module.exports = { ConvexHull_GiftWrapping };
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
