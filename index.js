const express = require('express')
const app = express();
const User = require('./models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');

mongoose.connect('mongodb://localhost:27017/authDemo', {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true,
    useFindAndModify: false
    })
    .then(() => {
        console.log("MONGO CONNECTION OPEN")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!")
        console.log(err)
    })   

app.set('view engine', 'ejs');
app.set('views', 'views');

//gives access to req.body and other elements in req.
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'notagoodsecret' }));

//middleware to password protect routes.
const requireLogin = (req, res, next) => {
    if (!req.session.user_id){
        return res.redirect('/login')
    }
    next();
}

app.get('/', (req, res) => {
    res.send("This is the home page")
})

app.post('/logout', (req, res) => {
    //min to logout
    req.session.user_id = null;
    //destroys all data associated with session. 
    // req.session.destroy();
    res.redirect('login');
})

app.get('/secret', requireLogin, (req, res) => {
    res.render('secret')
})

app.get('/topsecret', requireLogin, (req, res) => {
    res.send('TOP SECRET!')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const { password, username } = req.body;
    
    const user = new User({ username, password })
    await user.save();
    req.session.user_id = user._id; 
    res.redirect('/')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { username, body, password } = req.body;
    const foundUser = await User.findAndValidate(username, password);
    const user = await User.findOne({ username });
    const validPassword = await bcrypt.compare(password, user.password);
    if(foundUser){
        req.session.user_id = foundUser._id;
        res.redirect('/secret')
    } else {
        res.redirect('/login')
    }
})

app.listen(3000, () => {
    console.log('Serving your app!')
})