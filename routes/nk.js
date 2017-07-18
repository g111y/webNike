const router = require("koa-router")();
const nike=new (require("../controllers/nike"))();

router.prefix('/nk');

router.get('/', async function (ctx, next) {
    await ctx.render('nk/index', {
        title: 'nk'
    })
})

router.post("/gdno",nike.gdno );

module.exports = router;