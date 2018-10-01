// Requires
var express = require('express');
var bcrypt = require('bcryptjs');

var mdAuth = require('../middlewares/auth');

var fs = require('fs');

// Inicializar variables
var app = express();

// Schema
var Usuario = require('../models/usuario');

//=============================================================
// Obtener todos los usuario
//=============================================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role google')
        .skip(desde)
        .limit(5)
        .exec(
            (err, usuario) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        errors: err
                    });
                }

                Usuario.count({}, (err, total) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error cargando usuarios',
                            errors: err
                        });
                    }

                    res.status(200).json({
                        ok: true,
                        usuarios: usuario,
                        total: total
                    });
                });

            });
});

//=============================================================
// Crear un nuevo usuario
//=============================================================
//app.post('/', mdAuth.verificaToken, (req, res) => {
app.post('/', (req, res) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        usuarioGuardado.password = ':-)';

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        });
    });
});

//=============================================================
// Actualizar usuario
//=============================================================
app.put('/:id', [mdAuth.verificaToken, mdAuth.verificaADMIN_ROLE_MismoUsuario], (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id,
        (err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                });
            }

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `Usuario con el id ${id} no existe`,
                    errors: { message: 'No existe un usuario con ese ID' }
                });
            }

            usuario.nombre = body.nombre;
            usuario.email = body.email;
            usuario.role = body.role;

            usuario.save((err, usuarioGuardado) => {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar usuario',
                        errors: err
                    });
                }

                usuarioGuardado.password = ':-)';

                res.status(200).json({
                    ok: true,
                    usuario: usuarioGuardado
                });
            });
        });
});

//=============================================================
// Eliminar usuario
//=============================================================
app.delete('/:id', [mdAuth.verificaToken, mdAuth.verificaADMIN_ROLE], (req, res) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id,
        (err, usuarioBorrado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al borrar usuario',
                    errors: err
                });
            }

            if (!usuarioBorrado) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `Usuario con el id ${id} no existe`,
                    errors: { message: 'No existe un usuario con ese ID' }
                });
            }

            usuarioBorrado.password = ':-)';

            // Eliminamos imagen
            var oldPath = `./uploads/usuarios/${usuarioBorrado.img}`;

            // Si existe imagen anterior se elimina
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }

            res.status(200).json({
                ok: true,
                usuario: usuarioBorrado
            });
        });
});

module.exports = app;