var express = require('express');
var passport = require('passport');
var Account = require('../models/account');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var router = express.Router();


router.get('/', ensureLoggedIn('/login'), function (req, res) {
    res.render('index', { user : req.user });
});

router.get('/account', ensureLoggedIn('/login'), function (req, res) {
    res.render('account', { user : req.user });
});

router.post('/account', ensureLoggedIn('/login'), function (req, res) {
    console.log("account: phone Number: ", req.body.phonenumber);
    var numArray = req.body.phonenumber.split("-");  // remove dashes if any
    var newnum = '';
    for (i=0; i < numArray.length; i++)
         newnum = newnum + numArray[i];  
    //console.log("new number: ",newnum);
    
    req.user.phoneNum = newnum;
    req.user.save(function(err) {
    	  if (err) console.log('failed to save number',err);
    	});
    res.redirect('/account');
});


router.get('/device', ensureLoggedIn('/login'), function (req, res) {
    res.render('device', { user : req.user });
});

router.post('/device', ensureLoggedIn('/login'), function (req, res) {
    console.log("device: ID: ", req.body.deviceid);
    req.user.deviceID = req.body.deviceid;
    req.user.save(function(err) {
    	  if (err) console.log('failed to device ID',err);
    	});
    res.redirect('/device');
});


router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render("register", {info: "Sorry. That username already exists. Try again."});
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local', {  successReturnToOrRedirect: '/', failureRedirect: '/login' }));
/*
router.post('/login', passport.authenticate('local', {  successReturnToOrRedirect: '/', failureRedirect: '/login' }), function(req, res) {
    res.redirect('/');
});
*/
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(status).send("pong!", 200);
});

module.exports = router;