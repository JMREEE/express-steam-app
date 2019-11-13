const express = require('express');
const router = express.Router();
const axios = require('axios');


//Get Single Member
router.get('/', (req, res) => {
    axios.get('http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=440&count=3&maxlength=300&format=json')
        .then(function (response) {
            // handle success
            res.status(200).send(response.data.appnews.newsitems)

        })
        .catch(function (error) {
            // handle error
            console.error(error);
            res.status(500).send(error)

        })
        .finally(function () {
            // always executed
        });

});

router.post('/getplayersummary', async function (req, res) {

    const urlFirst = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.WEB_API_KEY}&steamids=${req.body.name}`;
    const urlSecond = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1//?key=${process.env.WEB_API_KEY}&steamid=${req.body.name}`;
    let newResponse = undefined;

    try {
        const requestOne = await axios.get(urlFirst)
        const requestSecond = await axios.get(urlSecond)

        if (Array.isArray(requestOne.data.response.players) && requestOne.data.response.players.length > 0) {

            const data = requestOne.data.response.players[0];
            const grpData = requestSecond.data.response;
            const timeLogOff = new Date(1970, 0, 1);
            const timeCreated = new Date(1970, 0, 1);
            timeLogOff.setSeconds(data.lastlogoff)
            timeCreated.setSeconds(data.timecreated)

            newResponse = {
                name: data.personaname,
                avatarImgPath: data.avatarfull,
                lastlogoff: timeLogOff.toLocaleDateString(),
                timeCreated: timeCreated.toLocaleDateString(),
                profileurl: data.profileurl
            }

            res.render('index', {
                title: 'Best SteamID Finder',
                response: newResponse,
                grp: grpData || [],
                notFound: Array.isArray(requestOne.data.response.players) && requestOne.data.response.players.length === 0
            })
        }

    } catch (error) {
        console.error(error)
        //res.status(500).send({ error })
        res.redirect("/")
    }
});


module.exports = router;