// Requires
var express = require('express');

// Inicializar variables
var app = express();

// Schema
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//=============================================================
// Busqueda general
//=============================================================
app.get('/todo/:param', (req, res, next) => {
    var busqueda = req.params.param;
    var regex = new RegExp(busqueda, 'i');

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Promise.all([
            buscarHospitales(busqueda, regex, desde),
            buscarMedicos(busqueda, regex, desde),
            buscarUsuarios(busqueda, regex, desde)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });

});

//=============================================================
// Busqueda por colecciones
//=============================================================
app.get('/coleccion/:tabla/:param', (req, res, next) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.param;
    var regex = new RegExp(busqueda, 'i');

    var desde = req.query.desde || 0;
    desde = Number(desde);

    var promesa;

    switch (tabla) {
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex, desde);
            break;

        case 'medicos':
            promesa = buscarMedicos(busqueda, regex, desde);
            break;

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex, desde);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda soportados son: hospitales, medicos y usuarios',
                error: { menssage: 'Los tipos de busqueda soportados son: hospitales, medicos y usuarios' }
            });
    }

    promesa.then(respuesta => {
        res.status(200).json({
            ok: true,
            [tabla]: respuesta.tabla,
            total: respuesta.total
        });
    });

});

function buscarHospitales(busqueda, regex, desde) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .skip(desde)
            .limit(5)
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    Hospital.count({ nombre: regex })
                        .exec((err, total) => {
                            if (err) {
                                reject('Error al cargar hospitales', err);
                            }

                            resolve({ tabla: hospitales, total: total });
                        });
                }
            });
    });
}

function buscarMedicos(busqueda, regex, desde) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .skip(desde)
            .limit(5)
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    Medico.count({ nombre: regex })
                        .exec((err, total) => {
                            if (err) {
                                reject('Error al cargar medicos', err);
                            }

                            resolve({ tabla: medicos, total: total });
                        });
                }
            });
    });
}

function buscarUsuarios(busqueda, regex, desde) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role img google')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .skip(desde)
            .limit(5)
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    Usuario.count({})
                        .or([{ 'nombre': regex }, { 'email': regex }])
                        .exec((err, total) => {
                            if (err) {
                                reject('Error al cargar usuarios', err);
                            }

                            resolve({ tabla: usuarios, total: total });
                        });
                }
            });
    });
}

module.exports = app;