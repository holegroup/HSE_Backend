let clients = []; 

function eventsHandler(req, res){ 
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Add the new client connection to the list
    console.log("New client connected!"); 
    clients.push(res);


    // Remove the client when they disconnect
    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
}

function sendEvent(req, res){ 
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    console.log(message); 

    // Send the message to all connected clients
    clients.forEach(client => {
        client.write(`data: ${JSON.stringify({ message })}\n\n`);
    });

    res.status(200).json({ success: true, message: "Message sent to clients" });
}

module.exports = {eventsHandler, sendEvent} 