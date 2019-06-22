#!/usr/bin/node

var request2 = require('sync-request');
const https = require('https');
const request = require('request');
const fs = require('fs');

arg1 = process.argv[2] || "";
arg2 = process.argv[3] || "";
arg3 = process.argv[4] || "";

var config = {};
config.soundcloud = {
    href: 'https://api.soundcloud.com/',
    id: arg1,
};

if (arg1 === "-h" || arg1 === "--help") {
    console.log("Soundcloud downloader");
    console.log("https://gitlab.com/deadblackclover/sndcld-dwldr")
    console.log('Run: index.js "token" "file"');
} else if (arg1 !== "" && arg2 !== "") {

    let regToken = /[a-z0-9]{32}/
    var matchToken = regToken.exec(arg1);

    let regURL = /https:\/\/soundcloud.com\/[a-z0-9-]+\/[a-z0-9-]+/g
    var matchURL= regURL.exec(arg2);

    if(matchToken !== null && matchToken[0] !== "" && matchURL !== null && matchURL[0] !== "") {
        var url = arg2;

        if (arg3 !== "" && arg3 == "playlist") {
            downloaderPlaylist(url);
        } else {
            downloader(url);
        }
        
    } else {
        console.log("Error: invalid parameters");
        console.log("Help: index.js -h")
    }
} else {
    console.log("Error: empty parameters");
    console.log("Help: index.js -h")
}

async function downloader(url) {

    let resolve = config.soundcloud.href +
        'resolve.json?url=' + encodeURIComponent(url) +
        '&client_id=' + config.soundcloud.id +
        '&format=json&_status_code_map[302]=200';

    var res = request2('GET', resolve, {
        headers: {
            'User-Agent': 'Curl'
        },
    });
    
    var json = JSON.parse(res.getBody('utf8'));

    var res = request2('GET', json.location, {
        headers: {
            'User-Agent': 'Curl'
        },
    });

    var json = JSON.parse(res.getBody('utf8'));
    let id = json.id;
    let namemp3 = json.user.username + ' - ' + json.title + '.mp3';
    let url_track = config.soundcloud.href + 'i1/tracks/' + id + '/streams?client_id=' + config.soundcloud.id;

    var res = request2('GET', url_track, {
        headers: {
            'User-Agent': 'Curl'
        },
    });

    var json = JSON.parse(res.getBody('utf8'));

    let mp3 = json.http_mp3_128_url;

    namemp3 = namemp3.split("/").join("_");
    namemp3 = namemp3.split(" ").join("_");

    let file = fs.createWriteStream(namemp3);

    await new Promise((resolve, reject) => {
        let stream = request({
            uri: mp3,
        })
        .pipe(file)
        .on('finish', () => {
            console.log("Successful download!");
            console.log(namemp3);
            resolve();
        })
        .on('error', (error) => {
            reject(error);
        })
    })
    .catch(error => {
        console.log(`Something happened: ${error}`);
    });

    // let request = https.get(mp3, function(response) {
    //     response.pipe(file);
    // });

    // console.log("Successful download!");
    // console.log(namemp3);
}

function downloaderPlaylist(url) {
    let resolve = config.soundcloud.href +
        'resolve.json?url=' + encodeURIComponent(url) +
        '&client_id=' + config.soundcloud.id +
        '&format=json&_status_code_map[302]=200';

    var res = request2('GET', resolve, {
        headers: {
            'User-Agent': 'Curl'
        },
    });

    var json = JSON.parse(res.getBody('utf8'));
    
    var res = request2('GET', json.location, {
        headers: {
            'User-Agent': 'Curl'
        },
    });

    var json = JSON.parse(res.getBody('utf8'));
    json.tracks.map(function (i) {
        downloader(i.permalink_url);
    })
}