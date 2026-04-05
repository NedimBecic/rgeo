const canvas_main = document.getElementById("ctx-mouseClick");
const ctx_main = canvas_main.getContext("2d");

const btn_clearCanvas = document.getElementById("btn-clearCanvas");
const btn_generatePolygon = document.getElementById("btn-generatePolygon");
const polygon_message = document.getElementById("polygon-message");

const vertices = [];
const polygon_vertices = [];
const checked_points = [];

let generatedPolygon = false;

canvas_main.addEventListener("click", function(event) {
    const rect = canvas_main.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const point = { x, y };

    if (!generatedPolygon) {
        vertices.push(point);
        setMessage("Dodaj jos tacaka ili generisi poligon.");
        drawScene();
        return;
    }

    const isInside = checkIfVertexInsidePolygon(point, polygon_vertices);
    checked_points.push({ ...point, isInside });

    if (isInside) {
        setMessage("Novo kliknuta tacka je u poligonu.");
    } else {
        setMessage("Novo kliknuta tacka nije u poligonu.");
    }

    drawScene();
});

function clearCanvas(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function setMessage(message) {
    polygon_message.textContent = message;
}

function drawPoint(ctx, point, color = "#000000") {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI, false);
    ctx.fill();
}

function drawPolygon(ctx, polygon) {
    ctx.beginPath();
    ctx.moveTo(polygon[0].x, polygon[0].y);

    for (let i = 1; i < polygon.length; i++) {
        ctx.lineTo(polygon[i].x, polygon[i].y);
    }

    ctx.closePath();
    ctx.stroke();
}

function drawScene() {
    clearCanvas(canvas_main, ctx_main);

    if (generatedPolygon && polygon_vertices.length > 0) {
        drawPolygon(ctx_main, polygon_vertices);

        for (const vertex of polygon_vertices) {
            drawPoint(ctx_main, vertex);
        }
    } else {
        for (const vertex of vertices) {
            drawPoint(ctx_main, vertex);
        }
    }

    for (const point of checked_points) {
        const color = point.isInside ? "green" : "red";
        drawPoint(ctx_main, point, color);
    }
}

btn_clearCanvas.addEventListener("click", function() {
    vertices.length = 0;
    polygon_vertices.length = 0;
    checked_points.length = 0;
    generatedPolygon = false;
    setMessage("");
    clearCanvas(canvas_main, ctx_main);
});

function crossProduct(a, b, c) {
    return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

function createPolygon(vertices) {
    const sorted = [...vertices].sort((p1, p2) => {
        if (p1.x !== p2.x) return p1.x - p2.x;
        return p1.y - p2.y;
    });

    const left = sorted[0];
    const right = sorted[sorted.length - 1];

    const upper = [];
    const lower = [];

    for (let i = 1; i < sorted.length - 1; i++) {
        const point = sorted[i];
        const direction = crossProduct(left, right, point);

        if (direction >= 0) {
            upper.push(point);
        } else {
            lower.push(point);
        }
    }

    return [
        left,
        ...upper,
        right,
        ...lower.reverse()
    ];
}

function isPointOnSegment(point, start, end) {
    const epsilon = 0.000001;
    const isCollinear = Math.abs(crossProduct(start, end, point)) < epsilon;

    if (!isCollinear) return false;

    return (
        point.x >= Math.min(start.x, end.x) - epsilon &&
        point.x <= Math.max(start.x, end.x) + epsilon &&
        point.y >= Math.min(start.y, end.y) - epsilon &&
        point.y <= Math.max(start.y, end.y) + epsilon
    );
}

function checkIfVertexInsidePolygon(point, polygon) {
    let isInside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i++) {
        const current = polygon[i];
        const previous = polygon[j];

        if (isPointOnSegment(point, previous, current)) {
            return true;
        }

        const intersects =
            (current.y > point.y) !== (previous.y > point.y) &&
            point.x < ((previous.x - current.x) * (point.y - current.y)) / (previous.y - current.y) + current.x;

        if (intersects) {
            isInside = !isInside;
        }
    }

    return isInside;
}

btn_generatePolygon.addEventListener("click", function() {
    if (vertices.length < 3) {
        setMessage("Potrebno je najmanje 3 tacke za generisanje poligona.");
        return;
    }

    polygon_vertices.length = 0;
    polygon_vertices.push(...createPolygon(vertices));
    checked_points.length = 0;
    generatedPolygon = true;

    setMessage("Poligon je generisan. Klikni novu tacku za provjeru.");
    drawScene();
});
