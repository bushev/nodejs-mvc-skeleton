var c = require("../../../constants")
    , tc = require('../../constants')
    , models = require('../../../models/index')
    , log = require('../../../lib/log')
    , utils = require('../../utils')
    , config = require('../../../config/index')
    , BASE_URL = 'http://' + config.get('HOST') + ':' + config.get('PORT')
    , async = require('async');

module.exports = {

    before: function (browser, done) {
        utils.destroyAllTestUsers(done);
    },

    "Register, passwords doesn't match": function (browser) {
        browser
            .useXpath()
            .url(BASE_URL + '/register')
            .waitForElementVisible('//h2[contains(text(), "Register a new account")]', 1000)

            .setValue('//input[@name="username"]', tc.TEST_USERNAME)
            .setValue('//input[@name="email"]', tc.TEST_EMAIL)

            .setValue('//input[@name="password"]', tc.TEST_PASSWORD)
            .setValue('//input[@name="password2"]', 'oooooopssss')

            .click('//input[@name="terms"]')
            .click('//button[@type="submit"]')

            .waitForElementVisible('//div[contains(text(), "Your passwords doesn\'t match")]', 1000)
    },

    "Register, terms was not agreed": function (browser) {
        browser
            .useXpath()
            .url(BASE_URL + '/register')
            .waitForElementVisible('//h2[contains(text(), "Register a new account")]', 1000)

            .setValue('//input[@name="username"]', tc.TEST_USERNAME)
            .setValue('//input[@name="email"]', tc.TEST_EMAIL)

            .setValue('//input[@name="password"]', tc.TEST_PASSWORD)
            .setValue('//input[@name="password2"]', tc.TEST_PASSWORD)

            .click('//button[@type="submit"]')

            .waitForElementVisible('//div[contains(text(), "You must agree to the terms")]', 1000)
    },

    "Register": function (browser) {
        browser
            .useXpath()
            .url(BASE_URL + '/register')
            .waitForElementVisible('//h2[contains(text(), "Register a new account")]', 1000)

            .setValue('//input[@name="username"]', tc.TEST_USERNAME)
            .setValue('//input[@name="email"]', tc.TEST_EMAIL)

            .setValue('//input[@name="password"]', tc.TEST_PASSWORD)
            .setValue('//input[@name="password2"]', tc.TEST_PASSWORD)

            .click('//input[@name="terms"]')
            .click('//button[@type="submit"]')
            .waitForElementVisible('//div[contains(text(), "Please, check your E-mail")]', 1000)
    },

    "Register, E-mail is busy": function (browser) {
        browser
            .useXpath()
            .url(BASE_URL + '/register')
            .waitForElementVisible('//h2[contains(text(), "Register a new account")]', 1000)

            .setValue('//input[@name="username"]', tc.TEST_USERNAME)
            .setValue('//input[@name="email"]', tc.TEST_EMAIL)

            .setValue('//input[@name="password"]', tc.TEST_PASSWORD)
            .setValue('//input[@name="password2"]', tc.TEST_PASSWORD)

            .click('//input[@name="terms"]')
            .click('//button[@type="submit"]')

            .waitForElementVisible('//div[contains(text(), "E-mail address already in use")]', 1000)
    },

    "Log in, wrong password": function (browser) {
        browser
            .useXpath()
            .url(BASE_URL)

            .waitForElementVisible('//a[@href="/login"]', 1000)
            .click('//a[@href="/login"]')

            .setValue('//input[@name="email"]', tc.TEST_EMAIL)
            .setValue('//input[@name="password"]', 'wrong password')

            .click('//button[@type="submit"]')

            .waitForElementVisible('//div[contains(text(), "Wrong E-mail or password")]', 1000)
    },

    "Log in, E-mail not verified": function (browser) {
        browser
            .useXpath()
            .url(BASE_URL)

            .waitForElementVisible('//a[@href="/login"]', 1000)
            .click('//a[@href="/login"]')

            .setValue('//input[@name="email"]', tc.TEST_EMAIL)
            .setValue('//input[@name="password"]', tc.TEST_PASSWORD)

            .click('//button[@type="submit"]')

            .waitForElementVisible('//div[contains(text(), "E-mail not verified")]', 1000)
    },

    "Verify email, wrong code": function (browser) {
        browser
            .useXpath()
            .url(BASE_URL + '/verify_email/oooopsss')
            .waitForElementVisible('//div[contains(text(), "Wrong confirmation code")]', 1000)
    },

    "Verify email": function (browser, done) {
        models.User.findOne({where: {email: tc.TEST_EMAIL}}).then(function (user) {

            if (!user) {
                browser.assert.equal(new Error('TEST: User not found'), null);
                return done();
            }

            browser
                .useXpath()
                .url(BASE_URL + '/verify_email/' + user.email_verification_code)
                .waitForElementVisible('//div[contains(text(), "E-mail address was successfully verified!")]', 1000)
                .perform(function (browser, done) {
                    done();
                });

        }).catch(function (err) {
            browser.assert.equal(err, null);
            done();
        });
    },

    "Log in": function (browser) {
        browser
            .useXpath()
            .url(BASE_URL)

            .waitForElementVisible('//a[@href="/login"]', 1000)
            .click('//a[@href="/login"]')

            .setValue('//input[@name="email"]', tc.TEST_EMAIL)
            .setValue('//input[@name="password"]', tc.TEST_PASSWORD)

            .click('//button[@type="submit"]')

            .waitForElementVisible('//a[@href="/user/account"]', 100000)
    },

    "Change password, wrong current": function (browser) {
        browser
            .useXpath()
            .url(BASE_URL + '/user/account')

            .waitForElementVisible('//*[contains(text(), "Update password")]', 1000)

            .setValue('//input[@name="current_password"]', 'Wrong Password')
            .setValue('//input[@name="new_password"]', tc.TEST_PASSWORD_2)
            .setValue('//input[@name="new_password2"]', tc.TEST_PASSWORD_2)

            .click('//button[@name="update_password"]')

            .waitForElementVisible('//div[contains(text(), "Wrong current password")]', 1000)
    },

    "Change password": function (browser) {
        browser
            .useXpath()
            .url(BASE_URL + '/user/account')

            .waitForElementVisible('//*[contains(text(), "Update password")]', 1000)

            .setValue('//input[@name="current_password"]', tc.TEST_PASSWORD)
            .setValue('//input[@name="new_password"]', tc.TEST_PASSWORD_2)
            .setValue('//input[@name="new_password2"]', tc.TEST_PASSWORD_2)

            .click('//button[@name="update_password"]')

            .waitForElementVisible('//div[contains(text(), "Password was successfully updated!")]', 1000)
    },

    "Change password, not matched": function (browser) {
        browser
            .useXpath()
            .url(BASE_URL + '/user/account')

            .waitForElementVisible('//*[contains(text(), "Update password")]', 1000)

            .setValue('//input[@name="current_password"]', tc.TEST_PASSWORD_2)
            .setValue('//input[@name="new_password"]', 'The first password')
            .setValue('//input[@name="new_password2"]', 'Another one new')

            .click('//button[@name="update_password"]')

            .waitForElementVisible('//div[contains(text(), "Your passwords doesn\'t match")]', 1000)
    },

    "Change password back": function (browser) {
        browser
            .useXpath()
            .url(BASE_URL + '/user/account')

            .waitForElementVisible('//*[contains(text(), "Update password")]', 1000)

            .setValue('//input[@name="current_password"]', tc.TEST_PASSWORD_2)
            .setValue('//input[@name="new_password"]', tc.TEST_PASSWORD)
            .setValue('//input[@name="new_password2"]', tc.TEST_PASSWORD)

            .click('//button[@name="update_password"]')

            .waitForElementVisible('//div[contains(text(), "Password was successfully updated!")]', 1000)
    },

    "Log out": function (browser) {
        browser
            .useXpath()
            .url(BASE_URL)

            .waitForElementVisible('//a[@href="/user/logout"]', 1000)
            .click('//a[@href="/user/logout"]')

            .waitForElementVisible('//a[@href="/login"]', 1000)
            .waitForElementVisible('//a[@href="/register"]', 1000)
    },

    "Unauthorized access (/user/account)": function (browser) {
        browser
            .useXpath()
            .url(BASE_URL + '/user/account')
            .waitForElementVisible('//a[@href="/login"]', 1000)
    },

    "End of test": function (browser) {
        browser.end()
    },

    after: function (browser, done) {

        async.series([
            function (callback) { // Wait for server
                setTimeout(function () {
                    callback(null);
                }, 2500);
            },
            function (callback) {
                utils.destroyAllTestUsers(callback);
            }
        ], function (err) {
            if (err) log.error(err);
            done();
        });
    }
};