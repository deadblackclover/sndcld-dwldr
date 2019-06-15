#!/usr/bin/node

const request = require('request');
const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');

arg1 = process.argv[2] || "";
arg2 = process.argv[3] || "";

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
        
        var config = {};
        config.soundcloud = {
            href: 'https://api.soundcloud.com/',
            id: arg1,
        };

        var URL = arg2;

        let resolve = config.soundcloud.href +
            'resolve.json?url=' + encodeURIComponent(URL) +
            '&client_id=' + config.soundcloud.id +
            '&format=json&_status_code_map[302]=200';

        request.get({
            url: resolve,
            headers: {
                'User-Agent': 'Curl'
            }
        }, function(err, res, body) {
            if (err) {
                console.log("Error: request");
                console.log("Help: index.js -h")
            }
            let json = JSON.parse(body);
            request.get({
                url: json.location,
                headers: {
                    'User-Agent': 'Curl'
                }
            }, function(err, res, body) {
                if (err) {
                    console.log("Error: request");
                    console.log("Help: index.js -h")
                }
                let json = JSON.parse(body);
                let id = json.id;
                let namemp3 = json.user.username + ' - ' + json.title + '.mp3';
                let url = config.soundcloud.href + 'i1/tracks/' + id + '/streams?client_id=' + config.soundcloud.id;
                request.get({
                    url: url,
                    headers: {
                        'User-Agent': 'Curl'
                    }
                }, function(err, res, body) {
                    if (err) {
                        console.log("Error: request");
                        console.log("Help: index.js -h")
                    }
                    let json = JSON.parse(body);
                    let mp3 = json.http_mp3_128_url;

                    let file = fs.createWriteStream(namemp3);
                    let request = https.get(mp3, function(response) {
                        response.pipe(file);
                    });

                    console.log("Successful download!");
                    console.log(namemp3);
                })
            })
        })
    } else {
        console.log("Error: invalid parameters");
        console.log("Help: index.js -h")
    }
} else {
    console.log("Error: empty parameters");
    console.log("Help: index.js -h")
}