function distanceSquared(A, B) {
  const dx = A.x - B.x;
  const dy = A.y - B.y;
  return dx * dx + dy * dy;
}

function betterPair(current, candidate) {
  return candidate.d2 < current.d2 ? candidate : current;
}

function compareByX(A, B) {
  return A.x - B.x || A.y - B.y;
}

function compareByY(A, B) {
  return A.y - B.y || A.x - B.x;
}

function closestByBruteForce(points, begin, end) {
  let best = { d2: Infinity, U: null, V: null };

  for (let i = begin; i < end; i++) {
    for (let j = i + 1; j < end; j++) {
      best = betterPair(best, {
        d2: distanceSquared(points[i], points[j]),
        U: points[i],
        V: points[j]
      });
    }
  }

  return best;
}

function sortSmallRangeByY(source, target, begin, end) {
  for (let i = begin; i < end; i++) {
    target[i] = source[i];
  }

  for (let i = begin + 1; i < end; i++) {
    const point = target[i];
    let j = i - 1;

    while (j >= begin && compareByY(target[j], point) > 0) {
      target[j + 1] = target[j];
      j--;
    }

    target[j + 1] = point;
  }
}

function mergeByY(source, target, begin, middle, end) {
  let i = begin;
  let j = middle;
  let k = begin;

  while (i < middle && j < end) {
    if (compareByY(source[i], source[j]) <= 0) {
      target[k] = source[i];
      i++;
    } else {
      target[k] = source[j];
      j++;
    }

    k++;
  }

  while (i < middle) {
    target[k] = source[i];
    i++;
    k++;
  }

  while (j < end) {
    target[k] = source[j];
    j++;
    k++;
  }
}

function closestPairRecursive(source, target, begin, end, recentIndexes) {
  if (end - begin <= 1) {
    if (end > begin) target[begin] = source[begin];
    return { d2: Infinity, U: source[begin] || null, V: source[begin] || null };
  }

  if (end - begin <= 3) {
    const best = closestByBruteForce(source, begin, end);
    sortSmallRangeByY(source, target, begin, end);
    return best;
  }

  const middle = Math.floor((begin + end) / 2);
  const dividerX = (source[middle - 1].x + source[middle].x) / 2;
  const leftBest = closestPairRecursive(target, source, begin, middle, recentIndexes);
  const rightBest = closestPairRecursive(target, source, middle, end, recentIndexes);
  let best = betterPair(leftBest, rightBest);

  mergeByY(source, target, begin, middle, end);

  let count = 0;

  for (let k = begin; k < end; k++) {
    const point = target[k];
    const dx = point.x - dividerX;

    if (dx * dx < best.d2) {
      const comparisons = Math.min(count, recentIndexes.length);

      for (let i = 1; i <= comparisons; i++) {
        const previousIndex = recentIndexes[(count - i + recentIndexes.length) % recentIndexes.length];
        const previous = target[previousIndex];
        const dy = point.y - previous.y;
        if (dy * dy >= best.d2) break;

        best = betterPair(best, {
          d2: distanceSquared(point, previous),
          U: point,
          V: previous
        });
      }

      recentIndexes[count % recentIndexes.length] = k;
      count++;
    }
  }

  return best;
}

function ClosestPointPair_VeryFast(P) {
  if (P.length < 2) {
    return { d: Infinity, U: null, V: null };
  }

  const source = P.slice().sort(compareByX);
  const target = source.slice();
  const recentIndexes = new Array(4);
  const best = closestPairRecursive(source, target, 0, source.length, recentIndexes);

  return {
    d: Math.sqrt(best.d2),
    U: best.U,
    V: best.V
  };
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePoints(canvas) {
  const margin = 24;
  const count = randomInteger(50, 100);
  const points = [];

  for (let i = 0; i < count; i++) {
    points.push({
      x: randomInteger(margin, canvas.width - margin),
      y: randomInteger(margin, canvas.height - margin)
    });
  }

  return points;
}

function drawPoint(ctx, point, radius, color) {
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawScene(ctx, points, closestPair) {
  const canvas = ctx.canvas;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const point of points) {
    drawPoint(ctx, point, 4, "#25364a");
  }

  if (closestPair.U && closestPair.V) {
    ctx.beginPath();
    ctx.moveTo(closestPair.U.x, closestPair.U.y);
    ctx.lineTo(closestPair.V.x, closestPair.V.y);
    ctx.strokeStyle = "#d62828";
    ctx.lineWidth = 3;
    ctx.stroke();

    drawPoint(ctx, closestPair.U, 7, "#d62828");
    drawPoint(ctx, closestPair.V, 7, "#d62828");
  }
}

function runDemo(canvas, ctx, statusElement) {
  const points = generatePoints(canvas);
  const closestPair = ClosestPointPair_VeryFast(points);

  drawScene(ctx, points, closestPair);
  statusElement.textContent = `Broj tacaka: ${points.length}. Najkrace rastojanje: ${closestPair.d.toFixed(2)}.`;
}

if (typeof module !== "undefined") {
  module.exports = { ClosestPointPair_VeryFast };
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
