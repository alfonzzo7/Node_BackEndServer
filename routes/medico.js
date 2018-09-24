// Requires
var express = require('express');

var mdAuth = require('../middlewares/auth');

var fs = require('fs');

// Inicializar variables
var app = express();

// Schema
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');

//=============================================================
// Obtener todos los medicos
//=============================================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medico',
                        errors: err
                    });
                }

                Medico.count({}, (err, total) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando medicos',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: total
                    });
                });
            });
});

//=============================================================
// Crear un nuevo medico
//=============================================================
app.post('/', mdAuth.verificaToken, (req, res) => {
    var body = req.body;

    Hospital.findById(body.hospital,
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
                    mensaje: `Hospital con el id ${body.hospital} no existe`,
                    errors: { message: 'No existe un hospital con ese ID' }
                });
            }

            var medico = new Medico({
                nombre: body.nombre,
                usuario: req.usuario,
                hospital: hospital
            });

            medico.save((err, medicoGuardado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al crear medico',
                        errors: err
                    });
                }

                res.status(201).json({
                    ok: true,
                    medico: medicoGuardado
                });
            });
        });
});

//=============================================================
// Actualizar medico
//=============================================================
app.put('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id,
        (err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar medico',
                    errors: err
                });
            }

            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `Medico con el id ${id} no existe`,
                    errors: { message: 'No existe un medico con ese ID' }
                });
            }

            Hospital.findById(body.hospital,
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
                            mensaje: `Hospital con el id ${body.hospital} no existe`,
                            errors: { message: 'No existe un hospital con ese ID' }
                        });
                    }

                    medico.nombre = body.nombre;
                    medico.usuario = req.usuario._id;
                    medico.hospital = hospital;


                    medico.save((err, medicoGuardado) => {
                        if (err) {
                            return res.status(400).json({
                                ok: false,
                                mensaje: 'Error al actualizar medico',
                                errors: err
                            });
                        }

                        res.status(201).json({
                            ok: true,
                            medico: medicoGuardado
                        });
                    });
                });
        });
});

//=============================================================
// Eliminar medico
//=============================================================
app.delete('/:id', mdAuth.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id,
        (err, medicoBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al borrar medico',
                    errors: err
                });
            }

            if (!medicoBorrado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `Medico con el id ${id} no existe`,
                    errors: { message: 'No existe un medico con ese ID' }
                });
            }

            // Eliminamos imagen
            var oldPath = `./uploads/medicos/${usuarioBorrado.img}`;

            // Si existe imagen anterior se elimina
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            res.status(200).json({
                ok: true,
                medico: medicoBorrado
            });
        });
});

module.exports = app;