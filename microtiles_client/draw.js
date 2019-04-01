
var userCount = 0;
var userLocations = [
    // [5, 0],
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
var drawPeriod = 475;

var newUsers;
var allUsers = [];

var currentUsers = new Map();
var images = [];
var curImage;

var firstWords = [
    "Finding", "Tracking", "Installing", "Reading", "Downloading",
    "Copying", "Loading", "Uploading", "Pasting", "Restoring"];

var secondWords = [
    "Log-In Instances...", "IP Addresses...", "Devices...", "Location...", "Preferences...", "Browsing History...",
    "Contacts...", "Private Messages...", "Identity...", "Personal Files...", "Passwords...", "Bank Pin...",
    "Usernames...", "Photos...", "Purchase History...", "Friends List...", "Subscriptions...", "Credit Card Information..."];

var imgWidth = 187 * 1.25;
var imgHeight = 120 * 1.25;

function drawIcon(ctx) {
    var iconX = 5;
    var iconY = 0;
    var img = new Image();
    img.onload = function () {
        img.width = imgWidth;
        img.height = imgHeight;
        ctx.drawImage(img, iconX * imgWidth, iconY * imgHeight, imgWidth, imgHeight);
    };
    img.src = "img/corner_icon.png";
}

function drawText(ctx, userIndex) {
    ctx.font = "10px Arial";
    ctx.fillText(userSentences[userIndex], 4 + userLocations[userIndex][0] * imgWidth, 20 + userLocations[userIndex][1] * imgHeight);
}

function drawImage(ctx, link, index) {
    var img = new Image();
    img.onload = function () {
        img.width = imgWidth;
        img.height = imgHeight;
        ctx.drawImage(img, userLocations[index][0] * imgWidth,
            userLocations[index][1] * imgHeight,
            imgWidth,
            imgHeight);
        drawText(context, index);
    };
    img.src = link;
    return img;
}

// function getUserImageMediaLink(userIndex, imageId) {
//     // TODO: add wherever the serverless functionw writes to.
//     var endpoint = "https://www.googleapis.com/storage/v1/b/gene499-bucket-v2/o/test_file_consent"
//     var xhr = new XMLHttpRequest();
//     xhr.open("GET", endpoint, false); // False for synchronous request.
//     xhr.send(null);
//     return JSON.parse(xhr.responseText).mediaLink;
// }

function getManifest() {
    var endpoint = "https://www.googleapis.com/storage/v1/b/gene499-bucket-v2/o/manifest.txt"
    var xhr = new XMLHttpRequest();
    xhr.open("GET", endpoint, false); // False for synchronous request.
    xhr.send(null);
    var mediaLink = JSON.parse(xhr.responseText).mediaLink;

    xhr.open("GET", mediaLink, false);
    xhr.send(null);

    return xhr.responseText;
}

function createNewUsersIfInManifest(manifest) {
    newUsers = [];
    var manifestArr = manifest.split('\n');
    for (var i = 0; i < manifestArr.length; i++) {
        var ud = manifestArr[i].split(',');
        var userIdInt = parseInt(ud[0]);
        if (!currentUsers.has(userIdInt)) { // New User encountered
            var consentPref = parseInt(ud[1]) == 1;
            console.log("Creating New User: " + userIdInt + ", " + consentPref);
            var u = new User(userIdInt, consentPref);
            newUsers.push(u);
            currentUsers.set(userIdInt, u);
        }
    }
    return newUsers;
}

function addNewUser(user) {
    var userIndex = userCount % userLocations.length;
    var firstWord = firstWords[Math.floor((Math.random() * firstWords.length))];
    var secondWord = secondWords[Math.floor((Math.random() * secondWords.length))];
    userSentences[userIndex] = firstWord + " " + secondWord;

    if (allUsers.length < userLocations.length) {
        allUsers.push(user);
    }
    else {
        allUsers[userIndex] = user;
    }

    canvas = document.getElementById("myCanvas");
    context = canvas.getContext("2d");

    drawImage(context, user.mediaLinks[0], userIndex);

    userCount = userCount + 1;
}

function userDrawLoop() {

    canvas = document.getElementById("myCanvas");
    context = canvas.getContext("2d");

    var d = new Date();
    var n = d.getTime();

    for (var userIndex = 0; userIndex < allUsers.length; userIndex++) {

        var user = allUsers[userIndex];

        if (n - user.lastDraw > drawPeriod) {
            // Update image displayed
            user.imageIdx = (user.imageIdx+1)%user.mediaLinks.length;

            drawImage(context, user.mediaLinks[user.imageIdx], userIndex);

            user.lastDraw += drawPeriod;

            d = new Date();
            n = d.getTime();
        }
    }

}

// function drawUser(user) {
//     console.log("drawUser");
//     if (user.mediaLinks.length > 0) {
//         images[curImage].src = user.mediaLinks[0];
//     }
//     curImage++;
//     curImage %= userLocations.length;
// }

function getNewUsers() {
    var manifestText = getManifest();
    var nu = createNewUsersIfInManifest(manifestText);
    for (var i = 0; i < nu.length; i++) {
        addNewUser(nu[i]);
    }
}

function handleKeypress(event) {
    if (event.keyCode == '13') {
        toggleFullscreen();
    }
    else {
        getNewUsers();
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

    canvas = document.getElementById("myCanvas");
    context = canvas.getContext("2d");
    drawIcon(context);

    setInterval(userDrawLoop, 100);
    setInterval(getNewUsers, 500);

    // var d = new Date();
    // var n = d.getTime();

    // for (var i = 0; i < userLocations.length; i++) {
    //     imageIdx.push(0);
    //     lastDraw.push(n);
    //     // images.push(getImage(context, i));
    // }
});
