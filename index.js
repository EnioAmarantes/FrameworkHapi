'use strict';

const Hapi = require('hapi');
const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

//Criação do Servidor no ip local e na porta 3080
const server = Hapi.server({
    port: 3080,
    host: 'localhost'
});

//Criação de um GET básico com o Hapi
server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
        return 'Hello World!';
    }
})

//Método que retorna uma lista de livros salvas em um arquivo JSON
server.route({
    method: 'GET',
    path: '/livros',
    options: {
        handler: async (request, h) => {
            const livros = await readFile('./livros.json', 'utf-8');
            return h.response(JSON.parse(livros));
        }
    }
})

//Método que insere um novo livro no arquivo JSON
server.route({
    method: 'POST',
    path: '/livros',
    options: {
        handler: async (request, h) => {
            const livro = request.payload;
            let livros = await readFile('./livros.json', 'utf8');
            livros = JSON.parse(livros);

            livro.id = livros.length + 1;
            livros.push(livro);
            await writeFile('./livros.json', JSON.stringify(livros, null, 2), 'utf8');
            return h.response(livros).code(200);
        }
    }
});

//Método que altera um livro de um arquivo JSON
server.route({
    method: 'PUT',
    path: '/livros/{id}',
    options: {
        handler: async (request, h) => {
            const updBook = JSON.parse(JSON.stringify(request.payload));
            const id = request.params.id;
            let livros = await readFile('./livros.json', 'utf8');
            livros = JSON.parse(livros);

            livros.forEach((livros) => {
                if (livros.id == id) {
                    livros.titulo = updBook.titulo;
                    livros.autor = updBook.autor;
                }
            });
            await writeFile('./livros.json', JSON.stringify(livros, null, 2), 'utf8');
            return h.response(livros).code(200);
        }
    }
});

//Método que remove um livro de um arquivo JSON
server.route({
    method: 'DELETE',
    path: '/livros/{id}',
    options: {
        handler: async (request, h) => {
            const updBook = JSON.parse(request.payload);
            const id = request.params.id;
            let livros = await readFile('./livros.json', 'utf8');
            livros = JSON.parse(livros);

            livros = livros.filter(livros => livros.id != id);
            await writeFile('./livros.json', JSON.stringify(livros, null, 2), 'utf8');
            return h.response(livros).code(200);
        }
    }
});

server.route({
    method: 'GET',
    path: '/view',
    handler: function (request, h) {
        return h.view('index', {message: "Mensagem recebida com sucesso"});
    }
})

//Declaração do método que inicia o Servidor
const init = async () => {

    await server.register(require('vision'));

    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        path: 'templates'
    });

    await server.start();
    console.log(`Servidor escutando em %s`, server.info.uri);
};

//Plugin do framework para captura de erros
process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

//Execução do método que levanta o servidor
init();