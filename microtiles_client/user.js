function User(userId, didConsent) {
    this.userId = userId;
    this.consent = didConsent;
    this.mediaLinks = [];

    var xhr1 = new XMLHttpRequest();
    var endpoint = "https://www.googleapis.com/storage/v1/b/gene499-bucket-v2/o/processed%2f" + userId + "%2f1";
    xhr1.open("GET", endpoint, false); // False for synchronous request.
    xhr1.send(null);
    var d = JSON.parse(xhr1.responseText).mediaLink;
    if (!(typeof(d) === 'undefined')) { this.mediaLinks.push(d); }

    var xhr2 = new XMLHttpRequest();
    var endpoint = "https://www.googleapis.com/storage/v1/b/gene499-bucket-v2/o/processed%2f" + userId + "%2f2";
    xhr2.open("GET", endpoint, false); // False for synchronous request.
    xhr2.send(null);
    var d = JSON.parse(xhr2.responseText).mediaLink;
    if (!(typeof(d) === 'undefined')) { this.mediaLinks.push(d); }

    var xhr3 = new XMLHttpRequest();
    var endpoint = "https://www.googleapis.com/storage/v1/b/gene499-bucket-v2/o/processed%2f" + userId + "%2f3";
    xhr3.open("GET", endpoint, false); // False for synchronous request.
    xhr3.send(null);
    var d = JSON.parse(xhr3.responseText).mediaLink;
    if (!(typeof(d) === 'undefined')) { this.mediaLinks.push(d); }

    var xhr4 = new XMLHttpRequest();
    var endpoint = "https://www.googleapis.com/storage/v1/b/gene499-bucket-v2/o/processed%2f" + userId + "%2f4";
    xhr4.open("GET", endpoint, false); // False for synchronous request.
    xhr4.send(null);
    var d = JSON.parse(xhr4.responseText).mediaLink;
    if (!(typeof(d) === 'undefined')) { this.mediaLinks.push(d); }

    var xhr5 = new XMLHttpRequest();
    var endpoint = "https://www.googleapis.com/storage/v1/b/gene499-bucket-v2/o/processed%2f" + userId + "%2f5";
    xhr5.open("GET", endpoint, false); // False for synchronous request.
    xhr5.send(null);
    var d = JSON.parse(xhr5.responseText).mediaLink;
    if (!(typeof(d) === 'undefined')) { this.mediaLinks.push(d); }
}