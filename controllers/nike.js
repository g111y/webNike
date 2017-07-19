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
        let valueLocal=await query.listLocal(gdno);//先查本地数据库是否有资料
        console.log(`本地查询到${valueLocal.length}条数据!`);

        if(valueLocal.length!=0){
            ctx.boty=valueLocal;
            return ;
        }

        
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
        //资料存储在本地
        query.storeGdno(value);
        
        data.success = true;
        data.item = value;
        ctx.body = data;
    }
}

exports = module.exports = nike;