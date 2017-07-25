const router = require("koa-router")();
const nike = new(require("../controllers/nike"))();
const multer = require('koa-multer');
const upload = multer({
    dest: 'public/uploads'
});


router.prefix('/nk');
router.use(async function (ctx, next) {
    await next(); //这里可以使用中间件
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
router.post("/saleQuery",nike.saleQuery);


router.get('/stkchk', async function (ctx, next) {
    console.log(ctx.session);
    await ctx.render('nk/stkchk', {
        title: '盘点'
    })
})
module.exports = router;