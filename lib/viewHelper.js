'use strict';

var Tense = require('tense'),
    tense = new Tense();

module.exports = {
    resource_edit_patch: function (id, resource_name) {
        return '/' + resource_name.toLowerCase() + '/' + id + '/edit';
    },
    resource_delete_patch: function (id, resource_name) {
        return '/' + resource_name.toLowerCase() + '/' + id + '/delete';
    },
    pluralize: function (string) {
        return tense.pluralize(string.toLowerCase());
    }
};