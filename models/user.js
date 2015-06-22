"use strict";

var c              = require('../constants')
    , log          = require('../lib/log')
    , randomString = require('random-string')
    , bcrypt       = require('bcryptjs')
    , mail         = require('../lib/mail');

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
                    args: [[c.USER_STATE_NEW, c.USER_STATE_ACTIVE, c.USER_STATE_BLOCKED]]
                }
            }
        },

        email: {
            allowNull: false,
            unique: true,
            type: DataTypes.STRING(128),
            validate: {
                isEmail: {msg: 'Wrong E-mail address'},
                isUnique: function (value, next) {
                    User.find({
                        where: {email: value},
                        attributes: ['id']
                    }).done(function (err, user) {
                        if (err) {
                            return next(err);
                        }
                        if (user) {
                            return next('E-mail address already in use');
                        }
                        next();
                    });
                }
            }
        },

        code: {
            allowNull: false,
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
            name: 'user_state_index',
            fields: ['user_state']
        }, {
            name: 'email_index',
            fields: ['email']
        }],
        hooks: {
            beforeValidate: function (user, options, fn) {

                if (typeof user.code === 'undefined') {
                    user.code = randomString({
                        length: 20,
                        numeric: true,
                        letters: true,
                        special: false
                    });
                }

                fn(null, user);
            },
            afterCreate: function (watcher, options, fn) {

                //mail.sendMailUser({
                //    email_type: c.EMAIL_TYPE_WATCHER_CONFIRMATION
                //}, watcher);

                fn(null, watcher);
            }
        },
        instanceMethods: {

        }
    });

    return User;
};