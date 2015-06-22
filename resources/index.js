var assetManager         = require('connect-assetmanager')
    , assetManagerGroups = {
        css: {
            route: /\/stylesheets\/lib\.css/,
            path: __dirname + '/',
            dataType: 'css',
            files: [
                'bower_components/bootstrap/dist/css/bootstrap.css',
                'http://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css'
            ],
            debug: false
        },
        libraries: {
            route: /\/javascripts\/client\.js/,
            path: __dirname + '/',
            dataType: 'javascript',
            files: [
                'bower_components/jquery/dist/jquery.js',
                'bower_components/bootstrap/dist/js/bootstrap.js'
            ],
            debug: false
        }
    };

module.exports = assetManager(assetManagerGroups);