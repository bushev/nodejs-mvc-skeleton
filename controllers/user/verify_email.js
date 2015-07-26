'use strict';

var ControllerBase = require('../base')
    , util = require('util');

function Controller(req, res) {
    Controller.super_.apply(this, arguments);

    this.res.locals.data.seo = {
        title: 'Verify E-mail title',
        description: 'Verify E-mail description',
        keywords: 'Verify E-mail keywords'
    };

    this.template = 'user/verify_email';
}

util.inherits(Controller, ControllerBase);

module.exports = function (req, res, next) {
    var ctrl = new Controller(req, res);

    switch (req.method) {
        case 'GET':
            ctrl.models.User.verifyEmail(req.params.code, function (err) {
                if (!err) ctrl.flushSuccess('E-mail address was successfully verified!');
                ctrl.respond(err);
            });
            break;
        default:
            ctrl.respond({code: 400, message: 'Unexpected HTTP request, ' + req.method + ': ' + req.path});
            break;
    }
};