var models = require('../models')
    , async = require('async')
    , tc = require('./constants')
    , util = require('util')
    , log = require('../lib/log');

module.exports = {
    destroyAllTestUsers: function (callback) {
        models.User.findAll({
            where: {
                email: {
                    $in: [tc.TEST_EMAIL, tc.TEST_EMAIL_2, tc.TEST_EMAIL_3]
                }
            }
        }).then(function (users) {

            async.eachSeries(users, function (user, callback) {

                user.destroy().then(function () {
                    callback();
                }).catch(function (err) {
                    log.error(util.inspect(err));
                    callback();
                });

            }, function (err) {
                if (err) log.error(util.inspect(err));
                callback();
            });

        }).catch(function (err) {
            log.error(util.inspect(err));
            callback(err);
        });
    }
};