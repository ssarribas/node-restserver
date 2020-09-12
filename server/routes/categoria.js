const express = require('express');
const app = express();

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

let Categoria = require('../models/categoria');
// const bodyParser = require('body-parser');


// ============================
// Mostrar todas las categorias
// ============================
app.get('/categoria', (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categorias
            })
        });
});


// ============================
// Mostrar una categoria por ID
// ============================
app.get('/categoria/:id', (req, res) => {
    let id = req.params.id;
    Categoria.findById(id, (err, categoria) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoria) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se encontro una categoria con el ID indicado'
                }
            });
        }

        res.json({
            ok: true,
            categoria
        });
    });
});


// ============================
// Crear nueva categoria
// ============================
app.post('/categoria', verificaToken, (req, res) => {
    // regresa la nueva categoria
    let idUsuario = req.usuario._id;
    let body = req.body;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: idUsuario
    })

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


// ============================
// Actualizar una categoria
// ============================
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true, context: 'query' }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se ha encontrado la categoria para actualizar'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
});


// ============================
// Borrar una categoria
// ============================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    // solo un administrador puede borrar categorias
    // hay que verificar el token
    let id = req.params.id;

    // borrado fisico de categoria
    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se ha encontrado la categoria para borrar'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria borrada',
            categoria: categoriaDB
        });
    })
});



module.exports = app;