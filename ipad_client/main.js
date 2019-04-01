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
            // document.location.reload(true)
            changePage(1);
        }, PAGE_2_TIME_DELAY_MS);
    } else if (page == 3 || page == 4) {
        document.getElementById("welcome-text").innerHTML = "User " + userId;
        setTimeout(function () {
            // Reset terms and conditions scrollbar.
            var x = document.getElementById("style-1");
            x.scrollTop = 0;

            // document.location.reload(true);
            changePage(1);
        }, PAGE_3_TIME_DELAY_MS);
    }
}

function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);

    // create a view into the buffer
    var ia = new Uint8Array(ab);

    // set the bytes of the buffer to the correct values
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // write the ArrayBuffer to a blob, and you're done
    var blob = new Blob([ab], { type: mimeString });
    return blob;
}

function kickOff() {
    context.drawImage(video, 0, 0, 640, 480);
    var dataURI = canvas.toDataURL('image/jpeg');
    var blob = dataURItoBlob(dataURI);
    uploadBlobToCloud(blob);
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

var canvas;
var context;
var video;

var consentPreference;

$(document).ready(function () {
    // Hide Scrollbars (no overflow)
    $("body").css("overflow", "hidden");

    document.getElementById("page-1-button").addEventListener("click", function () {
        changePage(2);
    });

    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    video = document.querySelector('video');

    function takeImages(consent) {
        console.log("clicked");
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


    navigator.mediaDevices.getUserMedia({ video: true }) // request cam
        .then(stream => {
            video.srcObject = stream; // don't use createObjectURL(MediaStream)
            return video.play(); // returns a Promise
        })
});
