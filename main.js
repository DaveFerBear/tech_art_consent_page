// Toggle between pages
function changePage(page) {
    for (var i = 1; i <= 3; i++) {
        console.log("page-" + i);
        if (i == page) {
            document.getElementById("page-" + i).style.display = "block";
        } else {
            document.getElementById("page-" + i).style.display = "none";
        }
    }
    if (page == 3) {
        setTimeout(function () {
            changePage(1);
        }, 3000);
    }
}

$(document).ready(function () {
    document.getElementById("page-1-button").addEventListener("click", function () {
        changePage(2);
    });

    document.getElementById("page-2-button").addEventListener("click", function () {
        changePage(3);
    });


    var video = document.querySelector("#videoElement");

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
            })
            .catch(function (error) {
                console.log("Something went wrong!");
            });
    }
});
