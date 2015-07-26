'use strict';

var config = require("./../config")
    , log = require("../lib/log")
    , util = require("util")
    , path = require('path')
    , c = require("../constants")
    , tc = require('../tests/constants')
    , fs = require('fs')
    , jade = require('jade')
    , async = require('async')
    , randomString = require('random-string')
    , mandrill = require('mandrill-api/mandrill')
    , mandrill_client = new mandrill.Mandrill(config.get('MANDRILL_API_KEY'))
    , BASE_URL = 'http://' + config.get('HOST') + ':' + config.get('PORT');

function sendMailUser(params, callback) {

    if (typeof callback !== 'function') callback = function () {
    };

    var html, subject;

    params.BASE_URL = BASE_URL;
    params.mailId = randomString({length: 20}) + (new Date).getTime();

    //log.debug('sendMailUser: ' + util.inspect(params));

    switch (params.email_type) {
        case c.EMAIL_TYPE_USER_EMAIL_CONFIRMATION:
            html = jade.renderFile(path.normalize(__dirname + '/../views/email/user_email_verification.jade'), params, null);
            subject = 'E-mail verification';
            break;
        case c.EMAIL_TYPE_USER_PASSWORD_RESET:
            html = jade.renderFile(path.normalize(__dirname + '/../views/email/user_email_password_reset.jade'), params, null);
            subject = 'Password reset';
            break;
        default:
            log.error("Unexpected email type " + util.inspect(params));
            return callback(new Error('Unexpected email type'));
    }

    fs.writeFile(__dirname + '/../public/email/' + params.mailId + '.html', html, 'utf8', function (err) {
        if (err) log.error(util.inspect(err));
    });

    async.waterfall([function (callback) {
        try {
            if (!params.user) {

                if (!params.user_id) {
                    return callback(new Error('sendMailUser: User id must be specified'));
                }

                /**
                 * Get user info
                 */
                require('../models').User.findById(params.user_id).then(function (user) {

                    if (!user) return callback(new Error('sendMailUser: User not found by id: ' + params.user_id));
                    params.user = user.get();
                    callback();

                }).catch(callback);

            } else {
                callback();
            }
        } catch (err) {
            console.log(err);
        }
    }, function (callback) {

        var message = {
            html: html,
            subject: subject,
            from_email: 'mailer@TODO.com',
            from_name: 'TODO.com',
            to: [{
                "email": params.user.email,
                "name": params.user.username,
                "type": "to"
            }],
            headers: {
                "Reply-To": params.reply_to || 'mailer@TODO.com'
            },
            auto_text: true
        };

        if ([tc.TEST_EMAIL, tc.TEST_EMAIL2, tc.TEST_EMAIL3].indexOf(params.user.email) !== -1) {
            log.debug('Do not send to the test email');
            return callback();
        }

        mandrill_client.messages.send({
            message: message
        }, function (result) {
            callback(null, result);
        }, callback);

    }], function (err, result) {

        if (err) {
            log.error('sendMailUser: A mandrill error occurred: ' + err.name + ' - ' + err.message);
        } else {

            /*
             [{
             "email": "recipient.email@example.com",
             "status": "sent",
             "reject_reason": "hard-bounce",
             "_id": "abc123abc123abc123abc123abc123"
             }]
             */

            if (result && result[0].status !== 'sent') {
                log.error('sendMailUser: Unable to send mail. Info: ' + util.inspect(result));
            }
        }

        callback();
    });

}

function sendMailService(params) {

    return log.debug('Do not send service message'); // TODO

    var html, subject;

    params.BASE_URL = BASE_URL;
    params.mailId = randomString({length: 20}) + (new Date).getTime();

    //log.debug('sendMailUser: ' + util.inspect(params));

    switch (params.email_type) {
        // TODO
        default:
            return log.error("Unexpected email type " + util.inspect(params));
    }

    var message = {
        html: html,
        subject: subject || 'System notification',
        from_email: 'mailer@TODO.com',
        from_name: 'TODO.com',
        to: [{
            "email": config.get('ADMIN_MAIL'),
            "name": 'Admin',
            "type": "to"
        }],
        headers: {
            "Reply-To": 'mailer@TODO.com'
        },
        auto_text: true
    };
    mandrill_client.messages.send({
        message: message
    }, function (result) {

        /*
         [{
         "email": "recipient.email@example.com",
         "status": "sent",
         "reject_reason": "hard-bounce",
         "_id": "abc123abc123abc123abc123abc123"
         }]
         */

        if (result[0].status !== 'sent') {
            log.error('sendMailService: Unable to send mail. Info: ' + util.inspect(result));
        }

    }, function (err) {
        log.error('sendMailService: A mandrill error occurred: ' + err.name + ' - ' + err.message);
    });
}

module.exports = {
    sendMailUser: sendMailUser,
    sendMailService: sendMailService
};