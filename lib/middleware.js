'use strict';

var config          = require('../config')
    , LocalStrategy = require('passport-local').Strategy
    , log           = require('../lib/log');

module.exports = {
    strictDomain: function (req, res, next) {

        if (config.get('allowed_domains').indexOf(req.get('host')) !== -1) {
            log.debug('Host not allowed: ' + req.get('host'));
            return next(new Error('Host not allowed'));
        }

        next();
    },
    passportLocalStrategy: new LocalStrategy(function (username, password, callback) {
        this.passportDeserializeUser('local:' + username, function (error, user) {
            if (error) {
                if (error.name == 'NotFoundError') {
                    callback(null, false, {message: 'Incorrect username'});
                } else {
                    callback(error);
                }
            } else {
                if (user) {
                    if (passportApi.checkPassword(user, password)) {
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

        var strategy = id.split(":")[0];
        var username = id.split(":")[1];

        models.User.findOne({
            where: Sequelize.or({email: username}, {id: username})
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
    }
};