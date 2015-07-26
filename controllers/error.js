'use strict';

var ControllerBase = require('./base')
    , util         = require('util');

function Controller(req, res) {
    Controller.super_.apply(this, arguments);

    this.template = 'error';
}

util.inherits(Controller, ControllerBase);

module.exports = function (err, req, res, next) {
    var ctrl = new Controller(req, res);

    ctrl.log_error(util.inspect(err));
    ctrl.log_error(util.inspect(err.stack));

    if (err.name && err.name === 'SequelizeValidationError') {
        var errors = [];

        err.errors.forEach(function (error) {
            errors.push(error.message);
        });

        ctrl.respond(new Error(JSON.stringify(errors)));
    } else {
        ctrl.respond(new Error(err));
    }
};