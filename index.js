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

    // Open a TCP connection from the Electron renderer to the Pi server.
    const client = net.createConnection({ port: server_port, host: server_addr }, () => {
        // Transmit user-entered text followed by CRLF so the server can read a full command line.
        client.write(`${input}\r\n`);
    });
    
    // Receive one status payload from the server for this request.
    client.on('data', (data) => {
        var response = data.toString().trim();
        showServerMessage(response);

        // Expected format: "direction;redLight;distance;battery".
        // Split the payload, then map each field into its matching UI element.
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
        // Close this socket after rendering the latest values.
        client.end();
        client.destroy();
    });

    client.on('end', () => {
        console.log('disconnected from server');
    });


}

// Send data to teh server
function send_data(input) {
    const net = require('net');
    const client = net.createConnection({ port: server_port, host: server_addr }, () => {
        // Send the key code command (W/A/S/D mapped to 87/65/83/68).
        client.write(`${input}\r\n`);
    });

    client.on('data', (data) => {
        var response = data.toString().trim();
        showServerMessage(response);
        
        // Parse response and update the dashboard text values.
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

// Capture keyboard input and forward movement commands to the server.
var currentKey = null; // Prevent spamming server if key is held down

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
