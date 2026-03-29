const canvas_main = document.getElementById("ctx-mouseClick");
const ctx_main = canvas_main.getContext("2d");

const canvas_import = document.getElementById("ctx-import");
const ctx_import = canvas_import.getContext("2d");

const btn_clearCanvas = document.getElementById("btn-clearCanvas");
const btn_importLines = document.getElementById("btn-importLines");
const btn_importVertices = document.getElementById("btn-importVertices");

const vertices = []
const import_vertices = []
const import_lines = []

canvas_main.addEventListener("click", function(event){
   const rect = canvas_main.getBoundingClientRect();

   const x = event.clientX - rect.left;
   const y = event.clientY - rect.top;

   vertices.push({x: x, y: y});
   drawVertex(canvas_main, ctx_main, vertices);
});

function drawVertex(canvas, ctx, vertices){
    clearCanvas(canvas, ctx);

    for(const v of vertices){
        ctx.beginPath();
        ctx.arc(v.x, v.y, 4, 0, 2 * Math.PI, false);
        ctx.fill();
    }
}

function drawLines(canvas, ctx, lines) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const line of lines) {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
    }
}

function clearCanvas(canvas, ctx){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

btn_clearCanvas.addEventListener("click", function(event){
    vertices.length = 0;
    clearCanvas(canvas_main, ctx_main);
});

function importPointsFromFile(path) {
    fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error("Greska!");
            }
            return response.text();
        })
        .then(text => {
            const rows = text.trim().split("\n");

            for (const row of rows) {
                const parts = row.trim().split(",");

                if (parts.length !== 2) continue;

                const x = parseFloat(parts[0]);
                const y = parseFloat(parts[1]);

                if (isNaN(x) || isNaN(y)) continue;

                import_vertices.push({ x: x, y: y });
            }

            drawVertex(canvas_import, ctx_import, import_vertices);
        })
        .catch(error => console.error("Greska: ", error));
}

function importLinesFromFile(path) {
    fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error("Greska!");
            }
            return response.text();
        })
        .then(text => {
            const rows = text.trim().split("\n");

            for (const row of rows) {
                const parts = row.trim().split(",");

                if (parts.length !== 4) continue;

                const x1 = parseFloat(parts[0]);
                const y1 = parseFloat(parts[1]);
                const x2 = parseFloat(parts[2]);
                const y2 = parseFloat(parts[3]);

                if ([x1, y1, x2, y2].some(value => isNaN(value))) continue;

                import_lines.push({ x1, y1, x2, y2 });
            }

            drawLines(canvas_import, ctx_import, import_lines);
        })
        .catch(error => console.error("Greska: ", error));
}

btn_importVertices.addEventListener("click", function(event) {
    import_vertices.length = 0;
    clearCanvas(canvas_import, ctx_import);
    importPointsFromFile("resources/points.txt");
});

btn_importLines.addEventListener("click", function(event) {
    import_lines.length = 0;
    clearCanvas(canvas_import, ctx_import);
    importLinesFromFile("resources/lines.txt");
})
