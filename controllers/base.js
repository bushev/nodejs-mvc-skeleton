'use strict';

var log = require('../lib/log')
    , models = require('../models')
    , moment = require('moment')
    , merge = require('merge')
    , c = require('../constants')
    , async = require('async')
    , _ = require('underscore')
    , util = require('util')
    , viewHelper = require('../lib/viewHelper');

function ControllerBase(req, res) {
    this.req = req;
    this.res = res;
    this.log = log;
    this.res.locals.data = {};
    this.res.locals.user = req.user;
    this.res.locals.flashMessages = [];
    this.debug = true;
    this.cache_lifetime = 3600;

    this.async = async;
    this.models = models;
    this.merge = merge;
    this.c = c;
    this._ = _;

    this.init();
}

ControllerBase.prototype.init = function () {
    var $this = this;

    $this.model_name = null;

    for (var helper in viewHelper) {
        if (viewHelper.hasOwnProperty(helper)) {
            $this.res.locals[helper] = viewHelper[helper];
        }
    }

    $this.res.locals.c = c;
    $this.res.locals.moment = moment;

    //$this.log_debug('ControllerBase::init');
};

ControllerBase.prototype.flushSuccess = function (message) {
    var $this = this;
    if ($this.req.flash) {
        $this.req.flash('success', message);
    }
};

ControllerBase.prototype.flushInfo = function (message) {
    var $this = this;
    if ($this.req.flash) {
        $this.req.flash('info', message);
    }
};

ControllerBase.prototype.flushWarning = function (message) {
    var $this = this;
    if ($this.req.flash) {
        $this.req.flash('warning', message);
    }
};

ControllerBase.prototype.flushError = function (message) {
    var $this = this;
    $this.log.error(message);
    if ($this.req.flash) {
        $this.req.flash('danger', message);
    }
};

ControllerBase.prototype.respond = function (err) {
    var $this = this;

    if (err) {
        $this.log_debug(err.stack);
        if ($this.isApi()) {
            $this.log_debug('respond: render API error');
            return $this.res.send({result: c.RETURN_ERR, error: err.message});
        } else {
            $this.log_debug('respond: set error');
            $this.flushError(err.message);
            $this.res.locals.data.error = err;
            $this.res.status(err.code || 500);
        }
    }

    if ($this.redirect_url) {
        $this.log_debug('respond: make redirect');
        return $this.redirect($this.redirect_url);
    }

    if ($this.isApi()) {
        $this.log_debug('respond: render API OK');
        $this.res.send({result: c.RETURN_OK});
    } else {
        $this.log_debug('respond: render OK');
        $this.res.render($this.template);
    }
};


ControllerBase.prototype.redirect = function (path) {
    var $this = this;

    if ($this.isApi()) {
        $this.res.send({result: c.RETURN_OK, location: path});
    } else {
        $this.res.redirect('/redirect/?url=' + path);
    }
};

ControllerBase.prototype.getModel = function () {
    var $this = this;

    if (!$this.model_name) {
        throw new Error("Model Name not specified");
    }

    $this.model = models[$this.model_name];

    return $this.model;
};

ControllerBase.prototype.getUserState = function (req) {
    var $this = this;
    var $context = $this.getContext();

    if (!req.session.states) {
        req.session.states = {};
    }

    if (!req.session.states[$context]) {
        req.session.states[$context] = {};
    }


    return req.session.states[$context];
};

ControllerBase.prototype.getContext = function () {
    var $this = this;

    if ($this.className) {
        return $this.className;
    }

    var slugify = require("underscore.string/slugify");
    var context = slugify($this.model_name + '-' + $this.constructor.name);

    return context;
};

ControllerBase.prototype.setUserState = function (state) {
    var $this = this;
    var $context = $this.getContext();

    if (!$this.req.session.states) {
        $this.req.session.states = {};
    }

    $this.req.session.states[$context] = state;

    return $this;
};

ControllerBase.prototype.isAdminRoute = function () {
    return this.req.route.path.indexOf('/admin') === 0;
};

ControllerBase.prototype.log_debug = function (message, force) {
    var $this = this;

    if ($this.debug || force) {
        $this.log.debug('Controller (' + $this.model_name + '): ' + message);
    }
};

ControllerBase.prototype.log_error = function (message) {
    var $this = this;

    $this.log.error('Controller (' + $this.model_name + '): ' + message);
};

ControllerBase.prototype.isApi = function () {
    var $this = this;

    if (($this.req.headers['content-type'] && $this.req.headers['content-type'].indexOf('application/json') === 0) || $this.req.headers['api']) {
        return true;
    }

    return false;
};

module.exports = ControllerBase;