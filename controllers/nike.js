const login = require("../src/nkBar/login").login;
const queryList = require("../src/nkBar/query.js");
const query = new queryList();

class nike {
    // constructor() {
    //     console.log("this is nike");
    // }
    async gdno(ctx, next) {
        await next();
        let gdno = ctx.request.body.gdno;
        console.log(gdno);
        let stat = await login();
        let data = {};
        console.log(stat);
        let value = await query.list(gdno);
        let value2 = await query.listBar(value);
        if (value2) {
            value.bar = value2;
        }
        if (value == false) {
            data.success = false;
            data.errText = `没有找到${gdno}的资料`;
            ctx.body = data;
            return;
        }
        data.success = true;
        data.item = value;
        ctx.body = data;
    }
}

exports = module.exports = nike;