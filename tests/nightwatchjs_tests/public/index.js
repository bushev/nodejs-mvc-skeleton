var c = require('../../../constants')
    , config = require('../../../config/index')
    , BASE_URL = 'http://' + config.get('HOST') + ':' + config.get('PORT');

module.exports = {

    "Load index page": function (browser) {
        browser
            .useXpath()
            .url(BASE_URL)
            .waitForElementVisible('//h1[contains(text(), "nodejs-mvc-skeleton")]', 1000)
    },

    //"Load terms page": function (browser) {
    //    browser
    //        .useXpath()
    //        .url(BASE_URL + '/terms')
    //        .waitForElementVisible('//p[contains(text(), "Service terms")]', 1000)
    //}

    "End of test": function (browser) {
        browser.end()
    }
};