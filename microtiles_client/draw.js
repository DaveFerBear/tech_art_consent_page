var userCount = 0;
var userLocations = [
    [5, 0],
    [4, 1], [5, 1],
    [3, 2], [4, 2], [5, 2],
    [1, 3], [2, 3], [3, 3], [4, 3],
    [0, 4], [1, 4], [2, 4], [3, 4],
    [0, 5], [1, 5], [2, 5], [3, 5],
    [0, 6], [1, 6], [2, 6], [3, 6],
    [0, 7], [1, 7], [2, 7], [3, 7]
];
var userSentences = [];
var imagesPerSet = 5;
var userImageSets = [];

var firstWords = [
    "Finding", "Tracking", "Installing", "Reading", "Downloading",
    "Copying", "Loading", "Uploading", "Pasting", "Restoring"];

var secondWords = [
    "Log-In Instances...", "IP Addresses...", "Devices...", "Location...", "Preferences...", "Browsing History...",
    "Contacts...", "Private Messages...", "Identity...", "Personal Files...", "Passwords...", "Bank Pin...",
    "Usernames...", "Photos...", "Purchase History...", "Friends List...", "Subscriptions...", "Credit Card Information..."];

var scale = 1.25
var imgWidth = 185 * scale;
var imgHeight = 120 * scale;

function drawText(ctx, userId) {
    ctx.font = "10px Arial";
    ctx.fillText(userSentences[userId], 4 + userLocations[userId][0] * imgWidth, 20 + userLocations[userId][1] * imgHeight);
}

function drawImage(ctx, link, userId) {
    var img = new Image();
    img.onload = function () {
        img.width = imgWidth;
        img.height = imgHeight;
        ctx.drawImage(img, userLocations[userId][0] * imgWidth, userLocations[userId][1] * imgHeight, imgWidth, imgHeight);
        drawText(context, userId);
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

function addNewUser() {
    var userId = userCount % userLocations.length;

    var firstWord = firstWords[Math.floor((Math.random() * firstWords.length))];
    var secondWord = secondWords[Math.floor((Math.random() * secondWords.length))];
    userSentences[userId] = firstWord + " " + secondWord;

    canvas = document.getElementById("myCanvas");
    context = canvas.getContext("2d");

    var mediaLink = getUserImageMediaLink(69, 69);

    drawImage(context, mediaLink, userId);

    userCount = userCount + 1;
}

function handleKeypress(event) {
    if (event.keyCode == '13') {
        toggleFullscreen();
    }
    else {
        addNewUser();
    }
}

function toggleFullscreen() {
    let elem = document.getElementById("myCanvas");

    elem.requestFullscreen = elem.requestFullscreen || elem.mozRequestFullscreen
        || elem.msRequestFullscreen || elem.webkitRequestFullscreen;

    if (!document.fullscreenElement) {
        elem.requestFullscreen().then({}).catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

window.addEventListener('DOMContentLoaded', (event) => {

    document.fullscreenElement = document.fullscreenElement || document.mozFullscreenElement
        || document.msFullscreenElement || document.webkitFullscreenDocument;
    document.exitFullscreen = document.exitFullscreen || document.mozExitFullscreen
        || document.msExitFullscreen || document.webkitExitFullscreen;
    document.addEventListener("keypress", handleKeypress, false);

    console.log('DOM fully loaded and parsed');

    for (var i = 0; i < userLocations.length; i++) {
        userSentences.push("");
        userImageSets.push([]);
        for (var j = 0; j < imagesPerSet; j++) {
            userImageSets[i].push(new Image());
        }
    };
});
