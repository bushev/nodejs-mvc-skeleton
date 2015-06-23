'use strict';

var ControllerBase = require('../base')
    , util = require('util');

function Controller(req, res) {
    Controller.super_.apply(this, arguments);

    this.res.locals.data.seo = {
        title: 'Register title',
        description: 'Register description',
        keywords: 'Register keywords'
    };

    this.template = 'register';
}

util.inherits(Controller, ControllerBase);

module.exports = function (req, res, next) {
    var ctrl = new Controller(req, res);

    switch (req.method) {
        case 'GET':
            ctrl.respond();
            break;
        case 'POST':
            // TODO
            ctrl.respond();
            break;
        default:
            ctrl.respond({code: 400, message: 'Unexpected HTTP request, ' + req.method + ': ' + req.path});
            break;
    }
};