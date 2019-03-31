class User {
    constructor(userId, didConsent) {
        this.userId = userId;
        this.consent = didConsent;
        this.mediaLinks = [];

        this.fetchImageMediaLinks = function () {
            var endpoint;
            var xhr = new XMLHttpRequest();
            for (let i = 1; i <= 5; i++) {
                endpoint = "https://www.googleapis.com/storage/v1/b/gene499-bucket-v2/o/processed%2f" + this.userId + "%2f" + i;
                xhr.open("GET", endpoint, false); // False for synchronous request.
                xhr.send(null);
                var d = JSON.parse(xhr.responseText).mediaLink;
                console.lo
                if (!(typeof d === 'undefined')) { this.mediaLinks.push(d); }
            }
        }

        this.fetchImageMediaLinks();
    }
}