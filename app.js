'use strict';

(function() {
    const Hapi = require('hapi');
    const Blipp = require('blipp');
    const Vision = require('vision');
    const Path = require('path');
    const Handlebars = require('handlebars');
    const Inert = require('inert');
    const Sass = require('node-sass');
    const fs = require('fs');

    const tools = require('./tools');

    Sass.render({
        file: 'styles/main.scss',
        outFile: 'public/main.css'
    }, function(error, result) {
        if (!error) {
            fs.writeFile('public/main.css', result.css, function(err) {
                if (!err) {
                    console.log('sass compiled');
                } else if (err) {
                    console.log(err);
                }
            });
        } else if (error) {
            console.log(error);
        }
    });

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

    server.route({
        method: 'GET',
        path: '/view/{section}',
        handler: function(request, reply) {
            var section = encodeURIComponent(request.params.section);

            var table = tools.dummyJSON[section];

            if (!table) {
                reply().redirect('/404');
            } else {
                reply.view('table', {
                    tableData: table
                });
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/404',
        handler: {
            view: {
                template: '404'
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
