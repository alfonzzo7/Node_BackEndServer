// Requires
var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

// Inicializar variables
var app = express();

// Schema
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// default options
app.use(fileUpload());

//=============================================================
// Subir archivo
//=============================================================
app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    // Colecciones permitidas
    var tiposValid = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValid.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válido',
            error: { message: 'Los tipos de colección validos son ' + tiposValid.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No se recibio ningún archivo',
            error: { message: 'No se recibio ningún archivo' }
        });
    }

    // Obtener nombre del archivo
    var file = req.files.img;
    var nombreCortado = file.name.split('.');
    var ext = nombreCortado[nombreCortado.length - 1];

    // Extensiones validadas
    var extValid = ['png', 'jpg', 'gif', 'jpeg'];

    if (extValid.indexOf(ext) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            error: { message: 'Las extensiones validas son ' + extValid.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    var fileName = `${id}-${new Date().getMilliseconds()}.${ext}`;

    // Mover el archivo a un path
    var path = `./uploads/${tipo}/${fileName}`;

    file.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                error: err
            });
        }

        subirPorTipo(tipo, id, fileName, path, res);
    });
});

function subirPorTipo(tipo, id, fileName, path, res) {
    switch (tipo) {
        case 'hospitales':
            Hospital.findById(id, (err, hospital) => {
                if (err) {
                    // Eliminar archivo
                    fs.unlinkSync(path);
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar el hospital',
                        error: err
                    });
                }
                if (!hospital) {
                    // Eliminar archivo
                    fs.unlinkSync(path);
                    return res.status(400).json({ ok: false, mensaje: 'Este hospital no existe' });
                }

                var oldPath = `./uploads/hospitales/${hospital.img}`;

                // Si existe imagen anterior se elimina
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }

                hospital.img = fileName;

                hospital.save((err, Actualizado) => {
                    if (err) {
                        // Eliminar archivo
                        fs.unlinkSync(path);
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar hospital',
                            error: err
                        });
                    }

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada',
                        hospital: Actualizado
                    });
                });
            });
            break;

        case 'medicos':
            Medico.findById(id, (err, medico) => {
                if (err) {
                    // Eliminar archivo
                    fs.unlinkSync(path);
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar el medico',
                        error: err
                    });
                }
                if (!medico) {
                    // Eliminar archivo
                    fs.unlinkSync(path);
                    return res.status(400).json({ ok: false, mensaje: 'Este medico no existe' });
                }

                var oldPath = `./uploads/medicos/${medico.img}`;

                // Si existe imagen anterior se elimina
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }

                medico.img = fileName;

                medico.save((err, medicoActualizado) => {
                    if (err) {
                        // Eliminar archivo
                        fs.unlinkSync(path);
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar medico',
                            error: err
                        });
                    }

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada',
                        medico: medicoActualizado
                    });
                });
            });
            break;

        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {
                if (err) {
                    // Eliminar archivo
                    fs.unlinkSync(path);
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar el usuario',
                        error: err
                    });
                }
                if (!usuario) {
                    // Eliminar archivo
                    fs.unlinkSync(path);
                    return res.status(400).json({ ok: false, mensaje: 'Este usuario no existe' });
                }

                var oldPath = `./uploads/usuarios/${usuario.img}`;

                // Si existe imagen anterior se elimina
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }

                usuario.img = fileName;

                usuario.save((err, usuarioActualizado) => {
                    if (err) {
                        // Eliminar archivo
                        fs.unlinkSync(path);
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar usuario',
                            error: err
                        });
                    }

                    usuarioActualizado.password = ':-)';

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado
                    });
                });
            });
            break;
    }
}

module.exports = app;