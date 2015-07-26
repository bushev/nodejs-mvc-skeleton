var c = require('../../../constants')
    , config = require('../../../config/index')
    , BASE_URL = 'http://' + config.get('HOST') + ':' + config.get('PORT');

module.exports = {

    "Load index page": function (browser) {
        browser
            .url(BASE_URL)
            .waitForElementVisible('//h1[contains(text(), "nodejs-mvc-skeleton")]', 1000)
    },

    "Error page": function (browser) {
        browser
            .url(BASE_URL + '/route_with_error')
            .waitForElementVisible('//h1[contains(text(), "Error: Oops, error occurred!")]', 1000)
    },

    "End of test": function (browser) {
        browser.end()
    }
};