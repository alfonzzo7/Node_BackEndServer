// Requires
var express = require('express');

var mdAuth = require('../middlewares/auth');

var fs = require('fs');

// Inicializar variables
var app = express();

// Schema
var Hospital = require('../models/hospital');

//=============================================================
// Obtener todos los hospitales
//=============================================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    var todos = req.query.todos;
    if (todos) {
        Hospital.find({})
            .populate('usuario', 'nombre email img google')
            .exec(
                (err, hospitales) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando hospitales',
                            errors: err
                        });
                    }

                    Hospital.count({}, (err, total) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error cargando hospitales',
                                errors: err
                            });
                        }

                        res.status(200).json({
                            ok: true,
                            hospitales: hospitales,
                            total: total
                        });
                    });
                });
    } else {
        Hospital.find({})
            .skip(desde)
            .limit(5)
            .populate('usuario', 'nombre email img google')
            .exec(
                (err, hospitales) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando hospitales',
                            errors: err
                        });
                    }

                    Hospital.count({}, (err, total) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'Error cargando hospitales',
                                errors: err
                            });
                        }

                        res.status(200).json({
                            ok: true,
                            hospitales: hospitales,
                            total: total
                        });
                    });
                });
    }
});

//=============================================================
// Obtener hospital por ID
//=============================================================
app.get('/:id', (req, res, next) => {
    var id = req.params.id;

    Hospital.findById(id)
        .populate('usuario', 'nombre email img google')
        .exec(
            (err, hospital) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospital',
                        errors: err
                    });
                }

                if (!hospital) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: `Hospital con el id ${id} no existe`,
                        errors: { message: 'No existe un hospital con ese ID' }
                    });
                }

                res.status(200).json({
                    ok: true,
                    hospital: hospital
                });
            });
});

//=============================================================
// Crear un nuevo hospital
//=============================================================
app.post('/', mdAuth.verificaToken, (req, res) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

//=============================================================
// Actualizar hospital
//=============================================================
app.put('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id,
        (err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }

            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `Hospital con el id ${id} no existe`,
                    errors: { message: 'No existe un hospital con ese ID' }
                });
            }

            hospital.nombre = body.nombre;
            hospital.usuario = req.usuario._id;

            hospital.save((err, hospitalGuardado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar hospital',
                        errors: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    hospital: hospitalGuardado
                });
            });
        });
});

//=============================================================
// Eliminar hospital
//=============================================================
app.delete('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id,
        (err, hospitalBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al borrar hospital',
                    errors: err
                });
            }

            if (!hospitalBorrado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `Hospital con el id ${id} no existe`,
                    errors: { message: 'No existe un hospital con ese ID' }
                });
            }

            // Eliminamos imagen
            var oldPath = `./uploads/hospitales/${hospitalBorrado.img}`;

            // Si existe imagen anterior se elimina
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalBorrado
            });
        });
});

module.exports = app;