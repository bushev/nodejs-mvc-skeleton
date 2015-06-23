var log = require('../lib/log');

function ControllerBase(req, res) {
    this.req = req;
    this.res = res;
    this.log = log;
    this.res.locals.data = {};
    this.init();
}

ControllerBase.prototype.init = function () {
    var $this = this;
    log.debug('ControllerBase::init');
};

ControllerBase.prototype.respond = function (err) {
    var $this = this;

    if (err) {
        $this.res.locals.data.error = JSON.stringify(err);
        return $this.res.render('error');
    }

    $this.res.render($this.template);
};

module.exports = ControllerBase;