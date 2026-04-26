const rect_bounds = {
    xMin: 100,
    xMax: 300,
    yMin: 100,
    yMax: 250
};

const canvas_cohenSutherland = document.getElementById("ctx-cohenSutherland");
const ctx_cohenSutherland = canvas_cohenSutherland.getContext("2d");
const btn_generateCohenSutherland = document.getElementById("btn-generateCohenSutherland");

const canvas_liangBarsky = document.getElementById("ctx-liangBarsky");
const ctx_liangBarsky = canvas_liangBarsky.getContext("2d");
const btn_generateLiangBarsky = document.getElementById("btn-generateLiangBarsky");

const canvas_sutherlandHodgman = document.getElementById("ctx-sutherlandHodgman");
const ctx_sutherlandHodgman = canvas_sutherlandHodgman.getContext("2d");
const btn_clearPolygon = document.getElementById("btn-clearPolygon");

const canvas_bresenhamLine = document.getElementById("ctx-bresenhamLine");
const ctx_bresenhamLine = canvas_bresenhamLine.getContext("2d");

const canvas_bresenhamCircle = document.getElementById("ctx-bresenhamCircle");
const ctx_bresenhamCircle = canvas_bresenhamCircle.getContext("2d");

const canvas_wuLine = document.getElementById("ctx-wuLine");
const ctx_wuLine = canvas_wuLine.getContext("2d");

const polygon_vertices = [];
let polygon_closed = false;
let clipped_polygon = [];
let pending_click = null;

function clearCanvas(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawClippingRectangle(ctx) {
    ctx.strokeStyle = "red";
    ctx.strokeRect(
        rect_bounds.xMin,
        rect_bounds.yMin,
        rect_bounds.xMax - rect_bounds.xMin,
        rect_bounds.yMax - rect_bounds.yMin
    );
    ctx.strokeStyle = "black";
}

function drawLine(ctx, line, color = "black") {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(line.end.x, line.end.y);
    ctx.stroke();
    ctx.strokeStyle = "black";
}

function generateLines() {
    const lines = [];

    for (let i = 0; i < 50; i++) {
        lines.push({
            start: {
                x: Math.random() * 450,
                y: Math.random() * 350
            },
            end: {
                x: Math.random() * 450,
                y: Math.random() * 350
            }
        });
    }

    return lines;
}

function drawClippedLines(canvas, ctx, clippingFunction) {
    clearCanvas(canvas, ctx);
    drawClippingRectangle(ctx);

    const lines = generateLines();

    for (const line of lines) {
        drawLine(ctx, line, "#CCCCCC");
    }

    for (const line of lines) {
        const clipped = clippingFunction(line);

        if (clipped) {
            drawLine(ctx, clipped);
        }
    }
}

function getCohenSutherlandCode(point) {
    let code = 0;

    if (point.x < rect_bounds.xMin) code |= 1;
    if (point.x > rect_bounds.xMax) code |= 2;
    if (point.y < rect_bounds.yMin) code |= 4;
    if (point.y > rect_bounds.yMax) code |= 8;

    return code;
}

function clipLineCohenSutherland(line) {
    let x1 = line.start.x;
    let y1 = line.start.y;
    let x2 = line.end.x;
    let y2 = line.end.y;
    let code1 = getCohenSutherlandCode({ x: x1, y: y1 });
    let code2 = getCohenSutherlandCode({ x: x2, y: y2 });

    while (true) {
        if ((code1 | code2) === 0) {
            return {
                start: { x: x1, y: y1 },
                end: { x: x2, y: y2 }
            };
        }

        if ((code1 & code2) !== 0) {
            return null;
        }

        const code = code1 !== 0 ? code1 : code2;
        let x = 0;
        let y = 0;

        if (code & 8) {
            x = x1 + (x2 - x1) * (rect_bounds.yMax - y1) / (y2 - y1);
            y = rect_bounds.yMax;
        } else if (code & 4) {
            x = x1 + (x2 - x1) * (rect_bounds.yMin - y1) / (y2 - y1);
            y = rect_bounds.yMin;
        } else if (code & 2) {
            y = y1 + (y2 - y1) * (rect_bounds.xMax - x1) / (x2 - x1);
            x = rect_bounds.xMax;
        } else if (code & 1) {
            y = y1 + (y2 - y1) * (rect_bounds.xMin - x1) / (x2 - x1);
            x = rect_bounds.xMin;
        }

        if (code === code1) {
            x1 = x;
            y1 = y;
            code1 = getCohenSutherlandCode({ x: x1, y: y1 });
        } else {
            x2 = x;
            y2 = y;
            code2 = getCohenSutherlandCode({ x: x2, y: y2 });
        }
    }
}

function clipLineLiangBarsky(line) {
    const dx = line.end.x - line.start.x;
    const dy = line.end.y - line.start.y;
    const p = [-dx, dx, -dy, dy];
    const q = [
        line.start.x - rect_bounds.xMin,
        rect_bounds.xMax - line.start.x,
        line.start.y - rect_bounds.yMin,
        rect_bounds.yMax - line.start.y
    ];
    let u1 = 0;
    let u2 = 1;

    for (let i = 0; i < 4; i++) {
        if (p[i] === 0) {
            if (q[i] < 0) return null;
            continue;
        }

        const t = q[i] / p[i];

        if (p[i] < 0) {
            if (t > u2) return null;
            if (t > u1) u1 = t;
        } else {
            if (t < u1) return null;
            if (t < u2) u2 = t;
        }
    }

    return {
        start: {
            x: line.start.x + u1 * dx,
            y: line.start.y + u1 * dy
        },
        end: {
            x: line.start.x + u2 * dx,
            y: line.start.y + u2 * dy
        }
    };
}

function getMousePoint(canvas, event) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function drawPolygonScene() {
    clearCanvas(canvas_sutherlandHodgman, ctx_sutherlandHodgman);
    drawClippingRectangle(ctx_sutherlandHodgman);

    if (polygon_vertices.length > 0 && !polygon_closed) {
        ctx_sutherlandHodgman.beginPath();
        ctx_sutherlandHodgman.moveTo(polygon_vertices[0].x, polygon_vertices[0].y);

        for (let i = 1; i < polygon_vertices.length; i++) {
            ctx_sutherlandHodgman.lineTo(polygon_vertices[i].x, polygon_vertices[i].y);
        }

        ctx_sutherlandHodgman.stroke();
    }

    if (clipped_polygon.length > 0) {
        ctx_sutherlandHodgman.beginPath();
        ctx_sutherlandHodgman.moveTo(clipped_polygon[0].x, clipped_polygon[0].y);

        for (let i = 1; i < clipped_polygon.length; i++) {
            ctx_sutherlandHodgman.lineTo(clipped_polygon[i].x, clipped_polygon[i].y);
        }

        ctx_sutherlandHodgman.closePath();
        ctx_sutherlandHodgman.fillStyle = "black";
        ctx_sutherlandHodgman.fill();
    }
}

function isInsideBoundary(point, boundary) {
    if (boundary === "left") return point.x >= rect_bounds.xMin;
    if (boundary === "right") return point.x <= rect_bounds.xMax;
    if (boundary === "top") return point.y >= rect_bounds.yMin;
    return point.y <= rect_bounds.yMax;
}

function getBoundaryIntersection(start, end, boundary) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;

    if (boundary === "left") {
        const x = rect_bounds.xMin;
        return { x, y: start.y + dy * (x - start.x) / dx };
    }

    if (boundary === "right") {
        const x = rect_bounds.xMax;
        return { x, y: start.y + dy * (x - start.x) / dx };
    }

    if (boundary === "top") {
        const y = rect_bounds.yMin;
        return { x: start.x + dx * (y - start.y) / dy, y };
    }

    const y = rect_bounds.yMax;
    return { x: start.x + dx * (y - start.y) / dy, y };
}

function clipPolygonByBoundary(polygon, boundary) {
    const output = [];

    for (let i = 0; i < polygon.length; i++) {
        const current = polygon[i];
        const previous = polygon[(i + polygon.length - 1) % polygon.length];
        const currentInside = isInsideBoundary(current, boundary);
        const previousInside = isInsideBoundary(previous, boundary);

        if (currentInside) {
            if (!previousInside) {
                output.push(getBoundaryIntersection(previous, current, boundary));
            }

            output.push(current);
        } else if (previousInside) {
            output.push(getBoundaryIntersection(previous, current, boundary));
        }
    }

    return output;
}

function clipPolygonSutherlandHodgman(polygon) {
    let clipped = [...polygon];
    const boundaries = ["left", "right", "top", "bottom"];

    for (const boundary of boundaries) {
        clipped = clipPolygonByBoundary(clipped, boundary);

        if (clipped.length === 0) {
            return [];
        }
    }

    return clipped;
}

function addPolygonVertex(event) {
    if (polygon_closed) return;

    polygon_vertices.push(getMousePoint(canvas_sutherlandHodgman, event));
    drawPolygonScene();
}

function finishPolygon() {
    if (pending_click) {
        clearTimeout(pending_click);
        pending_click = null;
    }

    if (polygon_vertices.length < 3 || polygon_closed) return;

    polygon_closed = true;
    clipped_polygon = clipPolygonSutherlandHodgman(polygon_vertices);
    drawPolygonScene();
}

function resetPolygonTask() {
    if (pending_click) {
        clearTimeout(pending_click);
        pending_click = null;
    }

    polygon_vertices.length = 0;
    clipped_polygon = [];
    polygon_closed = false;
    drawPolygonScene();
}

function drawPixel(ctx, x, y, color = "black") {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
}

function drawBresenhamLine(ctx, x1, y1, x2, y2) {
    let x = Math.round(x1);
    let y = Math.round(y1);
    const endX = Math.round(x2);
    const endY = Math.round(y2);
    const dx = Math.abs(endX - x);
    const dy = Math.abs(endY - y);
    const sx = x < endX ? 1 : -1;
    const sy = y < endY ? 1 : -1;
    let err = dx - dy;

    while (true) {
        drawPixel(ctx, x, y);

        if (x === endX && y === endY) break;

        const e2 = 2 * err;

        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }

        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }
}

function drawBresenhamPattern(ctx) {
    const center = { x: 200, y: 200 };
    const length = 70;

    for (let i = 0; i < 72; i++) {
        const angle = i * Math.PI / 36;
        const x = center.x + length * Math.cos(angle);
        const y = center.y + length * Math.sin(angle);
        drawBresenhamLine(ctx, center.x, center.y, x, y);
    }
}

function drawCirclePoints(ctx, centerX, centerY, x, y) {
    drawPixel(ctx, centerX + x, centerY + y);
    drawPixel(ctx, centerX - x, centerY + y);
    drawPixel(ctx, centerX + x, centerY - y);
    drawPixel(ctx, centerX - x, centerY - y);
    drawPixel(ctx, centerX + y, centerY + x);
    drawPixel(ctx, centerX - y, centerY + x);
    drawPixel(ctx, centerX + y, centerY - x);
    drawPixel(ctx, centerX - y, centerY - x);
}

function drawBresenhamCircle(ctx, centerX, centerY, radius) {
    let x = 0;
    let y = radius;
    let d = 3 - 2 * radius;

    while (x <= y) {
        drawCirclePoints(ctx, centerX, centerY, x, y);

        if (d < 0) {
            d += 4 * x + 6;
        } else {
            d += 4 * (x - y) + 10;
            y--;
        }

        x++;
    }
}

function drawBresenhamCircles(ctx) {
    for (let radius = 5; radius <= 100; radius += 5) {
        drawBresenhamCircle(ctx, 300, 150, radius);
    }
}

function integerPart(value) {
    return Math.floor(value);
}

function roundValue(value) {
    return Math.round(value);
}

function fractionalPart(value) {
    return value - Math.floor(value);
}

function reverseFractionalPart(value) {
    return 1 - fractionalPart(value);
}

function combinePixel(ctx, x, y, graylevel) {
    if (x < 0 || x >= ctx.canvas.width || y < 0 || y >= ctx.canvas.height) return;

    const pixdata = ctx.getImageData(x, y, 1, 1).data;
    const pixc = pixdata[3] === 0 ? 255 : pixdata[0];
    const comblevel = Math.max(graylevel + pixc - 255, 0);
    ctx.fillStyle = "rgb(" + comblevel + "," + comblevel + "," + comblevel + ")";
    ctx.fillRect(x, y, 1, 1);
}

function plotWuPixel(ctx, x, y, brightness, steep) {
    const graylevel = Math.round(255 * (1 - brightness));

    if (steep) {
        combinePixel(ctx, y, x, graylevel);
    } else {
        combinePixel(ctx, x, y, graylevel);
    }
}

function drawWuLine(ctx, x0, y0, x1, y1) {
    let steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);

    if (steep) {
        const oldX0 = x0;
        x0 = y0;
        y0 = oldX0;
        const oldX1 = x1;
        x1 = y1;
        y1 = oldX1;
    }

    if (x0 > x1) {
        const oldX0 = x0;
        x0 = x1;
        x1 = oldX0;
        const oldY0 = y0;
        y0 = y1;
        y1 = oldY0;
    }

    const dx = x1 - x0;
    const dy = y1 - y0;
    const gradient = dx === 0 ? 1 : dy / dx;

    let xEnd = roundValue(x0);
    let yEnd = y0 + gradient * (xEnd - x0);
    let xGap = reverseFractionalPart(x0 + 0.5);
    const xPixel1 = xEnd;
    const yPixel1 = integerPart(yEnd);

    plotWuPixel(ctx, xPixel1, yPixel1, reverseFractionalPart(yEnd) * xGap, steep);
    plotWuPixel(ctx, xPixel1, yPixel1 + 1, fractionalPart(yEnd) * xGap, steep);

    let intery = yEnd + gradient;

    xEnd = roundValue(x1);
    yEnd = y1 + gradient * (xEnd - x1);
    xGap = fractionalPart(x1 + 0.5);
    const xPixel2 = xEnd;
    const yPixel2 = integerPart(yEnd);

    plotWuPixel(ctx, xPixel2, yPixel2, reverseFractionalPart(yEnd) * xGap, steep);
    plotWuPixel(ctx, xPixel2, yPixel2 + 1, fractionalPart(yEnd) * xGap, steep);

    for (let x = xPixel1 + 1; x < xPixel2; x++) {
        plotWuPixel(ctx, x, integerPart(intery), reverseFractionalPart(intery), steep);
        plotWuPixel(ctx, x, integerPart(intery) + 1, fractionalPart(intery), steep);
        intery += gradient;
    }
}

function drawWuPattern(ctx) {
    const center = { x: 200, y: 200 };
    const length = 70;

    for (let i = 0; i < 72; i++) {
        const angle = i * Math.PI / 36;
        const x = center.x + length * Math.cos(angle);
        const y = center.y + length * Math.sin(angle);
        drawWuLine(ctx, center.x, center.y, x, y);
    }
}

canvas_sutherlandHodgman.addEventListener("click", function(event) {
    if (pending_click) clearTimeout(pending_click);

    pending_click = setTimeout(function() {
        pending_click = null;
        addPolygonVertex(event);
    }, 220);
});

canvas_sutherlandHodgman.addEventListener("dblclick", function() {
    finishPolygon();
});

btn_clearPolygon.addEventListener("click", resetPolygonTask);

btn_generateCohenSutherland.addEventListener("click", function() {
    drawClippedLines(canvas_cohenSutherland, ctx_cohenSutherland, clipLineCohenSutherland);
});

btn_generateLiangBarsky.addEventListener("click", function() {
    drawClippedLines(canvas_liangBarsky, ctx_liangBarsky, clipLineLiangBarsky);
});

drawClippedLines(canvas_cohenSutherland, ctx_cohenSutherland, clipLineCohenSutherland);
drawClippedLines(canvas_liangBarsky, ctx_liangBarsky, clipLineLiangBarsky);
drawPolygonScene();
drawBresenhamPattern(ctx_bresenhamLine);
drawBresenhamCircles(ctx_bresenhamCircle);
drawWuPattern(ctx_wuLine);
