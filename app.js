'use strict';

(function() {
    const Hapi = require('hapi');
    const Blipp = require('blipp');
    const Vision = require('vision');
    const Path = require('path');
    const Handlebars = require('handlebars');
    const Inert = require('inert');

    const server = new Hapi.Server({
        connections: {
            routes: {
                files: {
                    relativeTo: Path.join(__dirname, 'public')
                }
            }
        }
    });

    server.connection({
        port: (process.env.PORT || 3000)
    });

    server.register([Blipp, Inert, Vision], () => {});

    server.views({
        engines: {
            html: Handlebars
        },
        path: 'views',
        layoutPath: 'views/layout',
        layout: 'layout',
        helpersPath: 'views/helpers'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: {
            view: {
                template: 'index'
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: './',
                listing: false,
                index: false
            }
        }
    });

    server.start((err) => {
        if (err) {
            throw err;
        }
        console.log(`Server running at: ${server.info.uri}`);
    });

})();
