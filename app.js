const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const mongoose = require('mongoose')
const moment = require('moment')


const index = require('./routes/index')
const users = require('./routes/users')
const home = require('./routes/home')
const category = require('./routes/category')
const goods = require('./routes/goods')
const cart = require('./routes/cart')
const order = require('./routes/order')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

// app.use(views(__dirname + '/views', {
//   extension: 'pug'
// }))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`,'--- ' + moment().format('YYYY-MM-DD HH:mm:ss'))
})

mongoose.connect("mongodb://127.0.0.1:27017/mini_program", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('open', () => {
  console.log('mongodb连接成功...');

  // routes
  app.use(index.routes(), index.allowedMethods())
  app.use(users.routes(), users.allowedMethods())
  app.use(home.routes(), home.allowedMethods())
  app.use(category.routes(), category.allowedMethods())
  app.use(goods.routes(), goods.allowedMethods())
  app.use(cart.routes(), cart.allowedMethods())
  app.use(order.routes(), order.allowedMethods())

});

mongoose.connection.on('error', () => {
  console.log('mongodb连接失败...')
})
// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
