const router = require('koa-router')();
const mongoose = require('mongoose');

const bannersData = require('../data/banner.json');
const mallNavsData = require('../data/mall_nav.json');


//当前路由前缀
router.prefix('/home')


  const bannersSchema = new mongoose.Schema({
    id: Number,
    url: String,
    type: String
  })
  const mallNavsSchema = new mongoose.Schema({
    id: Number,
    url: String,
    name: String
  })
  const bannersModel = mongoose.model("banners", bannersSchema);
  const mallNavsModel = mongoose.model("mallnavs", mallNavsSchema);


  /**
   * @param bannersData @Array 轮播图数据
   */
  /* bannersModel.insertMany(bannersData, (error, data) => {
      if(error) throw error
      console.log('success to insert data......')
  }) */
  /**
   * @param mallNavsData @Array nav数据
   */
  /* mallNavsModel.insertMany(mallNavsData, (error, data) => {
      if(error) throw error
      console.log('success to insert data......')
  }) */


  /* function getClientIP(req) {
    let ip= req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
      req.ip  ||
      req.connection.remoteAddress || // 判断 connection 的远程 IP
      req.socket.remoteAddress || // 判断后端的 socket 的 IP
      req.connection.socket.remoteAddress || ''
    if(ip) {
      ip = ip.replace('::ffff:', '')
    }
    return ip;
  } */

  /**
   * 获取轮播图信息
   */
  router.get('/banner', async (ctx, next) => {
    const data = await bannersModel.find()
    if(data)
      ctx.body = {code: 200, data, message: '获取banner成功'}
    else
      ctx.body = {code: 201, data: null, message: '获取banner失败'}
  })

  /**
   * 获取分类信息
   */
  router.get('/mallnav', async (ctx, next) => {
    const data = await mallNavsModel.find()
    if(data)
      ctx.body = {code: 200, data, message: '获取category成功'}
    else
      ctx.body = {code: 201, data: null, message: '获取banner失败'}
  })

module.exports = router