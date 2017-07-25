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
    result.Sheet1.shift()
    // console.log(result);

    let delSql = `delete from \`nike\`.\`localItemInfo\``;
    connection.execute(delSql, (error, resutls, fields) => {
        if (error) {
            console.log(error);
        }
        for (let a of result.Sheet1) {
            storeItems(a);
        }
        fs.unlink(realFilename);
    });
    return result.Sheet1;
}

function storeItems(item) {
    let sql = `INSERT INTO \`localItemInfo\` (\`name\`, \`clsName\`, \`barNo\`, \`utno\`, \`stock\`, 
        \`buyPrice\`, \`tagPrice\`, \`Price2\`, \`vipPrice\`, \`vipDisc\`, \`vipGd\`, \`maxStock\`, 
        \`minStock\`, \`vdName\`, \`py\`, \`code\`, \`colorName\`, \`sizeNo\`, \`stat\`, \`memo\`) 
        VALUES ('${item.A}', '${item.B}', '${item.C}', '${item.D}', '${item.E||0}', '${item.F||0}', 
            '${item.G||0}', '${item.H||0}', '${item.I||0}', '${item.J}', '${item.K}', '${item.L}', '${item.M}', '${item.N}',
             '${item.O}', '${item.P}', '${item.Q}', '${item.R}', '${item.S}', '${item.T}')`;
    connection.execute(sql, (error, resutls, fields) => {
        if (error) {
            console.log(error);
        }
    });
}

function getCodeInfo() {
    return new Promise((resolve,reject) => {
        let sql = "SELECT localItemInfo.`name` FROM localItemInfo GROUP BY localItemInfo.`name`";
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
    "getCodeInfo": getCodeInfo,
};