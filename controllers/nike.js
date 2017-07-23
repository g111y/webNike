const login = require("../src/nkBar/login").login;
const queryList = require("../src/nkBar/query.js");
const {parseExcel,getCodeInfo} = require("../src/nkBar/sales.js");//.parseExcel;
//const getCodeInfo = require("../src/nkBar/sales.js").getCodeInfo;
const query = new queryList();


class nike {
    // constructor() {
    //     console.log("this is nike");
    // }
    async gdno(ctx, next) { //根据货号查询单品信息
        await next();
        let data = {};
        let gdno = ctx.request.body.gdno;
        let valueLocal = await query.listLocal(gdno); //先查本地数据库是否有资料
        console.log(`本地查询到${valueLocal.length}条数据!`);
        try {
            if (valueLocal.length != 0) { //如果本地数据库有信息，取本地信息
                valueLocal[0].bar = await query.listBarLocal(valueLocal[0].itemNo);
                // console.log(valueLocal.bar);
                data.success = true;
                data.item = valueLocal[0];
                ctx.body = data;
                return;
            }
        } catch (err) {
            console.log(err);
        }


        //取NK系统的信息
        let stat = await login();
        console.log(stat);
        let value = await query.list(gdno);

        if (value == false) {
            data.success = false;
            data.errText = `没有找到${gdno}的资料`;
            ctx.body = data;
            return;
        }
        let value2 = await query.listBar(value);
        if (value2) {
            value.bar = value2;
        }
        //资料存储在本地
        query.storeGdno(value);

        data.success = true;
        data.item = value;
        ctx.body = data;
    }

    async saleFileUpload(ctx, next) {
        await next();
        let codeInfo = await getCodeInfo();
        for (let code of codeInfo) {
            let valueLocal = await query.listLocal(code.code); //先查本地数据库是否有资料
            console.log(`${code.code}本地查询到${valueLocal.length}条数据!`);
            if (valueLocal.length != 0) {
                continue;
            }
            //取NK系统的信息
            let stat = await login();
            console.log(stat);
            let value = await query.list(code.code);

            if (value == false) {
                console.log(`没有找到${code.code}的资料`);
                continue;
            }
            let value2 = await query.listBar(value);
            if (value2) {
                value.bar = value2;
            }
            //资料存储在本地
            query.storeGdno(value);
        }

        parseExcel(ctx.req.file.filename);
        ctx.body = ctx.req.file.filename;

    }
}

exports = module.exports = nike;