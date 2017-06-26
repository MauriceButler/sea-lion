# sea-lion

Simple node http router

# Why

I have been using [beeline](https://github.com/xavi-/beeline) heavily for some time.
I like how it works, but have always wanted to change how it was written and tested and be able to implement changes quickly.

Sea-lion is also be more modular to make maintenance easier, and keep the router just routing things.

Static file serving is now in the [file-server](https://www.npmjs.com/package/file-server) module.

You can use it directly or to make it even easier, [dion](https://www.npmjs.com/package/dion) wraps the file-server module with sea-lion compatable signatures

## Usage

``` javascript
    var SeaLion = require('sea-lion');

    var router = new SeaLion({ // Create a new router
        '/foo': function(request, response, tokens) {
            // Called when request.url === '/foo'
            // Tokens will be a plain object with no keys
        },
        '/bar/`id`': function(request, response, tokens) {
            // Called when request.url === '/bar/anything till the next slash'
            // Tokens will be an object with id set to the value in the route
        },
        '/bar/`path...`': function(request, response, tokens) {
            // Called when request.url === '/bar/anything including slashes'
            // Tokens will be an object with path set to the value in the route
        }
    });

    // Starts serve with routes defined above:
    require('http').createServer(router.createHandler()).listen(8080);
```

### Precedence Rules

The order in which rules were added/defined is their order of precedence.

Rules with the least number of tokens will match first.
