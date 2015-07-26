'use strict';

var ControllerBase = require('../base')
    , util = require('util');

function Controller(req, res) {
    Controller.super_.apply(this, arguments);

    this.res.locals.data.seo = {
        title: 'Forgot password title',
        description: 'Forgot password description',
        keywords: 'Forgot password keywords'
    };

    this.template = 'user/forgot_password';
}

util.inherits(Controller, ControllerBase);

module.exports = function (req, res, next) {
    var ctrl = new Controller(req, res);

    switch (req.method) {
        case 'GET':
            ctrl.respond();
            break;
        case 'POST':
            ctrl.models.User.requestPasswordResetCode(req.body.email, function(err) {
                if (err) {
                    ctrl.flushError(err.message);
                } else {
                    ctrl.flushSuccess('Please, check your E-mail');
                }
                ctrl.redirect('/');
            });
            break;
        default:
            ctrl.respond({code: 400, message: 'Unexpected HTTP request, ' + req.method + ': ' + req.path});
            break;
    }
};