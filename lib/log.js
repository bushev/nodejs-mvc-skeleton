var winston            = require('winston')
    //, config           = require("../config")
    , winstonMail      = require('winston-mail').Mail
    , logger           = new winston.Logger({
        transports: [
            new winston.transports.Console({
                level: 'debug',
                handleExceptions: true,
                colorize: true,
                json: false,
                prettyPrint: true,
                timestamp: true
            }),
            new winston.transports.File({
                silent: true,
                level: 'debug',
                filename: __dirname + '/../logs/logfile.log',
                handleExceptions: true,
                maxsize: 1024 * 1024 * 100, // 100 MB
                maxFiles: 20,
                colorize: true,
                json: false,
                prettyPrint: true,
                timestamp: true
            }),
            //new winston.transports.Mail({
            //    //silent: true, // TODO
            //    level: 'error',
            //    to: config.get('ADMIN_MAIL'),
            //    from: config.get('MAIL_SMTP_USERNAME'),
            //    host: config.get('MAIL_SMTP_HOST'),
            //    port: config.get('MAIL_SMTP_PORT'),
            //    username: config.get('MAIL_SMTP_USERNAME'),
            //    password: config.get('MAIL_SMTP_PASSWORD'),
            //    ssl: true
            //})
        ]
    })
    , logger_debug_old = logger.debug
    , logger_info_old  = logger.info
    , logger_error_old = logger.error;

logger.debug = function (msg) {
    return logger_debug_old.call(this, msg);
};

logger.info = function (msg) {
    return logger_info_old.call(this, msg);
};

logger.error = function (msg) {
    var fileAndLine = traceCaller(1);
    return logger_error_old.call(this, fileAndLine + " " + msg);
};

function traceCaller(n) {
    if (isNaN(n) || n < 0) n = 1;
    n += 1;
    var s   = (new Error()).stack
        , a = s.indexOf('\n', 5);
    while (n--) {
        a = s.indexOf('\n', a + 1);
        if (a < 0) {
            a = s.lastIndexOf('\n', s.length);
            break;
        }
    }
    var b = s.indexOf('\n', a + 1);
    if (b < 0) b = s.length;
    a = Math.max(s.lastIndexOf(' ', b), s.lastIndexOf('/', b));
    b = s.lastIndexOf(':', b);
    s = s.substring(a + 1, b);
    return s;
}

module.exports = logger;