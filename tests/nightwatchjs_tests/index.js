var c        = require('../../constants')
    , tc     = require('../constants')
    , models = require('../../models')
    , config = require('../../config');

module.exports = {

    "Load index page": function (browser) {
        browser
            .useXpath()
            .url("http://localhost:8080")
            .waitForElementVisible('//h1[contains(text(), "nodejs-mvc-skeleton")]', 1000)
            .end()

    }

};