const router = require("koa-router")();
const login = require("../src/nkBar/login").login;
const queryList = require("../src/nkBar/query.js");
const query = new queryList();
router.prefix('/nk');

router.get('/', async function (ctx, next) {
    await ctx.render('nk/index', {
        title: 'nk'
    })
})

router.post("/gdno", async function (ctx, next) {
    let gdno=ctx.request.body.gdno;
    console.log(gdno);
    let stat = await login();
    let data={};
    console.log(stat);
    let value=await query.list(gdno);
    let value2=await query.listBar(value);
    if(value2){
        value.bar=value2;
    }
    if(value==false){
        data.success=false;
        data.errText=`没有找到${gdno}的资料`;
        ctx.body=data;
        return;
    }
    data.success=true;
    data.item=value;
    ctx.body = data;
})

module.exports = router;