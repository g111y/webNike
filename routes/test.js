const router = require('koa-router')()

router.prefix('/test')

router.get('/', async function (ctx, next) {
    await ctx.render('test/index', {
        title: 'Hello Koa 2!'
    })
})

module.exports=router;