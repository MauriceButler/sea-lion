# sea-lion

Simple node http router

# Why

I have been using [beeline](https://github.com/xavi-/beeline) heavily for some time.
I like how it works, but have always wanted to change how it was written and tested and be able to implement changes quickly.

Sea-lion will also be more modular to make maintenance easier.


# Status

Work in progress...


## Goals
* Simple
* Unobtrusive
* Fairly Foolproof
* Easy to debug
* Fast

## Usage

```javascript

var SeaLion = require("sea-lion");

var router = new SeaLion({ // Create a new router
    "/foo": function(req, res) {
        // Called when req.url === "/foo" or req.url === "/foo?woo=poo"
    },
    "/names/`last-name`/`first-name`": function(req, res, tokens, values) {
        // Called when req.url contains three parts, the first of is "name".
        // The parameter tokens is an object that maps token names to values.
        // For example if req.url === "/names/smith/will"
        //   then tokens ===  { "first-name": "will", "last-name": "smith" }
        //   and values === [ "will", "smith" ]
        //   also req.params === tokens
    },
    "/static/`path...`": function(req, res, tokens, values) {
        // Called when req.url starts with "/static/"
        // The parameter tokens is an object that maps token name to a value
        // The parameter values is a list of
        // For example if req.url === "/static/pictures/actors/smith/will.jpg"
        //   then tokens === { "path": "pictures/actors/smith/will.jpg" }
        //   and values === [ "pictures/actors/smith/will.jpg" ]
        //   also req.params === tokens
    },
    "/`user`/static/`path...`": function(req, res, tokens, values) {
        // Called when req.url contains at least three parts, the second of which
        // is "static".
        // The parameter tokens is an object that maps token names and value
        // For example if req.url === "/da-oozer/static/pictures/venkman.jpg"
        //   then tokens === { "user": "da-oozer", "path": "pictures/venkman.jpg" }
        //   and values === [ "da-oozer", "pictures/venkman.jpg" ]
        //   also req.params === tokens
    },
    "/blogs/`user-id: [a-z]{2}-\\d{5}`/`post-id: \\d+`": function(
        req, res, tokens, values
    ) {
        // Called when req.url starts with "/blogs/" and when the second and third
        // parts match /[a-z]{2}-\d{5}/ and /\d+/ respectiviely.
        // The parameter tokens is an object that maps token names and value
        // For example if req.url === "/blog/ab-12345/1783"
        //   then tokens === { "user-id": "ab-12345", "post-id": "1783" }
        //   and values === [ "ab-12345", "1783" ]
        //   also req.params === tokens
    },
    "r`^/actors/([\\w]+)/([\\w]+)$`": function(req, res, matches) {
        // Called when req.url matches this regex: "^/actors/([\\w]+)/([\\w]+)$"
        // An array of captured groups is passed as the third parameter
        // For example if req.url === "/actors/smith/will"
        //   then matches === [ "smith", "will" ]
    },
    "`404`": function(req, res) {
        // Called when no other route rule are matched
        //
        // This handler can later be called explicitly with router.missing
    },
    "`500`": function(req, res, err) {
        // Called when an exception is thrown by another router function
        // The error that caused the exception is passed as the third parameter
        // This _not_ guaranteed to catch all exceptions
        //
        // This handler can later be called explicitly with router.error
    }
});

router.add({ // Use `.add` to append new rules to a router 
    "/ /home r`^/index(.php|.html|.xhtml)?$`": function(req, res) {
        // Called when req.url === "/" or req.url === "/home"
        //    or req.url matches this regex: ^/index(.php|.html|.xhtml)?$
        //      (i.e. req.url === "/index.php" or req.url === "/index.html")
        // Note that any number of rules can be combined using a space.
        // All rules will call the same request handler when matched.
    },
    "/my-method": { // Method (aka verb) specific dispatch.  Note case matters.
        "GET": function(req, res) {
            // Called when req.url === "/my-method" and req.method === "GET"
        },
        "POST PUT": function(req, res) {
            // Called when req.url === "/my-method" and
            //  req.method === "POST" or req.method === "PUT"
            // Methods can be combined with a space like URL rules.
        },
        "any": function(req, res) {
            // Called when req.url === "/my-method" and req.method is not
            // "GET" or "POST"
        }
    },
    "`405`": function(req, res) {
        // Called when when a URL is specified but no corresponding method (aka verb)
        // matches.  For example, this handler would be executed if the "any" catch
        // all wasn't specified in the handler above and req.method === "HEAD"
        //
        // This handler can later be called explicitly with router.missingVerb
    },
    "/explicit-calls": function(req, res) { // If necessary you can reroute requests
        if(url.parse(req.url).query["item-name"] === "unknown") {
            // Calls the 404 (aka missing) handler:
            return router.missing(req, res, this);
            // The last parameter is optional.  It sets the this pointer in the
            // 404 handler.
        }
        
        if(url.parse(req.url).query["item-name"] === "an-error") {
            // Calls the 500 (aka error) handler:
            return router.error(req, res, err, this);
            // The last parameter is optional.  It sets the this pointer in the
            // 500 handler.
        }
        
        // Do normal request handling
    }
});

// Starts serve with routes defined above:
require("http").createServer(router).listen(8080);
```

### Precedence Rules

The order in which rules were added/defined is their order of precedence.