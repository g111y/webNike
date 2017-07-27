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

    let delSql = `delete from \`nike\`.\`localiteminfo\``;
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
    let sql = `INSERT INTO \`localiteminfo\` (\`name\`, \`clsName\`, \`barNo\`, \`utno\`, \`stock\`, 
        \`buyPrice\`, \`tagPrice\`, \`Price2\`, \`vipPrice\`, \`vipDisc\`, \`vipGd\`, \`maxStock\`, 
        \`minStock\`, \`vdName\`, \`py\`, \`code\`, \`colorName\`, \`sizeNo\`, \`stat\`, \`memo\`) 
        VALUES ('${item.A}', '${item.B}', '${item.C}', '${item.D}', '${item.E || 0}', '${item.F || 0}', 
            '${item.G || 0}', '${item.H || 0}', '${item.I || 0}', '${item.J}', '${item.K}', '${item.L}', '${item.M}', '${item.N}',
             '${item.O}', '${item.P}', '${item.Q}', '${item.R}', '${item.S}', '${item.T}')`;
    connection.execute(sql, (error, resutls, fields) => {
        if (error) {
            console.log(error);
        }
    });
}

function getCodeInfo() {
    return new Promise((resolve, reject) => {
        let sql = "SELECT localiteminfo.`name` FROM localiteminfo GROUP BY localiteminfo.`name`";
        connection.execute(sql, (error, results, fields) => {
            if (error) {
                reject(error);
            }
            resolve(results);
        })
    });
}

function queryBarOrGdno(barNo) {
    return new Promise((resolve, reject) => {
        let sql = `SELECT localiteminfo.* FROM localiteminfo WHERE barNo='${barNo}'`;
        let sql2 = `SELECT localiteminfo.* FROM localiteminfo WHERE name='${barNo}'`;
        connection.query(sql, (error, results, fields) => {
            if (error) {
                reject(error);
            }
            //如果没有查询到条码，就查询货号
            if (results.length == 0) {
                connection.query(sql2, (error2, results2, fields2) => {
                    if (error2) {
                        reject(error2);
                    }
                    console.log(results2)
                    if (results2.length == 0) {
                        resolve(false);
                    }
                    resolve(results2);
                })
            } else {
                resolve(results);
            }
        });
    })
}


function saveStkData(stkArea, data) {
    return new Promise((resolve, reject) => {
        let i = 1;
        for (let item of data) {
            let sql = `INSERT INTO chkstk (workdate, stkArea, ttime, seqno, clsName, 
                barNo, code, sizeNo, qty, tagPrice) 
                VALUES ('${item.workdate}', '${stkArea}', '${item.ttime}', 
                    '${i}', '${item.clsName}', '${item.barNo}', '${item.code}', 
                    '${item.sizeNo}', '${item.qty}', '${item.tagPrice}')`;
            connection.execute(sql, (error, results, fields) => {
                if (error) {
                    reject(error);
                }
            })
        }
        resolve(true);
    });
}

function stkchkQuery(sdate,edate){
    return new Promise((resolve,reject)=>{
        let sql=`SELECT
                chkstk.workdate,
                chkstk.stkArea,
                chkstk.ttime,
                Sum(chkstk.qty) AS qty,
                Sum(tagPrice * qty) AS tagPriceTotal
            FROM
                chkstk
            WHERE
                chkstk.workdate >= ${sdate}
            AND chkstk.workdate <= ${edate}
            GROUP BY
                chkstk.workdate,
                chkstk.stkArea,
                chkstk.ttime
            ORDER BY workdate,ttime`;
        connection.query(sql,(error,results,fields)=>{
            if (error){
                reject(error);
            }
            resolve(results);
        });
    })
}


exports = module.exports = {
    "parseExcel": parseExcel,
    "getCodeInfo": getCodeInfo,
    "queryBarOrGdno": queryBarOrGdno,
    "saveStkData": saveStkData,
    "stkchkQuery":stkchkQuery
};