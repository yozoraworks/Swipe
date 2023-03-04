const express = require('express');
const app = express();
const fs = require('fs')
const https = require('https')
const robot = require('robotjs')

const LEFT = "A";
const RIGHT = "D";
const DOWN = "S";
const UP = "W";

const threshold = 30;
const resetTime = 500; //ms

//static
app.use(express.static('public'));

//json
app.use(express.json());

var resetedDown = true;
var resetedUp = true;
var resetedLeft = true;
var resetedRight = true;

const fn = (req, res) => {
    let postData = req.body;

    //console.log(postData);

    if (resetedLeft && postData.z > threshold) {
        //detect z left
        if (LEFT)
            robot.keyTap(LEFT)
        console.log("LEFT " + postData.z);
        resetedLeft = false;
        setTimeout(() => {
            resetedLeft = true;
        }, resetTime);
    }

    else if (resetedRight && postData.z < -threshold) {
        //detect z right
        if (RIGHT)
            robot.keyTap(RIGHT)
        console.log("RIGHT " + -postData.z);
        resetedRight = false;
        setTimeout(() => {
            resetedRight = true;
        }, resetTime);
    }

    else if (resetedDown && postData.x < -threshold) {
        //detect x down
        if (DOWN)
            robot.keyTap(DOWN)
        console.log("DOWN " + -postData.x);
        resetedDown = false;
        setTimeout(() => {
            resetedDown = true;
        }, resetTime);
    }

    else if (resetedUp && postData.x > threshold) {
        //detect x down
        if (UP)
            robot.keyTap(UP)
        console.log("UP " + postData.x);
        resetedUp = false;
        setTimeout(() => {
            resetedUp = true;
        }, resetTime);
    }


    res.send("OK");
}

app.post('/data', fn);

console.log("In setting->safari, turn off prevent cross-site tracking")
console.log("Disable screen rotation")

app.listen(80, () => {
    //get my ip
    const { networkInterfaces } = require('os');

    const nets = networkInterfaces();
    const results = Object.create(null); // Or just '{}', an empty object

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
            if (net.family === familyV4Value && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }
                results[name].push(net.address);
                console.log("Visit https://" + net.address);
                console.log("Ignore certificate warning");
            }
        }
    }
}
);

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
}, app).listen(443, () => {
    console.log('Waiting for connection...')
})

//openssl req -nodes -new -x509 -keyout server.key -out server.cert