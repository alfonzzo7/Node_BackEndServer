// Requires
var express = require('express');

const path = require('path');
const fs = require('fs');

// Inicializar variables
var app = express();

// Rutas
app.get('/:tipo/:img', (req, res, next) => {
    var tipo = req.params.tipo;
    var img = req.params.img;

    var pathImg = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    } else {
        var pathNoImg = path.resolve(__dirname, `../assets/no-img.jpg`);
        res.sendFile(pathNoImg);
    }
});

module.exports = app;