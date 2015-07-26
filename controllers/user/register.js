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

    this.template = 'user/register';
}

util.inherits(Controller, ControllerBase);

module.exports = function (req, res, next) {
    var ctrl = new Controller(req, res);

    switch (req.method) {
        case 'GET':
            ctrl.respond();
            break;
        case 'POST':
            ctrl.models.User.register(req, function (err) {
                if (!err) ctrl.flushInfo('Please, check your E-mail');
                ctrl.respond(err);
            });
            break;
        default:
            ctrl.respond({code: 400, message: 'Unexpected HTTP request, ' + req.method + ': ' + req.path});
            break;
    }
};