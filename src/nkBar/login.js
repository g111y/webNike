let ApiOcx = require("../baidu-ai/src/index.js").ocr;
let fs = require("fs");
let request = require("superagent");
//require('superagent-proxy')(request);
//let proxy = process.env.http_proxy || 'http://200.53.2.12:80';

let App_id = "9851355";
let Api_key = "gXQf5uKNso6FFgPa7yKMNjWq";
let Secret_key = "CBUiRZyQxDtwyUmq8axaaAkvHiWs4YUN";
let loginImageUrl = `http://retail.belle.net.cn/createVerifyCode?sessionKey=naviVerifyCode&time=${(new Date()).valueOf()}`;

let client = new ApiOcx(App_id, Api_key, Secret_key);

let cookies = [];

let loginUrl = "http://retail.belle.net.cn/be_ready_login";
let loginName = "NKMGY1";
let loginPassword = "NKMGY1";

let topPage = "http://retail.belle.net.cn/pos/sso_to_index"; //登陆后的首页面

let options = {
    "Host": "retail.belle.net.cn",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:53.0) Gecko/20100101 Firefox/53.0"
};
//取验证码图片
function getLoginImage() {
    return new Promise((resolve, reject) => {

        request.get(loginImageUrl)
            .set(options)
            .set("Content-Type", "image/png")
            .end(function (err, res) {
                if (err) {
                    reject(err);
                }
                cookies = res.headers["set-cookie"];
                let imgFile = fs.openSync("2.jpg", "w");
                fs.writeSync(imgFile, res.body);
                resolve(cookies);
            });
    });
}

function getImageText() {
    return new Promise((resolve, reject) => {
        let image = fs.readFileSync("2.jpg");
        let base64Img = new Buffer(image).toString("base64");
        client.webImage(base64Img).then(function (result) {
            console.log(`登陆验证码:${result.words_result[0].words}`);
            resolve(result.words_result[0].words);
        }).catch((err) => {
            reject(ree);
        });
    });
}

function startLogin(imgText) {
    return new Promise((resolve, reject) => {
        let formData = {
            "loginName": loginName,
            "loginPassword": loginPassword,
            "flag": "submit",
            "cookieFlag": "0",
            "vcode": imgText,
            "systemType": "1",
        };

        request.post(loginUrl)
            .set(options)
            .set("Cookie", cookies)
            .field(formData)
            .end((err, res) => {
                if (err) {
                    reject(err);
                }
                cookies = res.headers['set-cookie'];

                fs.writeFileSync("cookie.txt", cookies);
                console.log("登陆cookie记录成功!");

                if (res.body.success) {
                    let loginTime = (new Date()).valueOf() + 1800 * 1 * 1000
                    fs.writeFileSync("loginTime.txt", loginTime);
                    console.log("登陆时间记录成功!" + loginTime);
                }
                resolve(res.body.success);
            })
    });
}

function getTopPage() {
    return new Promise((resolve, reject) => {
        request.get(topPage)
            .set(options)
            .set("Cookie", cookies)
            .end((err, res) => {
                if (err) {
                    reject(err);
                }
                if (res.status == 200) {
                    cookies = res.headers['set-cookie'];

                    fs.appendFileSync("cookie.txt", cookies);
                    console.log("首页cookies记录成功!");
                    resolve(cookies);
                }
            })
    });
}

let login = async() => {
    let stat = {
        "stat": 0,
        "statText": "无需登陆!"
    }

    let now = (new Date()).valueOf();
    let loginTime = fs.readFileSync("loginTime.txt");
    console.log(`now:${now},loginTime:${loginTime},stat:${now<loginTime}`);
    if (now < loginTime) {
        return stat;
    }
    try {
        let cookie = await getLoginImage();
        let imgText = await getImageText();
        let res = await startLogin(imgText);
        if (res) {
            let cookies = await getTopPage();
            stat.stat = 1;
            stat.statText = "登陆成功!";
            //stat.cookies=cookies;
            return stat;
        }
    } catch (err) {
        console.log(err);
        return err;
    }
};

exports = module.exports = {
    login: login
};