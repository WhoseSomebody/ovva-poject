const request = require('request');
const fs    = require('fs');
const path = require('path');

function postScheduleOnWall() {
    return new Promise((resolve, reject) => {
        const ACCESS_TOKEN = "a7c1c20183f2c5f780fa06299c94127f2920296fec338699b16540366ffc86a2021dd49a2f05cd1b3ef66";
        const GROUP_ID = "140564762";
        const API_URL = "https://api.vk.com/method";

        let getUploadUrl = new Promise((resolve, reject) => {
            const requestURL = `${API_URL}/photos.getWallUploadServer?group_id=${GROUP_ID}&access_token=${ACCESS_TOKEN}&v=5.62`;
            request(requestURL, (error, response, body) => {
                const data = JSON.parse(body);
                if(error || response.statusCode != 200 || data.error)
                    reject({err: data.error});
                else {
                    resolve(data.response)
                }
            })
        })

        let uploadImage = (res, resolve, reject) => {
            let req = request.post(res.upload_url, (error, response, body) => {
                const data = JSON.parse(body);
                if(error || response.statusCode != 200 || data.error)
                    reject({err: data.error});
                else {
                    resolve(data)
                }
            })

            let form = req.form();
            form.append('photo', fs.createReadStream(path.join(__dirname, '../public/out.png')), {filename: 'out.png'});
        }

        let savePhoto = (res, resolve, reject) => {
            const requestURL = `${API_URL}/photos.saveWallPhoto?group_id=${GROUP_ID}&photo=${res.photo}&server=${res.server}&hash=${res.hash}&access_token=${ACCESS_TOKEN}&v=5.62`;

            request(requestURL, (error, response, body) => {
                const data = JSON.parse(body);
                if(error || response.statusCode != 200 || data.error)
                    reject({err: data.error});
                else {
                    resolve(data.response[0])
                }
            })
        }

        let postToWall = (res, resolve, reject) => {
            const requestURL = `${API_URL}/wall.post?owner_id=-${GROUP_ID}&friends_only=0&from_group=1&message=Schedule&attachments=photo${res.owner_id}_${res.id}&access_token=${ACCESS_TOKEN}&v=5.62`;

            request(requestURL, (error, response, body) => {
                const data = JSON.parse(body);
                if(error || response.statusCode != 200 || data.error)
                    reject({err: data.error});
                else {
                    resolve(data)
                }
            })
        }

        getUploadUrl
            .then(res => {
                return new Promise(uploadImage.bind(null, res));
            })
            .then(res => {
                return new Promise(savePhoto.bind(null, res));
            })
            .then(res => {
                return new Promise(postToWall.bind(null, res));
            })
            .then(res => {
                resolve(res);
            })
            .catch(err => {
                reject(err);
            })
        })
}

module.exports.postScheduleOnWall = postScheduleOnWall;