function drawText(ctx) {
    ctx.font = "30px Arial";
    ctx.fillText("Hello World", 10, 50);
}

function drawRect(ctx) {
    ctx.fillRect(25, 25, 100, 100);
    ctx.clearRect(45, 45, 60, 60);
    ctx.strokeRect(50, 50, 50, 50);
}

function drawImage(ctx, link) {
    var img = new Image();
    img.onload = function () {
        ctx.drawImage(img, 0, 0);
    };
    img.src = link;
}

// ImageId is 1 through 5
function getUserImageMediaLink(userId, imageId) {
    // TODO: add wherever the serverless functionw writes to.
    var endpoint = "https://www.googleapis.com/storage/v1/b/gene499-bucket-v2/o/test_file_consent"
    var xhr = new XMLHttpRequest();
    xhr.open("GET", endpoint, false); // False for synchronous request.
    xhr.send(null);
    return JSON.parse(xhr.responseText).mediaLink;
}

window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOM fully loaded and parsed');

    canvas = document.getElementById("myCanvas");
    context = canvas.getContext("2d");

    var mediaLink = getUserImageMediaLink(69, 69);

    drawImage(context, mediaLink);
    drawText(context);
    drawRect(context);

});
