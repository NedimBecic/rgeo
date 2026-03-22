const canvasLine = document.getElementById("ctx-line");
const ctxLine = canvasLine.getContext("2d");

const canvasRect = document.getElementById("ctx-rect");
const ctxRect = canvasRect.getContext("2d");

const canvasCircle = document.getElementById("ctx-circle");
const ctxCircle = canvasCircle.getContext("2d");

function drawNetUsingLines(ctx, m, n) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const margin = 20;
    const dx = (width - 2 * margin) / (m - 1);
    const dy = (height - 2 * margin) / (n - 1);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            const x = margin + i * dx;
            const y = margin + j * dy;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 1, y);
            ctx.stroke();
        }
    }
}

function drawNetUsingRectangles(ctx, m, n) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const margin = 20;
    const dx = (width - 2 * margin) / (m - 1);
    const dy = (height - 2 * margin) / (n - 1);

    ctx.fillStyle = "red";

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            const x = margin + i * dx;
            const y = margin + j * dy;

            ctx.fillRect(x, y, 1, 1);
        }
    }
}

function drawNetUsingCircles(ctx, m, n) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const margin = 20;
    const dx = (width - 2 * margin) / (m - 1);
    const dy = (height - 2 * margin) / (n - 1);

    ctx.fillStyle = "red";

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            const x = margin + i * dx;
            const y = margin + j * dy;

            ctx.beginPath();
            ctx.arc(x, y, 0.5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
}

const canvasSquare = document.getElementById("ctx-square");
const ctxSquare = canvasSquare.getContext("2d");

function drawLine(ctx, x1, y1, x2, y2, colour) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = colour;
    ctx.stroke();
}

function drawSquare(ctx, x, y, d) {
    drawLine(ctx, x, y, x + d, y, "red");
    drawLine(ctx, x + d, y, x + d, y + d, "yellow");
    drawLine(ctx, x + d, y + d, x, y + d, "green");
    drawLine(ctx, x, y + d, x, y, "blue");
}

const canvasQuad = document.getElementById("ctx-quad");
const ctxQuad = canvasQuad.getContext("2d");

function drawTriangle(ctx, x1, y1, x2, y2, x3, y3, colour) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();

    ctx.fillStyle = colour;
    ctx.fill();

    ctx.strokeStyle = "black";
    ctx.stroke();
}

function drawQuad(ctx, x, y, d) {
    drawTriangle(ctx, x, y, x, y + d, x + d, y + d, "red");
    drawTriangle(ctx, x, y, x + d, y, x + d, y + d, "blue");
}

const canvasTriangleStrip = document.getElementById("ctx-triangleStrip");
const ctxTriangleStrip = canvasTriangleStrip.getContext("2d");

function drawTriangleStrip(ctx, x, y, d) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    for (let i = 0; i < width / d; i++) {
        for (let j = 0; j < height / d; j++) {
            drawQuad(ctx, x + i * d, y + j * d, d);
        }
    }
}

const canvasTriangleFan = document.getElementById("ctx-triangleFan");
const ctxTriangleFan = canvasTriangleFan.getContext("2d");

function drawTriangleFan(ctx, x, y, n) {
    const r = 50;

    for (let i = 0; i < n; i++) {
        const angle1 = (2 * Math.PI * i) / n;
        const angle2 = (2 * Math.PI * (i + 1)) / n;

        const x1 = x + r * Math.cos(angle1);
        const y1 = y + r * Math.sin(angle1);

        const x2 = x + r * Math.cos(angle2);
        const y2 = y + r * Math.sin(angle2);

        const colour = i % 2 === 0 ? "lightgray" : "white";

        drawTriangle(ctx, x, y, x1, y1, x2, y2, colour);
    }

    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.strokeStyle = "red";
    ctx.stroke();
}

drawNetUsingLines(ctxLine, 10, 10);
drawNetUsingRectangles(ctxRect, 10, 10);
drawNetUsingCircles(ctxCircle, 10, 10);
drawSquare(ctxSquare, 0, 0, 100);
drawQuad(ctxQuad, 0, 0, 100);
drawTriangleStrip(ctxTriangleStrip, 0, 0, 30);
drawTriangleFan(ctxTriangleFan, 150, 75, 16);