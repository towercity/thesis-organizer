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
    const Sequelize = require('sequelize');

    const structures = require('./structures');

    var sequelize;

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

    if (process.env.DATABASE_URL) {
        // the application is executed on Heroku ... use the postgres database
        sequelize = new Sequelize(process.env.DATABASE_URL, {
            dialect: 'postgres',
            protocol: 'postgres',
            logging: true //false
        })
    } else {
        sequelize = new Sequelize('db', 'username', 'password', {
            host: 'localhost',
            dialect: 'sqlite',

            pool: {
                max: 5,
                min: 0,
                idle: 10000
            },

            // SQLite only
            storage: 'db.sqlite'
        });
    }

    var databases = {
        bibliography: sequelize.define('bibliography', {
            title: {
                type: Sequelize.STRING
            },
            author: {
                type: Sequelize.STRING
            },
            genre: {
                type: Sequelize.STRING
            },
            connections: {
                type: Sequelize.STRING
            },
            dateRead: {
                type: Sequelize.STRING
            },
            purchased: {
                type: Sequelize.STRING
            },
            note: {
                type: Sequelize.TEXT('long')
            },
        }),
        stories: sequelize.define('stories', {
            title: {
                type: Sequelize.STRING
            },
            status: {
                type: Sequelize.STRING
            },
            pages: {
                type: Sequelize.INTEGER
            },
            series: {
                type: Sequelize.STRING
            },
            notes: {
                type: Sequelize.TEXT('long')
            },
        }),
        'to-write': sequelize.define('to-write', {
            title: {
                type: Sequelize.STRING
            },
            series: {
                type: Sequelize.STRING
            },
            description: {
                type: Sequelize.TEXT('long')
            },
        }),
        quotes: sequelize.define('quotes', {
            used: {
                type: Sequelize.STRING
            },
            saidBy: {
                type: Sequelize.STRING
            },
            saidIn: {
                type: Sequelize.STRING
            },
            quote: {
                type: Sequelize.TEXT('long')
            },
        })
    }

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

            var table = structures.dummyJSON[section];

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

    server.route({
        method: 'GET',
        path: '/createDB',
        handler: function(request, reply) {
            // force: true will drop the table if it already exists
            for (var data in databases) {
                console.log(data);
                databases[data].sync({
                    force: true
                });
            }
            reply("Databases Created")
        }
    });

    server.route({
        method: 'GET',
        path: '/add/{section}',
        handler: function(request, reply) {
            var section = encodeURIComponent(request.params.section);

            var form = structures[section];

            if (!form) {
                reply().redirect('/404');
            } else {
                reply.view('form', {
                    formData: form,
                    database: section
                })
            }
        }
    });

    server.route({
        method: 'POST',
        path: '/form',
        handler: function(request, reply) {
            var payload = request.payload;
            var database = payload.database;
            var saveData = {};

            console.log('Importing data...');

            //creates the object to add to the database
            for (var column in structures[database]) {
                saveData[column] = payload[column];
            }

            databases[database].create(saveData);

            console.log('Saving data...');

            databases[database].sync();

            console.log('Data saved');

            reply().redirect('/view/' + database);
        }
    });

    server.start((err) => {
        if (err) {
            throw err;
        }
        console.log(`Server running at: ${server.info.uri}`);
    });

})();
