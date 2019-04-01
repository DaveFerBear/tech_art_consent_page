// Toggle between pages
function changePage(page) {
    for (var i = 1; i <= 4; i++) {
        var displayOption = i == page ? "block" : "none";
        document.getElementById("page-" + i).style.display = displayOption;
    }

    // Redirect home if at last page.
    var PAGE_3_TIME_DELAY_MS = 6000;
    var PAGE_2_TIME_DELAY_MS = 60000;
    if (page == 2) {
        setTimeout(function () {
            document.location.reload(true)
            //changePage(1);
        }, PAGE_2_TIME_DELAY_MS);
    } else if (page == 3 || page == 4) {
        document.getElementById("welcome-text").innerHTML = "User " + userId;
        setTimeout(function () {
            document.location.reload(true);
            //changePage(1);
        }, PAGE_3_TIME_DELAY_MS);
    }
}

function kickOff() {
    takeASnap().then(uploadBlobToCloud);
}

function recursiveDelay(functionToCall, executionsNumber, timeoutInMilliseconds) {
    if (executionsNumber) { //exit condition
        functionToCall(); // external function execution
        setTimeout(
            () => {
                recursiveDelay(functionToCall, executionsNumber - 1, timeoutInMilliseconds); //recursive call
            }, timeoutInMilliseconds);
    }
}

function takeASnap() {
    const canvas = document.createElement('canvas'); // create a canvas
    const ctx = canvas.getContext('2d'); // get its context
    canvas.width = vid.videoWidth; // set its size to the one of the video
    canvas.height = vid.videoHeight;
    ctx.drawImage(vid, 0, 0); // the video

    return new Promise((res, rej) => {
        canvas.toBlob(res, 'image/jpeg'); // request a Blob from the canvas
    });

}

function uploadBlobToCloud(blob) {
    // Some logging and housekeeping.
    imageId++;
    if (imageId > NUM_IMAGES) {
        imageId = 1
    };
    console.log(userId + "/" + imageId);
    console.log(blob);

    // Upload to cloud storage.
    function formatParams(params) {
        return "?" + Object
            .keys(params)
            .map(function (key) {
                return key + "=" + encodeURIComponent(params[key])
            })
            .join("&")
    }

    var fileName = "raw/" + userId + "/" + imageId;
    var uploadEndpoint = "https://www.googleapis.com/upload/storage/v1/b/gene499-bucket-v2/o";
    var params = {
        name: fileName,
        uploadType: "media"
    }
    var url = uploadEndpoint + formatParams(params);
    var xhr = new XMLHttpRequest();
    var synchronousRequest = (imageId == NUM_IMAGES); // Only run final request synchronously.
    xhr.open("POST", url, synchronousRequest);

    //Send the proper header information along with the request
    // xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () { // Call a function when the state changes.
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log("Request Successful.")
        }
    }
    xhr.send(blob); // Send the blob!

    if (imageId == NUM_IMAGES) {
        var xhr2 = new XMLHttpRequest();
        // Fetch mediaLink from metadata
        var manifestEndpoint = "https://www.googleapis.com/storage/v1/b/gene499-bucket-v2/o/manifest.txt"
        xhr2.open("GET", manifestEndpoint, false); // False for synchronous request.
        xhr2.send(null);
        var mediaLink = JSON.parse(xhr2.responseText).mediaLink;

        // Fetch data from mediaLink
        xhr2.open("GET", mediaLink, false); // False for synchronous request.
        xhr2.send(null);

        var manifest;
        var consent = consentPreference ? ',1' : ',0';
        if (!xhr2.responseText) {
            manifest = userId + consent;
        } else {
            manifest = xhr2.responseText + "\n" + userId + consent;
        }

        console.log(manifest);

        // Upload appended manifest
        var manifestParams = {
            name: "manifest.txt",
            uploadType: "media"
        }
        var manifestUrl = uploadEndpoint + formatParams(manifestParams)
        xhr2.open("POST", manifestUrl, true);
        xhr2.onreadystatechange = function () { // Call a function when the state changes.
            if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                console.log("MANIFEST Request Successful.")
            }
        }
        xhr2.send(manifest); // Send the blob!
    }
}


////////////////        ON DOM LOADED           /////////////////

var userId = 0000;
var imageId = 0;

var NUM_IMAGES = 5;
var IMAGE_DELAY = 1000;
var vid;

var consentPreference;

$(document).ready(function () {
    // Hide Scrollbars (no overflow)
    $("body").css("overflow", "hidden");

    document.getElementById("page-1-button").addEventListener("click", function () {
        changePage(2);
    });

    function takeImages(consent) {
        consentPreference = consent;
        userId = Math.floor(Math.random() * 10000); // Set userId before page is changed.
        changePage(consent ? 3 : 4);
        imageId = 0;
        recursiveDelay(kickOff, NUM_IMAGES, IMAGE_DELAY)
    }

    document.getElementById("accept-div").addEventListener("click", function () {
        takeImages(true);
    });
    document.getElementById("decline-div").addEventListener("click", function () {
        takeImages(false);
    });

    vid = document.querySelector('video');
    navigator.mediaDevices.getUserMedia({ video: true }) // request cam
        .then(stream => {
            vid.srcObject = stream; // don't use createObjectURL(MediaStream)
            return vid.play(); // returns a Promise
        })
});
