// Grab elements, create settings, etc.
var video = document.getElementById('video');

// Get access to the camera!
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    // Not adding `{ audio: true }` since we only want video now
    navigator.mediaDevices.getUserMedia({ video: true }).then(function (stream) {
        //video.src = window.URL.createObjectURL(stream);
        video.srcObject = stream;
        video.play();
    });
}

// Elements for taking the snapshot
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var video = document.getElementById('video');

var userId;
var imageId;
let curURI;
var NUM_IMAGES = 5;
var IMAGE_DELAY = 1000;

function takeImages() {
    console.log("clicked");
    // userId = Math.floor(Math.random() * 10000); // Set userId before page is changed.
    // imageId = 0;
    let uri = canvas.toDataURL('image/jpeg');
    context.drawImage(video, 0, 0, 640, 480);
    //uploadBlobToCloud(dataURItoBlob(uri));
}

// Trigger photo take
document.getElementById("snap").addEventListener("click", function () {
    setInterval(takeImages, 1000);
});

function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    var blob = new Blob([ab], { type: mimeString });
    return blob;
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

    var fileName = "test/" + userId + "/" + imageId;
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
}
