// Toggle between pages
function changePage(page) {
    for (var i = 1; i <= 3; i++) {
        if (i == page) {
            document.getElementById("page-" + i).style.display = "block";
        } else {
            document.getElementById("page-" + i).style.display = "none";
        }
    }
    // Redirect home if at last page.
    if (page == 3) {
        document.getElementById("welcome-text").innerHTML = "Welcome User " + Math.floor(Math.random() * 1000);
        setTimeout(function () {
            changePage(1);
        }, 3000);
    }
}

$(document).ready(function () {
    // Hide Scrollbars (no overflow)
    $("body").css("overflow", "hidden");

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
