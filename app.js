var express          = require('express')
    , path           = require('path')
    , logger         = require('morgan')
    , log            = require('./lib/log')
    , cookieParser   = require('cookie-parser')
    , bodyParser     = require('body-parser')
    , compression    = require('compression')
    , morgan         = require('morgan')
    , userAgent      = require('express-useragent')
    , passport       = require('passport')
    , models         = require('./models')
    , util           = require('util')
    , config         = require('./config')
    , middleware     = require('./lib/middleware')
    , c              = require('./constants')
    , session        = require('express-session')
    , SequelizeStore = require('connect-session-sequelize')(session.Store)
    , winstonStream  = {
        write: function (message) {
            log.info(message.slice(0, -1));
        }
    }
    , sessionStore   = new SequelizeStore({
        db: models.sequelize
    });

var app = express();

app.disable('x-powered-by');

app.use(middleware.strictDomain);

app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', require('./resources'));
app.use(morgan(':remote-addr :method :url :status :user-agent :response-time ms - :res[content-length]', {stream: winstonStream}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

/**
 * TODO: Create middleware
 */
var DAY_30 = 30 * 24 * 60 * 60 * 1000;
app.use(cookieParser(config.get("session:secret")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
var sessionMiddleware = session({
    store: sessionStore,
    key: config.get("session_key"),
    secret: config.get("session_secret"),
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: new Date(Date.now() + DAY_30),
        maxAge: DAY_30,
        httpOnly: true
    }
});

/**
 * TODO: Create middleware
 */
app.use(function (req, res, next) {

    if (!req.headers['user-agent']) {
        req.session = {}; // Make `flash` assertion happy
        return next();
    }

    if (userAgent.parse(req.headers['user-agent']).isBot) {
        req.session = {}; // Make `flash` assertion happy
        return next();
    }

    return sessionMiddleware(req, res, next);
});

app.use(require('flash')());

app.use(passport.initialize());
app.use(passport.session());

passport.use(middleware.passportLocalStrategy);

passport.serializeUser(middleware.passportSerializeUser);
passport.deserializeUser(middleware.passportDeserializeUser);

app.use(logger('dev'));

app.use(require('express-domain-middleware'));

app.use(require('./routes/index'));

app.use(function (req, res) {
    res.status(404);
    res.render('404');
});

app.use(function (err, req, res) {

    log.error(err);

    if (err.name && err.name === 'SequelizeValidationError') {

        var errors = [];

        err.errors.forEach(function (error) {
            errors.push(error.message);
        });

        res.status(err.status || 500);

        res.render('error', {
            message: JSON.stringify(errors),
            error: {}
        });

    } else {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    }

});

module.exports = app;
