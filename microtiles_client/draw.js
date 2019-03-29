function drawText(ctx) {
    ctx.font = "30px Arial";
    ctx.fillText("Hello World", 10, 50);
}

function drawRect(ctx) {
    ctx.fillRect(25, 25, 100, 100);
    ctx.clearRect(45, 45, 60, 60);
    ctx.strokeRect(50, 50, 50, 50);
}

window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    canvas = document.getElementById("myCanvas");
    context = canvas.getContext("2d");

    drawText(context);
    drawRect(context);
});
