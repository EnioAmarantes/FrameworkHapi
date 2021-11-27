'use strict';

const Hapi = require('hapi');

const init = async () => {

    const server = Hapi.server({
        port: 3080,
        host: 'localhost'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'Hello World!';
        }
    })

    server.route({
        method: 'GET',
        path: '/user',
        handler: function (request, h){
            const user = {
                firstName: 'John',
                lastName: 'Doe',
                userName: 'JohnDoe',
                id: 123
            }

            return user;
        }
    })

    await server.start();
    console.log(`Servidor escutando em %s`, server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();