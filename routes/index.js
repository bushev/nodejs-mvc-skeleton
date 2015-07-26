var router = require('express').Router()
    , middleware = require('../lib/middleware');

router.get('/', require('../controllers/index'));

router.get('/redirect', require('../controllers/redirect'));

router.get('/register', require('../controllers/user/register'));
router.post('/register', require('../controllers/user/register'));
router.get('/login', require('../controllers/user/login'));
router.post('/login', require('../controllers/user/login'));
router.get('/verify_email/:code', require('../controllers/user/verify_email'));
router.get('/forgot_password', require('../controllers/user/forgot_password'));
router.post('/forgot_password', require('../controllers/user/forgot_password'));
router.get('/reset_password/:code', require('../controllers/user/reset_password'));
router.post('/reset_password', require('../controllers/user/reset_password'));

router.all('/user/*', middleware.checkAuth);

router.get('/user/logout', require('../controllers/user/logout'));

router.get('/user/account', require('../controllers/user/account'));
router.post('/user/account', require('../controllers/user/account'));

module.exports = router;
