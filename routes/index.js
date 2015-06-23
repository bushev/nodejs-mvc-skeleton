var express   = require('express')
    , router  = express.Router()
    , models  = require('../models');

router.get('/', function (req, res, next) {
    res.render('index');
});

router.get('/verify_user/:code', function (req, res, next) {
    //var user = new User(req, res, next);
    //user.verify();
});

router.get('/register', require('../controllers/register/index'));
router.post('/register', require('../controllers/register/index'));

router.post('/register', function (req, res, next) {
    // models.User.register();
    //var user = new User(req, res, next);
    //user.register();
});

router.get('/login', function (req, res) {
    res.render('login');
});

router.post('/login', function (req, res, next) {
    var user = new User(req, res, next);

    user.login();
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
