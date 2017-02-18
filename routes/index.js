const router = require('express').Router();
const request = require('request');
const formTVShedule = require('../libs/formTVSheduleHelper').formTVShedule;
const webshot = require('webshot');
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/image-generator', (req, res) => {
    const [lang, date] = [req.query.lang, req.query.date];
    const options = {
        windowSize: {
            width: 1218
        },
        shotSize: {
            width: "all",
            height: "all"
        },
        renderDelay: 1000
    };

    const env = process.env.NODE_ENV || 'development';
    const host = env === 'development' ? 'http://localhost:3000' : 'https://schedule-1plus1.herokuapp.com';
    const requestUrl = `${host}/image-result/${lang}/${date}`;

    webshot(requestUrl, path.join(__dirname, '../public/out.png'), options, (err) => {
        if(err){
            console.log("An error ocurred: ", err);
        }
        res.sendFile(path.join(__dirname, '../public/out.png'))
    });
});

router.get('/image-result/:lang/:date', (req, res) => {
    const [lang, date] = [req.params.lang, req.params.date];
    if((lang != 'ua' && lang != 'ru')  || !(/^\d{4}[-]\d{2}[-]\d{2}$/.test(date))){
        res.json({error: "Bad data"}).status(400);
        return;
    }

    const requestUrl = `https://api.ovva.tv/v2/${lang}/tvguide/1plus1/${date}`;

    request(requestUrl, (error, response, body) => {
        if(!error && response.statusCode == 200) {
            let tvData = JSON.parse(body).data;
            let tvSchedule = formTVShedule(tvData, lang);
            let morning = tvSchedule.programs.filter((item) => parseInt(item.time_begin.slice(0,2)) < 12);
            let noon = tvSchedule.programs.filter((item) => parseInt(item.time_begin.slice(0,2)) >= 12 && parseInt(item.time_begin.slice(0,2)) < 19);
            let evening = tvSchedule.programs.filter((item) => parseInt(item.time_begin.slice(0,2)) >= 19);

            res.render('program-schedule', {date: tvSchedule.date, lang: lang, morning: morning, noon: noon, evening: evening});
        }
    });
});

module.exports = router;