var express         = require('express')
    , path          = require('path')
    , log           = require('./lib/log')
    , cookieParser  = require('cookie-parser')
    , bodyParser    = require('body-parser')
    , compression   = require('compression')
    , morgan        = require('morgan')
    , passport      = require('passport')
    , models        = require('./models')
    , util          = require('util')
    , config        = require('./config')
    , middleware    = require('./lib/middleware')
    , c             = require('./constants')
    , winstonStream = {
        write: function (message) {
            log.info(message.slice(0, -1));
        }
    };

var app = express();

app.disable('x-powered-by');

app.use(middleware.strictDomain);

app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', require('./resources'));
app.use(morgan(':remote-addr :method :url :status :user-agent :response-time ms - :res[content-length]', {stream: winstonStream}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cookieParser(config.get("session:secret")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(middleware.sessionMiddleware);

app.use(require('flash')());

app.use(passport.initialize());
app.use(passport.session());

passport.use(middleware.passportLocalStrategy);

passport.serializeUser(middleware.passportSerializeUser);
passport.deserializeUser(middleware.passportDeserializeUser);

app.use(require('express-domain-middleware'));

app.use(require('./routes/index'));

app.use(require('./controllers/error'));

module.exports = app;