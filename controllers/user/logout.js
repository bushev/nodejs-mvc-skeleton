'use strict';

var ControllerBase = require('../base')
    , util = require('util');

function Controller(req, res) {
    Controller.super_.apply(this, arguments);
}

util.inherits(Controller, ControllerBase);

module.exports = function (req, res, next) {
    var ctrl = new Controller(req, res);

    switch (req.method) {
        case 'GET':
            req.session.destroy(function (err) {
                if (err) ctrl.log.error(err);
                ctrl.redirect('/');
            });
            break;
        default:
            ctrl.respond({code: 400, message: 'Unexpected HTTP request, ' + req.method + ': ' + req.path});
            break;
    }
};