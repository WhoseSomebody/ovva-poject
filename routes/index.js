const router = require('express').Router();
const request = require('request');
const webshot = require('webshot');
const fs = require('fs');
const path = require('path');
const formTVShedule = require('../libs/formTVSheduleHelper').formTVShedule;
const postScheduleOnWall = require('../libs/vkapiHelper').postScheduleOnWall;

router.get('/', (req, res) => {  
    res.render('index');
});

router.get('/image-generator/:lang/:date', (req, res) => {
    const [lang, date] = [req.params.lang, req.params.date];
    const env = process.env.NODE_ENV || 'development';
    const host = env === 'development' ? 'http://localhost:3000' : 'https://schedule-1plus1.herokuapp.com';
    const requestUrl = `${host}/image-result/${lang}/${date}`;
    const options = {
        windowSize: {
            width: 1218
        },
        shotSize: {
            width: "all",
            height: "all"
        }
    };

    webshot(requestUrl, path.join(__dirname, '../public/out.png'), options, error => {
        if(error)
            res.status(400).json({err: error});
        else
            res.sendFile(path.join(__dirname, '../public/out.png'));
    });
});

router.get('/image-result/:lang/:date', (req, res) => {
    const [lang, date] = [req.params.lang, req.params.date];
    const requestUrl = `https://api.ovva.tv/v2/${lang}/tvguide/1plus1/${date}`;

    if((lang != 'ua' && lang != 'ru')  || !(/^\d{4}[-]\d{2}[-]\d{2}$/.test(date))){
        res.status(400).json({error: "Bad data"});
        return;
    }

    request(requestUrl, (error, response, body) => {
        if(error || response.statusCode != 200)
            res.json({err: error});
        else {
            const tvData = JSON.parse(body).data;
            const tvSchedule = formTVShedule(tvData, lang);
            const morning = tvSchedule.programs.filter((item) => parseInt(item.time_begin.slice(0,2)) >= 6 &&  parseInt(item.time_begin.slice(0,2)) < 12);
            const noon = tvSchedule.programs.filter((item) => parseInt(item.time_begin.slice(0,2)) >= 12 && parseInt(item.time_begin.slice(0,2)) < 19);
            const evening = tvSchedule.programs.filter((item) => parseInt(item.time_begin.slice(0,2)) < 6 ||  parseInt(item.time_begin.slice(0,2)) >= 19);
            res.render('program-schedule', {date: tvSchedule.date, lang: lang, morning: morning, noon: noon, evening: evening});
        }
    });
});

router.get('/post-to-vk', (req, res) => {
    postScheduleOnWall()
        .then(response => res.json({success: "ok"}))
        .catch(error => res.status(400).json(error))
});
    
module.exports = router;