const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const nunjucks=require('nunjucks');
const session = require("koa-session2");

const index = require('./routes/index')
const users = require('./routes/users')
const test = require('./routes/test')
const nk = require('./routes/nk')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(session({
    key: "SESSIONID",   //default "koa:sess" ,
    maxAge:3600*1000*3,
}));

nunjucks.configure('views', { autoescape: true });
app.use(views(__dirname + '/views', {
  //extension: 'pug'
  extension: 'html',
  map: { html: 'nunjucks' },
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(test.routes(), test.allowedMethods())
app.use(nk.routes(), nk.allowedMethods())

module.exports = app
