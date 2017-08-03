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
             '${item.O}', '${item.P}', '${item.Q}', '${item.R}', '${item.S}', "${item.T}")`;
    connection.execute(sql, (error, resutls, fields) => {
        if (error) {
            console.log(sql);
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

function getCls(){
    return new Promise((resolve,reject)=>{
        let sql = "select clsName from localiteminfo group by clsName ORDER BY clsName";
        connection.execute(sql, (error, results, fields) => {
            if (error) {
                reject(error);
            }
            let cls=[]
            for(let a of results){
                cls.push({
                    "text":a.clsName,
                    "value":a.clsName
                })
            }
            resolve(cls);
        })
    })
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
        let i = data.length;
        for (let item of data) {
            let sql = `INSERT INTO chkstk (workdate, stkArea, ttime, seqno, clsName, 
                barNo, code, sizeNo, qty, tagPrice) 
                VALUES ('${item.workdate}', '${stkArea}', '${item.ttime}', 
                    '${i}', '${item.clsName}', '${item.barNo}', '${item.code}', 
                    '${item.sizeNo}', '${item.qty}', '${item.tagPrice}')`;
            i--;
            connection.execute(sql, (error, results, fields) => {
                if (error) {
                    reject(error);
                }
            })
        }
        resolve(true);
    });
}


//盘点表查询
function stkchkQuery(sdate,edate){
    return new Promise((resolve,reject)=>{
        let sql=`SELECT chkstk.workdate,chkstk.stkArea,chkstk.ttime,
                Sum(chkstk.qty) AS qty,Sum(tagPrice * qty) AS tagPriceTotal
            FROM chkstk
            WHERE chkstk.workdate >= ${sdate} AND chkstk.workdate <= ${edate}
            GROUP BY chkstk.workdate,chkstk.stkArea,chkstk.ttime
            ORDER BY workdate,ttime`;
        connection.query(sql,(error,results,fields)=>{
            if (error){
                reject(error);
            }
            resolve(results);
        });
    })
}

//盘点表查询--按区域汇总
function stkchkQueryByArea(sdate,edate){
    return new Promise((resolve,reject)=>{
        let sql=`SELECT chkstk.stkArea,
                Sum(chkstk.qty) AS qty,Sum(tagPrice * qty) AS tagPriceTotal
            FROM chkstk
            WHERE chkstk.workdate >= ${sdate} AND chkstk.workdate <= ${edate}
            GROUP BY chkstk.stkArea
            ORDER BY chkstk.stkArea`;
        connection.query(sql,(error,results,fields)=>{
            if (error){
                reject(error);
            }
            resolve(results);
        });
    })
}

//盘点表查询--按类别汇总
function stkchkQueryByClsname(sdate,edate){
    return new Promise((resolve,reject)=>{
        let sql=`SELECT chkstk.clsName,
                Sum(chkstk.qty) AS qty,Sum(tagPrice * qty) AS tagPriceTotal
            FROM chkstk
            WHERE chkstk.workdate >= ${sdate} AND chkstk.workdate <= ${edate}
            GROUP BY chkstk.clsName
            ORDER BY chkstk.clsName`;
        connection.query(sql,(error,results,fields)=>{
            if (error){
                reject(error);
            }
            resolve(results);
        });
    })
}

//盘点表查询--按货号汇总
function stkchkQueryByCode(sdate,edate){
    return new Promise((resolve,reject)=>{
        let sql=`SELECT chkstk.code,
                Sum(chkstk.qty) AS qty,Sum(tagPrice * qty) AS tagPriceTotal
            FROM chkstk
            WHERE chkstk.workdate >= ${sdate} AND chkstk.workdate <= ${edate}
            GROUP BY chkstk.code
            ORDER BY chkstk.code`;
        connection.query(sql,(error,results,fields)=>{
            if (error){
                reject(error);
            }
            resolve(results);
        });
    })
}

//盘点表查询--按货号汇总
function stockQuery(){
    return new Promise((resolve,reject)=>{
        let sql=`SELECT * FROM v_localItemInfo_query`;
        connection.query(sql,(error,results,fields)=>{
            if (error){
                reject(error);
            }
            resolve(results);
        });
    })
}

//盘点结果分析
function stockAnalyse(sdate,edate){
    return new Promise((resolve,reject)=>{
        let sql=`SELECT AA.clsName,AA.name,
	sum(AA.qty) as qtyTotal,
	sum(AA.buyPrice) as buyPriceTotal,
	sum(AA.tagPrice) as tagPriceTotal,
	sum(AA.qty2) as qtyTotal2,
	sum(AA.buyPrice2) as buyPriceTotal2,
	sum(AA.tagPrice2) as tagPriceTotal2,
	(sum(AA.qty2) - sum(AA.qty)) as qtyCheck,
	(sum(AA.buyPrice2) - sum(AA.buyPrice)) as buyPriceCheck,
	(sum(AA.tagPrice2) - sum(AA.tagPrice)) as tagPriceCheck
 FROM (
SELECT
	localiteminfo.clsName,
	localiteminfo.name,
	localiteminfo.sizeNo,
	sum(localiteminfo.stock) AS qty,
	sum(
		localiteminfo.stock * localiteminfo.buyPrice
	) AS buyPrice,
	sum(
		localiteminfo.stock * localiteminfo.tagPrice
	) AS tagPrice,
	0 AS qty2,
	0 AS buyPrice2,
	0 AS tagPrice2
FROM
	localiteminfo
GROUP BY
	localiteminfo.clsName,
	localiteminfo. NAME,
	localiteminfo.sizeNo
UNION ALL
	(
		SELECT
			chkstk.clsName,
			chkstk.code as name,
			chkstk.sizeNo,
			0 AS qty,
			0 AS buyPrice,
			0 AS tagPrice,
			sum(chkstk.qty) AS qty2,
			sum(
				chkstk.qty * localiteminfo.buyPrice
			) AS buyPrice2,
			sum(
				chkstk.qty * localiteminfo.tagPrice
			) AS tagPrice2
		FROM
			chkstk	LEFT OUTER JOIN	localiteminfo on chkstk.barNo=localiteminfo.barNo
		WHERE
			chkstk.barNo = localiteminfo.barNo
		GROUP BY
			chkstk.clsName,
			chkstk.code,
			chkstk.sizeNo
	)) AA
GROUP BY AA.clsName,AA.name`;
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
    "stkchkQuery":stkchkQuery,
    "stkchkQueryByArea":stkchkQueryByArea,
    "stkchkQueryByClsname":stkchkQueryByClsname,
    "stkchkQueryByCode":stkchkQueryByCode,
    "stockAnalyse":stockAnalyse,
    "getCls":getCls,
    "stockQuery":stockQuery
};