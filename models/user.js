"use strict";

var c = require('../constants')
    , log = require('../lib/log')
    , util = require('util')
    , randomString = require('random-string')
    , bcrypt = require('bcryptjs')
    , models = require('./index')
    , _ = require('underscore')
    , async = require('async')
    , config = require('../config')
    , passport = require('passport')
    , mail = require('../lib/mail');

module.exports = function (sequelize, DataTypes) {
    var User = sequelize.define("User", {

        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER.UNSIGNED
        },

        user_state: {
            allowNull: false,
            type: 'TINYINT UNSIGNED',
            defaultValue: c.USER_STATE_NEW,
            validation: {
                isIn: {
                    args: [[c.USER_STATE_NEW, c.USER_STATE_ACTIVE, c.USER_STATE_BLOCKED]],
                    msg: 'Wrong user_state'
                }
            }
        },

        is_admin: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },

        username: {
            type: DataTypes.STRING
        },

        email: {
            allowNull: false,
            unique: true,
            type: DataTypes.STRING(128),
            validate: {
                isEmail: {msg: 'Wrong E-mail address'}
            }
        },

        email_verification_code: {
            /**
             * Used only once
             */
            type: DataTypes.STRING(20)
        },

        password_reset_code: {
            type: DataTypes.STRING(20)
        },

        password: {
            allowNull: false,
            type: DataTypes.STRING,
            set: function (v) {
                var hash = bcrypt.hashSync(v, 8);
                this.setDataValue('password', hash);
            }
        }

    }, {
        underscored: true,
        tableName: 'users',
        indexes: [{
            fields: ['user_state']
        }, {
            fields: ['email']
        }],
        hooks: {
            beforeValidate: function (user, options, fn) {

                if (typeof user.email_verification_code === 'undefined') {
                    user.email_verification_code = randomString({
                        length: 20,
                        numeric: true,
                        letters: true,
                        special: false
                    });
                }

                fn(null, user);
            },
            afterCreate: function (user, options, fn) {

                mail.sendMailUser({
                    email_type: c.EMAIL_TYPE_USER_EMAIL_CONFIRMATION,
                    user: user.get()
                });

                fn(null, user);
            }
        },
        instanceMethods: {
            updatePassword: function (req, callback) {
                var $this = this;

                console.log($this.password + ', ' + req.body.current_password);

                if (!bcrypt.compareSync(req.body.current_password, $this.password)) {
                    return callback(new Error('Wrong current password'));
                }

                if (!req.body.new_password) {
                    return callback(new Error('Your must specify new password'));
                }

                if (req.body.new_password !== req.body.new_password2) {
                    return callback(new Error('Your passwords doesn\'t match'));
                }

                $this.updateAttributes({password: req.body.new_password}).then(function () {

                    callback();

                }).catch(callback);
            }
        },
        classMethods: {
            register: function (req, callback) {

                if (!req.body.terms) {
                    return callback(new Error('You must agree to the terms'));
                }

                if (!req.body.password || !req.body.password2) {
                    return callback(new Error('You must specify the passwords'));
                }

                if (req.body.password !== req.body.password2) {
                    return callback(new Error('Your passwords doesn\'t match'));
                }

                User.findOrCreate({
                    where: {email: req.body.email},
                    defaults: req.body
                }).spread(function (user, created) {

                    if (created) {
                        callback();
                    } else {
                        callback(new Error('E-mail address already in use'));
                    }

                }).catch(function (err) {
                    callback(err);
                });
            },
            login: function (req, callback) {

                passport.authenticate('local', function (err, user) {
                    if (err) {
                        log.error(err);
                        return callback(err);
                    }
                    if (!user) {
                        return callback(new Error('Wrong E-mail or password'));
                    }
                    if (user.email_verification_code) {
                        return callback(new Error('E-mail not verified'));
                    }

                    req.logIn(user, function (err) {
                        if (err) {
                            return callback(err);
                        }
                        log.debug('Logged... OK');
                        callback();
                    });
                })({body: {username: req.body.email, password: req.body.password}});
            },
            verifyEmail: function (code, callback) {
                var $this = this;

                $this.findOne({where: {email_verification_code: code}}).then(function (user) {
                    if (!user) return callback(new Error('Wrong confirmation code'));

                    user.updateAttributes({email_verification_code: null}).then(function () {

                        callback();

                    }).catch(function (err) {
                        return callback(err);
                    });

                }).catch(function (err) {
                    return callback(err);
                })
            },
            /**
             *
             * @param email
             * @param callback
             */
            requestPasswordResetCode: function (email, callback) {
                var $this = this;

                $this.findOne({where: {email: email}}).then(function (user) {

                    if (!user) return callback(new Error('E-mail address not registered'));

                    user.updateAttributes({
                        password_reset_code: randomString({
                            length: 20,
                            numeric: true,
                            letters: true,
                            special: false
                        })
                    }).then(function (user) {

                        mail.sendMailUser({
                            email_type: c.EMAIL_TYPE_USER_PASSWORD_RESET,
                            user: user.get()
                        }, function (err) {

                            if (err) {
                                log.error(err);
                                return callback(new Error(c.INTERNAL_ERROR_MESSAGE))
                            }

                            callback();
                        });

                    }).catch(function (err) {
                        log.error(err);
                        return callback(new Error(c.INTERNAL_ERROR_MESSAGE))
                    });

                }).catch(function (err) {
                    log.error(err);
                    return callback(new Error(c.INTERNAL_ERROR_MESSAGE))
                });
            },
            /**
             *
             * @param data
             * @param callback
             */
            setNewPassword: function (data, callback) {
                var $this = this;

                if (!data.password || !data.password2) {
                    return callback(new Error('You must specify the passwords'));
                }

                if (data.password !== data.password2) {
                    return callback(new Error('Your passwords doesn\'t match'));
                }

                $this.findOne({where: {password_reset_code: data.code}}).then(function (user) {

                    if (!user) return callback(new Error('Wrong reset code'));

                    user.updateAttributes({
                        password_reset_code: null,
                        password: data.password
                    }).then(function () {

                        callback();

                    }).catch(function (err) {
                        log.error(err);
                        return callback(new Error(c.INTERNAL_ERROR_MESSAGE))
                    });

                }).catch(function (err) {
                    log.error(err);
                    return callback(new Error(c.INTERNAL_ERROR_MESSAGE))
                });
            },
            buildConditions: function ($andArray, $filterArray) {

                var where = {};

                if ($filterArray.keyword) {
                    where = {
                        $or: [
                            {
                                email: {
                                    $like: '%' + $filterArray.keyword + '%'
                                }
                            },
                            {
                                username: {
                                    $like: '%' + $filterArray.keyword + '%'
                                }
                            }
                        ]
                    }
                }

                if (!_.isEmpty(where)) {
                    $andArray.push(where);
                }

                return $andArray;
            }
        }
    });

    return User;
};