const express = require('express');
const app = express();

const { verificaToken } = require('../middlewares/autenticacion');

let Producto = require('../models/producto');


// ===============================
// Obtener todos los productos
// ===============================
app.get('/productos', (req, res) => {
    // trae todos los productos
    // populate: usuario categoria
    // paginado
    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 5;
    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            if (!productos) {
                return res.status(204).json({
                    ok: false,
                    err: {
                        message: 'No existen productos'
                    }
                })
            }

            res.json({
                ok: true,
                productos
            })
        });
});

// ===============================
// Obtener un producto por ID
// ===============================
app.get('/productos/:id', (req, res) => {
    // populate: usuario categoria
    let id = req.params.id;
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!producto) {
                return res.status(404).json({
                    ok: false,
                    err: {
                        message: 'No se ha encontrado el producto solicitado'
                    }
                })
            }

            res.json({
                ok: true,
                producto
            })
        });
});

// ===============================
// Obtener todos los productos
// ===============================
app.get('/productos/buscar/:termino', (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            if (!productos) {
                return res.status(204).json({
                    ok: false,
                    err: {
                        message: 'No existen productos'
                    }
                })
            }

            res.json({
                ok: true,
                productos
            })
        });
});

// ===============================
// Crear un nuevo producto
// ===============================
app.post('/productos', verificaToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado
    let idUsuario = req.usuario._id;
    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: idUsuario
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    });
});

// ===============================
// Actualizar un producto
// ===============================
app.put('/productos/:id', verificaToken, (req, res) => {
    let body = req.body;
    let id = req.params.id;
    let producto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria
    }

    Producto.findByIdAndUpdate(id, producto, { new: true, runValidators: true, context: 'query' }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se ha encontrado el producto para actualizar'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        })
    });
});

// ===============================
// Borrar un producto
// ===============================
app.delete('/productos/:id', verificaToken, (req, res) => {
    // no borrar fisicamente, solo poner disponible a false
    let id = req.params.id;
    let disponibilidad = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id, disponibilidad, { new: true, runValidators: true, context: 'query' }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'No se ha encontrado el producto para actualizar'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        })
    });
});




module.exports = app;