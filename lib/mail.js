'use strict';

var config          = require("./../config")
    , nodemailer    = require('nodemailer')
    , smtpTransport = require('nodemailer-smtp-transport')
    , merge         = require('merge')
    , htmlToText    = require('nodemailer-html-to-text').htmlToText
    , log           = require("../lib/log")
    , util          = require("util")
    , path          = require('path')
    , c             = require("../constants")
    , fs            = require('fs')
    , jade          = require('jade');

function sendMailUser(params, user, callback) {

    if (typeof callback !== 'function') callback = function () {
    };

    params = merge(params, {
        user: user.get()
    });

    log.debug('params = ' + util.inspect(params));

    var html, subject;

    switch (params.email_type) {
        case c.EMAIL_TYPE_USER_EMAIL_CONFIRMATION:
            html = jade.renderFile(path.normalize(__dirname + '/../views/email/user_email_confirmation.jade'), params, null);
            subject = 'E-mail verification';
            break;
        default:
            log.error("Unexpected email type " + util.inspect(params));
            return callback(new Error('Unexpected email type'));
    }

    sendMailSmtp({
        to: watcher.email,
        subject: subject,
        html: html
    }, function (err) {
        if (err) {
            log.error("Unable to send mail. " + util.inspect(err));
        }
        return callback(err);
    });
}

function sendMailSmtp(mail, callback) {

    var transporter = nodemailer.createTransport(smtpTransport({
        host: config.get('MAIL_SMTP_HOST'),
        port: config.get('MAIL_SMTP_PORT'),
        secure: true,
        auth: {
            user: config.get('MAIL_SMTP_USERNAME'),
            pass: config.get('MAIL_SMTP_PASSWORD')
        }
    }));

    transporter.use('compile', htmlToText());

    transporter.sendMail(merge(mail, {
        from: 'TODO <mailer@TODO>'
    }), function (err, info) {
        if (err) {
            log.error("Unable to send mail. " + util.inspect(err));
            callback(err);
        } else {
            log.debug("Message sent to '" + mail.to + " (" + mail.subject + ")': ", info.response);
            callback();
        }
    });
}

function sendMailService(mail) {

    var transporter = nodemailer.createTransport(smtpTransport({
        host: config.get('MAIL_SMTP_HOST'),
        port: config.get('MAIL_SMTP_PORT'),
        secure: true,
        auth: {
            user: config.get('MAIL_SMTP_USERNAME'),
            pass: config.get('MAIL_SMTP_PASSWORD')
        }
    }));

    transporter.use('compile', htmlToText());

    transporter.sendMail(merge(mail, {
        from: 'TODO.com notification <mailer@TODO>',
        to: 'bushevuvTODO'
    }), function (error, info) {
        if (error) {
            log.error("Unable to send mail. " + util.inspect(error));
        } else {
            log.debug("Message sent to '" + mail.to + " (" + mail.subject + ")': ", info.response);
        }
    });
}

module.exports = {
    sendMailUser: sendMailUser,
    sendMailService: sendMailService
};