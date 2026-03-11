document.onkeydown = updateKey;
document.onkeyup = resetKey;

var server_port = 65432;
var server_addr = "192.168.10.6";   // the IP address of your Raspberry PI

function showServerMessage(msg) {
    console.log("[server]", msg);
    var output = document.getElementById("server_response");
    if (output) {
        output.innerHTML = msg;
    }
}

function client(){
    
    const net = require('net');
    var input = document.getElementById("message").value;

    const client = net.createConnection({ port: server_port, host: server_addr }, () => {
        // 'connect' listener.
        console.log('connected to server!');
        // send the message
        client.write(`${input}\r\n`);
    });
    
    // get the data from the server
    client.on('data', (data) => {
        var response = data.toString().trim();
        showServerMessage(response);

        // STEP3: RECEIVE DATA AND DISPLAY IT IN THE HTML (if fields exist)
        var d = response.split(";");
        if (document.getElementById("direction") && d.length > 0) {
            document.getElementById("direction").innerHTML = d[0] + "°";
        }
        if (document.getElementById("red_light") && d.length > 1) {
            let isRedLight = d[1].toLowerCase() === 'true';
            document.getElementById("red_light").innerHTML = isRedLight ? "DETECTED" : "False";
            document.getElementById("red_light").style.color = isRedLight ? "red" : "black";
        }
        if (document.getElementById("distance") && d.length > 2) {
            document.getElementById("distance").innerHTML = parseFloat(d[2]).toFixed(2) + " m";
        }
        if (document.getElementById("battery") && d.length > 3) {
            document.getElementById("battery").innerHTML = parseFloat(d[3]).toFixed(2) + "%";
        }
        client.end();
        client.destroy();
    });

    client.on('end', () => {
        console.log('disconnected from server');
    });


}

// STEP3: SEND THE DATA TO THE SERVER
function send_data(input) {
    const net = require('net');
    const client = net.createConnection({ port: server_port, host: server_addr }, () => {
        client.write(`${input}\r\n`);
    });

    client.on('data', (data) => {
        var response = data.toString().trim();
        showServerMessage(response);
        
        var d = response.split(";");
        if (document.getElementById("direction") && d.length > 0) {
            document.getElementById("direction").innerHTML = d[0];
        }
        if (document.getElementById("red_light") && d.length > 1) {
            let isRedLight = d[1].toLowerCase() === 'true';
            document.getElementById("red_light").innerHTML = isRedLight ? "DETECTED" : "False";
            document.getElementById("red_light").style.color = isRedLight ? "red" : "black";
        }
        if (document.getElementById("distance") && d.length > 2) {
            document.getElementById("distance").innerHTML = parseFloat(d[2]).toFixed(2) + " m";
        }
        if (document.getElementById("battery") && d.length > 3) {
            document.getElementById("battery").innerHTML = parseFloat(d[3]).toFixed(2) + "%";
        }

        client.end();
        client.destroy();
    });
}

// for detecting which key is been pressed w,a,s,d
var currentKey = null; // Added to prevent spamming server if key is held down

function updateKey(e) {

    e = e || window.event;

    if (currentKey === e.keyCode) return; 
    currentKey = e.keyCode;

    if (e.keyCode == '87') {
        // up (w)
        document.getElementById("upArrow").style.color = "green";
        send_data("87");
    }
    else if (e.keyCode == '83') {
        // down (s)
        document.getElementById("downArrow").style.color = "green";
        send_data("83");
    }
    else if (e.keyCode == '65') {
        // left (a)
        document.getElementById("leftArrow").style.color = "green";
        send_data("65");
    }
    else if (e.keyCode == '68') {
        // right (d)
        document.getElementById("rightArrow").style.color = "green";
        send_data("68");
    }

}

// reset the key to the start state 
function resetKey(e) {

    e = e || window.event;
    currentKey = null; // Release key lock

    document.getElementById("upArrow").style.color = "grey";
    document.getElementById("downArrow").style.color = "grey";
    document.getElementById("leftArrow").style.color = "grey";
    document.getElementById("rightArrow").style.color = "grey";
}
