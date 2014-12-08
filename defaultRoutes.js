module.exports = {
    '`404`': function(req, res) {
        var body = "404'd";
        res.writeHead(404, { "Content-Length": body.length, "Content-Type": "text/plain" });
        res.end(body);

        console.log("Someone 404'd: " + req.url);
    },
    '`405`': function(req, res) {
        var body = "405'd";
        res.writeHead(405, { "Content-Length": body.length, "Content-Type": "text/plain" });
        res.end(body);

        console.log("Someone 405'd -- url: " + req.url + "; verb: " + req.method);
    },
    '`500`': function(req, res, err) {
        console.error("Error accessing: " + req.method + " " + req.url);
        console.error(err.message);
        console.error(err.stack);

        var body = [ "500'd" ];
        body.push("An exception was thrown while accessing: " + req.method + " " + req.url);
        body.push("Exception: " + err.message);
        body = body.join("\n");
        res.writeHead(500, { "Content-Length": body.length, "Content-Type": "text/plain" });
        res.end(body);
    }
};