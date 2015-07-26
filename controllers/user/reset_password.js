'use strict';

var ControllerBase = require('../base')
    , util = require('util');

function Controller(req, res) {
    Controller.super_.apply(this, arguments);

    this.res.locals.data.seo = {
        title: 'Reset password title',
        description: 'Reset password description',
        keywords: 'Reset password keywords'
    };

    this.template = 'user/reset_password';
}

util.inherits(Controller, ControllerBase);

module.exports = function (req, res, next) {
    var ctrl = new Controller(req, res);

    switch (req.method) {
        case 'GET':
            ctrl.res.locals.data.code = req.params.code;
            ctrl.respond();
            break;
        case 'POST':
            ctrl.models.User.setNewPassword({
                code: req.body.code,
                password: req.body.password,
                password2: req.body.password2
            }, function (err) {
                if (err) {
                    ctrl.flushError(err.message);
                    ctrl.redirect('/');
                } else {
                    ctrl.flushSuccess('Password was successfully changed. Please, login with new password');
                    ctrl.redirect('/login');
                }
            });
            break;
        default:
            ctrl.respond({code: 400, message: 'Unexpected HTTP request, ' + req.method + ': ' + req.path});
            break;
    }
};