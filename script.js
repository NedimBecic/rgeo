const canvas_convexHull = document.getElementById("ctx-convexHull");
const ctx_convexHull = canvas_convexHull.getContext("2d");

const btn_generateBruteForceTriangles = document.getElementById("btn-generateBruteForceTriangles");
const btn_generateBruteForceLines = document.getElementById("btn-generateBruteForceLines");
const btn_clearCanvas = document.getElementById("btn-clearCanvas");
const convexHull_message = document.getElementById("convexHull-message");

const points = [];
const hull_points = [];
let selected_method = null;

const epsilon = 0.000001;

canvas_convexHull.addEventListener("click", function(event) {
    const point = getMousePoint(canvas_convexHull, event);
    points.push(point);

    if (selected_method) {
        generateHull(selected_method);
    } else {
        setMessage("Dodaj jos tacaka ili odaberi metodu.");
        drawScene();
    }
});

btn_generateBruteForceTriangles.addEventListener("click", function() {
    generateHull("triangles");
});

btn_generateBruteForceLines.addEventListener("click", function() {
    generateHull("lines");
});

btn_clearCanvas.addEventListener("click", function() {
    points.length = 0;
    hull_points.length = 0;
    selected_method = null;
    setMessage("");
    drawScene();
});

function getMousePoint(canvas, event) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function clearCanvas(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function setMessage(message) {
    convexHull_message.textContent = message;
}

function drawPoint(ctx, point, color = "#000000") {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI, false);
    ctx.fill();
}

function drawPolygon(ctx, polygon) {
    if (polygon.length < 2) return;

    ctx.beginPath();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.moveTo(polygon[0].x, polygon[0].y);

    for (let i = 1; i < polygon.length; i++) {
        ctx.lineTo(polygon[i].x, polygon[i].y);
    }

    if (polygon.length > 2) {
        ctx.closePath();
    }

    ctx.stroke();
    ctx.lineWidth = 1;
}

function drawScene() {
    clearCanvas(canvas_convexHull, ctx_convexHull);

    if (hull_points.length > 1) {
        drawPolygon(ctx_convexHull, hull_points);
    }

    for (const point of points) {
        drawPoint(ctx_convexHull, point);
    }

    for (const point of hull_points) {
        drawPoint(ctx_convexHull, point, "#d00000");
    }
}

function arePointsEqual(first, second) {
    return Math.abs(first.x - second.x) < epsilon && Math.abs(first.y - second.y) < epsilon;
}

function crossProduct(first, second, third) {
    return (second.x - first.x) * (third.y - first.y) - (second.y - first.y) * (third.x - first.x);
}

function distanceSquared(first, second) {
    const dx = first.x - second.x;
    const dy = first.y - second.y;
    return dx * dx + dy * dy;
}

function uniquePoints(input_points) {
    const unique = [];

    for (const point of input_points) {
        let exists = false;

        for (const current of unique) {
            if (arePointsEqual(point, current)) {
                exists = true;
                break;
            }
        }

        if (!exists) {
            unique.push(point);
        }
    }

    return unique;
}

function areAllPointsCollinear(input_points) {
    if (input_points.length < 3) return true;

    for (let i = 2; i < input_points.length; i++) {
        if (Math.abs(crossProduct(input_points[0], input_points[1], input_points[i])) > epsilon) {
            return false;
        }
    }

    return true;
}

function makeSimplePolygon(input_points) {
    const unique = uniquePoints(input_points);

    if (unique.length <= 2) {
        return unique.sort(comparePoints);
    }

    if (areAllPointsCollinear(unique)) {
        const sorted = [...unique].sort(comparePoints);
        return [sorted[0], sorted[sorted.length - 1]];
    }

    const center = unique.reduce(function(result, point) {
        return {
            x: result.x + point.x / unique.length,
            y: result.y + point.y / unique.length
        };
    }, { x: 0, y: 0 });

    const polygon = [...unique].sort(function(first, second) {
        const angle_first = Math.atan2(first.y - center.y, first.x - center.x);
        const angle_second = Math.atan2(second.y - center.y, second.x - center.x);

        if (Math.abs(angle_first - angle_second) > epsilon) {
            return angle_first - angle_second;
        }

        return distanceSquared(center, second) - distanceSquared(center, first);
    });

    return removeCollinearPoints(polygon);
}

function comparePoints(first, second) {
    if (Math.abs(first.x - second.x) > epsilon) return first.x - second.x;
    return first.y - second.y;
}

function isPointOnSegment(point, start, end) {
    if (Math.abs(crossProduct(start, end, point)) > epsilon) return false;

    return (
        point.x >= Math.min(start.x, end.x) - epsilon &&
        point.x <= Math.max(start.x, end.x) + epsilon &&
        point.y >= Math.min(start.y, end.y) - epsilon &&
        point.y <= Math.max(start.y, end.y) + epsilon
    );
}

function removeCollinearPoints(polygon) {
    const result = [...polygon];
    let changed = true;

    while (changed && result.length > 2) {
        changed = false;

        for (let i = 0; i < result.length; i++) {
            const previous = result[(i + result.length - 1) % result.length];
            const current = result[i];
            const next = result[(i + 1) % result.length];

            if (isPointOnSegment(current, previous, next)) {
                result.splice(i, 1);
                changed = true;
                break;
            }
        }
    }

    return result;
}

function isPointInsideTriangle(point, first, second, third) {
    const area = crossProduct(first, second, third);
    if (Math.abs(area) < epsilon) return false;

    const first_orientation = crossProduct(point, first, second);
    const second_orientation = crossProduct(point, second, third);
    const third_orientation = crossProduct(point, third, first);

    const has_negative = first_orientation < -epsilon || second_orientation < -epsilon || third_orientation < -epsilon;
    const has_positive = first_orientation > epsilon || second_orientation > epsilon || third_orientation > epsilon;

    return !(has_negative && has_positive);
}

function bruteForceTriangles(input_points) {
    const candidates = [];

    for (let p = 0; p < input_points.length; p++) {
        let is_hull_vertex = true;
        let i = 0;

        while (is_hull_vertex && i < input_points.length) {
            if (i !== p) {
                let j = i + 1;

                while (is_hull_vertex && j < input_points.length) {
                    if (j !== p) {
                        let k = j + 1;

                        while (is_hull_vertex && k < input_points.length) {
                            if (
                                k !== p &&
                                isPointInsideTriangle(input_points[p], input_points[i], input_points[j], input_points[k])
                            ) {
                                is_hull_vertex = false;
                            }

                            k++;
                        }
                    }

                    j++;
                }
            }

            i++;
        }

        if (is_hull_vertex) {
            candidates.push(input_points[p]);
        }
    }

    return makeSimplePolygon(candidates);
}

function arePointsOnSameSideOfLine(input_points, first, second) {
    let has_positive = false;
    let has_negative = false;

    for (const point of input_points) {
        const orientation = crossProduct(first, second, point);

        if (orientation > epsilon) {
            has_positive = true;
        } else if (orientation < -epsilon) {
            has_negative = true;
        }

        if (has_positive && has_negative) {
            return false;
        }
    }

    return true;
}

function bruteForceLines(input_points) {
    const belongs_to_hull = new Array(input_points.length).fill(false);

    for (let i = 0; i < input_points.length; i++) {
        for (let j = i + 1; j < input_points.length; j++) {
            if (!arePointsEqual(input_points[i], input_points[j]) && arePointsOnSameSideOfLine(input_points, input_points[i], input_points[j])) {
                belongs_to_hull[i] = true;
                belongs_to_hull[j] = true;
            }
        }
    }

    const candidates = [];

    for (let i = 0; i < input_points.length; i++) {
        if (belongs_to_hull[i]) {
            candidates.push(input_points[i]);
        }
    }

    return makeSimplePolygon(candidates);
}

function generateHull(method) {
    selected_method = method;

    if (uniquePoints(points).length < 3) {
        hull_points.length = 0;
        setMessage("Potrebno je najmanje 3 tacke za generisanje konveksnog omotaca.");
        drawScene();
        return;
    }

    const generated_hull = method === "triangles" ? bruteForceTriangles(points) : bruteForceLines(points);
    hull_points.length = 0;
    hull_points.push(...generated_hull);

    if (method === "triangles") {
        setMessage("Konveksni omotac je generisan brute force metodom preko trouglova.");
    } else {
        setMessage("Konveksni omotac je generisan brute force metodom preko pravaca.");
    }

    drawScene();
}

drawScene();
