const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.fillRect(50, 50, 120, 80);
ctx.beginPath();
ctx.arc(300, 120, 50, 0, Math.PI * 2);
ctx.stroke();

console.log("Lab 1 started");