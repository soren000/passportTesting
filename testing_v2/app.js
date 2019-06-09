const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const multer = require('multer');
const multerUpload = multer({ dest: `./uploads/` });
const hbs = require('hbs');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const session = require('express-session');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;

// INITIAL SETUP
const app = express();
app.use(helmet());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// SETUP FOR PASSPORT
app.use(session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());
const passportConfig = require('./strategyConfig');
passport.use(new SteamStrategy(
    passportConfig,
    (identifier, profile, done) => {
        return done(null, profile);
    }
));
passport.serializeUser((user, cb) => {
    cb(null, user);
})
passport.deserializeUser((user, cb) => {
    cb(null, user);
})


//SET UP FOR HBS
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
hbs.registerPartials(__dirname + '/views/partials');


//CUSTOM MIDDLEWARE
app.use((req, res, next) => {
    if (req.user) {
        res.locals.displayName = req.user.displayName;
    }
    else {
        res.locals.displayName = false;
    }
    next();
})



// MONGO SETUP WITH MONGOOSE
mongoose.connect('mongodb://localhost:27017/docsTest', {
    useNewUrlParser: true,
    useCreateIndex: true
});

const doggySchema = Schema({
    name: String
});

doggySchema.methods.speak = () => {
    const greeting = this.name ? "Wolf" : "I don't have a name";
    console.log(greeting);
}



const Doggy = mongoose.model('Doggy', doggySchema);


app.get('/testpost2', async (req, res) => {
    const found = await Doggy.find({
        name: "Spike"
    });

    res.send(await found);
})
// app.get('/testpost2', async (req, res) => {
//     const test = await new Doggy({
//         name: 'Lucky'
//     });
//     test.speak();

//     test.save();

//     res.send(await test)
// })




//SET UP FOR ROUTES
const fs = require('fs');
const routesDir = fs.readdirSync('./routes');
routesDir.forEach((file) => {
    const fileName = file.slice(0, -3);
    const route = require(`./routes/${fileName}`);
    app.use(`/${fileName}`, route);
});


// SOME ADDITIONAL ROUTES
app.get('/login', passport.authenticate('steam'));

app.get('/auth', passport.authenticate('steam', {
    successRedirect: '/test',
    failureRedirect: '/loginFailed'
}));

app.get('/', (req, res) => {
    res.send('asd');
});

app.get('/test', (req, res) => {
    let loggedIn;
    if (req.user) {
        loggedIn = true;
    }

    res.render('index', {
        avatar: req.user ? req.user._json.avatarmedium : undefined,
        loggedIn
    });
});

// START UP SERVER
app.listen(3000, () => {
    console.log('Starting')
});