"use strict";

var fs          = require("fs")
    , path      = require("path")
    , Sequelize = require("sequelize")
    , config    = require("../config")
    , sequelize = new Sequelize(config.get('db:database'), config.get('db:username'), config.get('db:password'), config.get('db'))
    , models    = {};

fs.readdirSync(__dirname).filter(function (file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
}).forEach(function (file) {
    var model = sequelize["import"](path.join(__dirname, file));
    models[model.name] = model;
});


models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;