const mysql = require('mysql2');
const fs = require("fs");
const config = require("./config.json");
const excelToJson = require('convert-excel-to-json');
const queryList = require("./query.js");
const query = new queryList();
const login = require("./login").login;

const saleNoReg = /\d{21}/;
const gdnoReg = /\w{6}-\w{3}/;
const connection = mysql.createConnection(config.db);

function parseExcel(filename) {
    let realFilename = "public/uploads/" + filename;
    let result = excelToJson({
        sourceFile: realFilename
    });
    let items = [];
    let workdate;
    for (let item of result.Sheet1) {
        let sheet = {};
        if (item.A && saleNoReg.test(item.A)) {
            let matches = saleNoReg.exec(item.A);
            workdate = matches[0].substr(0, 8);
        }
        if (item.G && gdnoReg.test(item.G)) {
            let gdnoText = gdnoReg.exec(item.G);
            sheet.code = gdnoText[0];
            sheet.workdate = workdate;
            sheet.saler = item.F;
            sheet.barNo = item.H;
            sheet.qty = item.J;
            sheet.tagPrice = item.K;
            sheet.salePrice = item.L;
            sheet.profit = item.M;
            items.push(sheet);
        }
    }
    //按日期排序
    items.sort(function (value1, value2) {
        if (value1.workdate < value2.workdate) {
            return -1;
        } else {
            return 1;
        }
    });
    let sdate = items[0].workdate;
    let edate = items[items.length - 1].workdate;
    let delSql = `delete from \`nike\`.\`saleitems\` where \`workdate\`>=${sdate} and \`workdate\`<=${edate}`;
    connection.execute(delSql, (error, resutls, fields) => {
        if (error) {
            console.log(error);
        }
        for (let a of items) {
            storeItems(a);
        }
        fs.unlink(realFilename);
    });
    return items;
}

function storeItems(item) {
    let sql = `INSERT INTO \`saleItems\` (
    \`workdate\`, \`code\`, \`barNo\`, 
    \`saler\`, \`qty\`, \`tagPrice\`, 
    \`salePrice\`, \`profit\`) 
    VALUES (${item.workdate}, 
        '${item.code}', 
        '${item.barNo}', 
        '${item.saler}', 
        ${item.qty}, 
        ${item.tagPrice},
        ${item.salePrice},
        ${item.profit})`;
    connection.execute(sql, (error, resutls, fields) => {
        if (error) {
            console.log(error);
        }
    });
}

async function ss(code) {
    console.log(code)
    let valueLocal = await query.listLocal(code); //先查本地数据库是否有资料
    console.log(`本地查询到${valueLocal.length}条数据!`);
    if (valueLocal.length != 0) {
        return;
    }
    //取NK系统的信息
    let stat = await login();
    console.log(stat);
    let value = await query.list(code);

    if (value == false) {
        console.log(`没有找到${code}的资料`);
        return;
    }
    let value2 = await query.listBar(value);
    if (value2) {
        value.bar = value2;
    }
    //资料存储在本地
    query.storeGdno(value);
}

function getCodeInfo() {
    return new Promise((resolve,reject) => {
        let sql = "SELECT saleitems.`code` FROM saleitems GROUP BY saleitems.`code`";
        connection.execute(sql, (error, results, fields) => {
            if (error) {
                reject(error);
            }
           resolve(results);
        })
    });
}
exports = module.exports = {
    "parseExcel": parseExcel,
    "getCodeInfo": getCodeInfo
};