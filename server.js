const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const app = express();
const axios = require('axios');
require('dotenv').config()

// Init middleware
// app.use(logger);

// Handlebars Middleware

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Homepage Route
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Best SteamID Finder',
        response: undefined
    })
});

app.get('/news', (req, res) => {
    axios.get('https://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=359550&count=6&maxlength=300&format=json')
        .then(function (response) {
            // handle success
            if (response.data != null && response.data.appnews != null &&
                Array.isArray(response.data.appnews.newsitems) &&
                response.data.appnews.newsitems.length > 0
            ) {
                const dataWithcorrectDateFormat = response.data.appnews.newsitems.map(item => {
                    let time = new Date(1970, 0, 1)
                    time.setSeconds(item.date)
                    return { ...item, date: time.toLocaleDateString()}
                })

                res.render('news', {
                    title: 'SteamID Finder',
                    newsData: dataWithcorrectDateFormat
                })

            } else {
                res.render('news', {
                    title: 'SteamID Finder',
                    newsData: []
                })
            }

        })
        .catch(function (error) {
            // handle error
            console.error(error);
            res.render('news')

        })

});
// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Members API Routes
app.use('/api/steam', require('./routes/index'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));