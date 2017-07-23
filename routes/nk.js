const router = require("koa-router")();
const nike = new(require("../controllers/nike"))();
const multer = require('koa-multer');
const upload = multer({ dest: 'public/uploads' });


router.prefix('/nk');
router.use(async function(ctx,next){
    await next();   //这里可以使用中间件
});
router.get('/', async function (ctx, next) {
    console.log(ctx.session);
    await ctx.render('nk/index', {
        title: 'nk'
    })
})

router.post("/gdno", nike.gdno);

router.get("/saleFileUpload", async (ctx,next)=>{
    await ctx.render('nk/saleFileUpload', {
        title: '销售明细数据上传'
    })
});
router.post("/saleFileUpload",upload.single('file'), nike.saleFileUpload);

module.exports = router;