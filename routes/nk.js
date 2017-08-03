const router = require("koa-router")();
const nike = new(require("../controllers/nike"))();
const multer = require('koa-multer');
const upload = multer({
    dest: 'public/uploads'
});


router.prefix('/nk');

router.get("/login", async function (ctx, next) {
    await ctx.render('nk/login', {
        title: 'nk'
    })
})

router.post("/login", async function (ctx, next) {
    console.log(ctx.request.body)
    if (ctx.request.body.user) {
        let user = ctx.request.body.user;
        console.log(user);
        if (user.user == '00001' && user.password == "654321") {
            ctx.session.user = user;
            ctx.body = {
                success: true,
                errText: ""
            }
        }else{
           ctx.body = {
                success: false,
                errText: "用户名或密码错误"
            } 
        }

    }
})

router.use(async function (ctx, next) {
    //await next(); //这里可以使用中间件
    if (!ctx.session.user) {
        console.log(ctx.session);
        //router.redirect('/login', 'sign-in');
        ctx.response.redirect('/nk/login');
    }
    await next();
});
router.get('/', async function (ctx, next) {
    console.log(ctx.session);
    await ctx.render('nk/index', {
        title: 'nk'
    })
})

router.post("/gdno", nike.gdno);

router.get("/saleFileUpload", async(ctx, next) => {
    await ctx.render('nk/saleFileUpload', {
        title: '销售明细数据上传'
    })
});
router.post("/saleFileUpload", upload.single('file'), nike.saleFileUpload);

router.get("/itemFileUpload", async(ctx, next) => {
    await ctx.render('nk/itemFileUpload', {
        title: '商品资料数据上传'
    })
});
router.post("/itemFileUpload", upload.single('file'), nike.itemFileUpload);


//销售查询
router.get("/saleQuery", async(ctx, next) => {
    await ctx.render('nk/analyse', {
        title: '销售查询'
    })
})
router.post("/saleQuery", nike.saleQuery);

//盘点
router.get('/stkchk', async function (ctx, next) {
    console.log(ctx.session);
    await ctx.render('nk/stkchk', {
        title: '盘点'
    })
})
router.post("/stkchkQueryNo", nike.stkchkQueryNo);
//提交盘点表
router.post("/stkchkSubmit", nike.stkchkSubmit);
//查询盘点表
router.get("/stkchkQuery", async function (ctx, next) {
    await ctx.render('nk/stkchkQuery', {
        title: '盘点表查询'
    })
});
router.post("/stkchkQuery", nike.stkchkQuery);

//盘点分析
router.get('/stockAnalyse', async function (ctx, next) {
    console.log(ctx.session);
    await ctx.render('nk/stockAnalyse', {
        title: '盘点分析'
    })
})
router.post("/stockAnalyse", nike.stockAnalyse);

//库存查询
router.get("/stockQuery", async function (ctx, next) {
    await ctx.render('nk/stockQuery', {
        title: '库存查询'
    })
})
router.post("/stockQuery", nike.stockQuery);

module.exports = router;