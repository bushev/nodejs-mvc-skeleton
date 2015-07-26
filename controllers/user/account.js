'use strict';

var ControllerBase = require('../base')
    , util = require('util');

function Controller(req, res) {
    Controller.super_.apply(this, arguments);

    this.res.locals.data.seo = {
        title: 'Account title',
        description: 'Account description',
        keywords: 'Account keywords'
    };

    this.template = 'user/account/index';
}

util.inherits(Controller, ControllerBase);

module.exports = function (req, res, next) {
    var ctrl = new Controller(req, res);

    //noinspection FallThroughInSwitchStatementJS
    switch (req.method) {
        case 'GET':
            ctrl.respond();
            break;
        case 'POST':
            if (req.body.update_password) {
                req.user.updatePassword(req, function (err) {
                    if (!err) ctrl.flushSuccess('Password was successfully updated!');
                    if (err) ctrl.flushError(err.message);
                    ctrl.redirect('/user/account');
                });
                break;
            }
        default:
            ctrl.respond({code: 400, message: 'Unexpected HTTP request, ' + req.method + ': ' + req.path});
            break;
    }
};