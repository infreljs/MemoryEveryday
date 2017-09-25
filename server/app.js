const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bkdf2Password = require('pbkdf2-password');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const hasher = bkdf2Password();

const app = express();
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12341234',
    database: 'memoryeveryday'
});
conn.connect();

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(session({
    secret: 'M3M0RY3V3RYDAY',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '12341234',
        database: 'memoryeveryday'
    })
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
    console.log('serializeUser', user);
    done(null, user.authId);
});
passport.deserializeUser(function (user, done) {
    console.log('deserializeUser', user);
    var sql = "SELECT * FROM users WHERE authId=?";
    conn.query(sql, [user], function (err, results) {
        if (err) {
            console.log(err);
        } else {
            done(null, results[0]);
        }
    });
    return done(null, user);
});
passport.use(new LocalStrategy(
    function (username, password, done) {
        var sql = "SELECT * FROM users WHERE authId=?";
        var params = ['local:' + username];
        conn.query(sql, params, function (err, results) {
            if (err) {
                console.log(err);
            }
            var user = results[0];
            console.log(user);
            return hasher({
                password: password,
                salt: user.salt
            }, function (err, pass, salt, hash) {
                if (hash === user.pw) {
                    console.log('LocalStrategy', user);
                    done(null, user);
                } else {
                    done(null, false);
                }
            });
        });
    }
));
passport.use(new FacebookStrategy({
        clientID: process.env.FB_CLIENTID,
        clientSecret: process.env.FB_CLIENTSECRET,
        callbackURL: "/auth/facebook/callback",
        profileFields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified']
    },
    function (accessToken, refreshToken, profile, done) {
        console.log(profile);
        var authId = 'facebook:' + profile.id;
        var sql = "SELECT * FROM users WHERE authId=?";
        conn.query(sql, [authId], function (err, results) {
            if (results.length > 0) {
                done(null, results[0]);
            } else {
                var sql = "INSERT INTO users SET ?";
                var newUser = {
                    "authId": authId,
                    "name": profile.last_name + profile.first_name,
                    "email": profile.email
                };
                conn.query(sql, newUser, function (err, results) {
                    if (err) {
                        console.log(err);
                        done('Error');
                    } else {
                        done(null, results[0]);
                    }
                })
            }
        });
        return done(null, user);
        var newUser = {
            'authId': authId,
            'name': profile.name
        };
        done(null, newUser);
        // User.findOrCreate(..., function (err, user) {
        //     if (err) {
        //         return done(err);
        //     }
        //     done(null, user);
        // });
    }
));

app.get('/', function (req, res) {
    if (req.session.id) {
        res.send(req.session);
    }
});
app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: 'email'
}));
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/'
    })
);

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: false
}));
app.post('/register', function (req, res) {
    hasher({
        password: req.body.pw
    }, function (err, pass, salt, hash) {
        var user = {
            authId: 'local:' + req.body.id,
            pw: hash,
            salt: salt,
            name: req.body.name,
            email: req.body.email
        };
        var sql = 'INSERT INTO users SET ?';
        conn.query(sql, user, function (err, results) {
            if (err) {
                console.log(err);
                res.status(500);
                res.end();
            } else {
                req.login(user, function (err) {
                    req.session.save(function () {
                        res.status(200);
                        res.end();
                    })
                });
            }
        });
    });
});

app.listen(3000, function () {
    console.log('Connected at port 3000!');
});