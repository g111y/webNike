const router = require("koa-router")();
const nike = new(require("../controllers/nike"))();
const multer = require('koa-multer');
const upload = multer({ dest: 'public/uploads' });


router.prefix('/nk');

router.get('/', async function (ctx, next) {
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