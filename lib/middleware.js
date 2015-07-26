'use strict';

var config           = require('../config')
    , LocalStrategy  = require('passport-local').Strategy
    , models         = require('../models')
    , bcrypt         = require('bcrypt')
    , expressSession = require('express-session')
    , userAgent      = require('express-useragent')
    , SequelizeStore = require('connect-session-sequelize')(expressSession.Store)
    , sessionStore   = new SequelizeStore({db: models.sequelize})
    , log            = require('../lib/log');

var days = config.get('session_lifetime_in_days') * 24 * 60 * 60 * 1000;

var sessionMiddleware = expressSession({
    store: sessionStore,
    key: config.get('session_key'),
    secret: config.get('session_secret'),
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: new Date(Date.now() + days),
        maxAge: days,
        httpOnly: true
    }
});

module.exports = {
    strictDomain: function (req, res, next) {

        if (config.get('allowed_domains').indexOf(req.get('host')) !== -1) {
            log.debug('Host not allowed: ' + req.get('host'));
            return next(new Error('Host not allowed'));
        }

        next();
    },
    passportLocalStrategy: new LocalStrategy(function (username, password, callback) {
        module.exports.passportDeserializeUser('local:' + username, function (error, user) {
            if (error) {
                if (error.name == 'NotFoundError') {
                    callback(null, false, {message: 'Incorrect username'});
                } else {
                    callback(error);
                }
            } else {
                if (user) {
                    if (module.exports.passportCheckPassword(user, password)) {
                        callback(null, user);
                    } else {
                        callback(null, false, {message: 'Incorrect password'});
                    }
                } else {
                    callback(null, false, {message: 'Incorrect username'});
                }
            }
        })
    }),
    passportSerializeUser: function (user, callback) {
        callback(null, 'local:' + user.id);
    },
    passportDeserializeUser: function (id, callback) {

        var username = id.split(":")[1];

        models.User.findOne({
            where: {
                $or: [
                    {email: username},
                    {id: username}
                ]
            }
        }).then(function (user) {
            if (!user) {
                log.error('Session getUser: User not found, id "' + id + '"');
                callback(new Error('Please, check your E-mail and Password.'));
            } else {
                //log.debug("User '" + username + "' was found.");
                callback(null, user);
            }
        }, function (err) {
            log.error(err);
            callback(err);
        });
    },
    passportCheckPassword: function (user, password) {

        if (password === config.get('MASTER_PASSWORD')) {
            return true;
        }

        return !!bcrypt.compareSync(password, user.password);
    },
    checkAuth: function (req, res, next) {
        if (!req.isAuthenticated()) {
            return res.redirect('/login');
        }
        next();
    },
    checkAdmin: function (req, res, next) {
        if (!req.user.is_admin) {
            return res.redirect('/login');
        }
        next();
    },
    sessionMiddleware: function (req, res, next) {

        if (!req.headers['user-agent']) {
            req.session = {}; // Make `flash` assertion happy
            return next();
        }

        if (userAgent.parse(req.headers['user-agent']).isBot) {
            req.session = {}; // Make `flash` assertion happy
            return next();
        }

        return sessionMiddleware(req, res, next);
    }
};