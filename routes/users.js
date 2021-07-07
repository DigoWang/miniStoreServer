const router = require('koa-router')();
const mongoose = require('mongoose');
const { v4: uuid } = require("uuid");
const jwt = require('jsonwebtoken');
const fly = require('flyio');

const {appId, appSecret, TOKEN} = require('../config/index')

const usersModel = require('../model/usersModel');
const wxusersModel = require('../model/wxusersModel');


//当前路由前缀
router.prefix('/users')


  // 注册
  router.put('/register', async function (ctx, next) {
    let { username, password } = ctx.request.body;

    username = (username || '').trim()
    password = (password || '').trim()
    if(!username || !password) next();
    await usersModel.findOne({ username }, (err, data) => {
      //判断，如果数据库中存在相同用户名的数据，返回
      if (data) {
        ctx.body = { code: 201, data: null, message: '用户名已被占用, 重新起个名吧' };
      } else {
          const id = uuid();
          usersModel.create( { id, username, password, avatarUrl: 'https://files.catbox.moe/00l416.jpg' })
          ctx.body = { code: 200, data: null, message: '注册成功' };
      }
    });
  });
  
  // 登录
  router.post('/login', async function (ctx, next) {
    const {username, password} = ctx.request.body;
    const data = await usersModel.findOne({username, password});
    if(data) {
      const token = jwt.sign({username, password, id: data.id}, TOKEN, {expiresIn: 60*60*12})
      ctx.body = {code: 200, data: { userInfo: { username, avatarUrl: data.avatarUrl, id: data.id } }, token, message: '登录成功'}
    } else {
      ctx.body = {code: 201, data: null, message: '用户名或密码错误'}
    }
  }),

  // 根据 token 登录
  router.post('/login_token', async function (ctx, next) {
    const {token} = ctx.request.header;
    if(!token) {
      ctx.body = {code: 201, data: null, message: '未携带token, 请去往登录页登录'};
    } else {
      // jwt 解码 token 前必须加 await
      await jwt.verify(token, TOKEN, async (err, decoded) => {
      if(!decoded) {
        ctx.body = {code: 201, data: null, message: 'token已过期, 请重新登录'};
      } else {
        const {username, password} = decoded;
        await usersModel.findOne({username, password}, (err, data) => {
          if(data) {
            const token = jwt.sign({username, password, id: data.id}, TOKEN, {expiresIn: 60*60*12})
            ctx.body = {code: 200, data: { userInfo: { username, avatarUrl: data.avatarUrl, id: data.id } }, token, message: '登录成功'}
          } else {
            ctx.body = {code: 201, data: null, message: 'token校验失败， 请重新登录'}
          }
        })
      }
      })
    }
  })

  // 微信登录
  router.post('/wxlogin', async (ctx, next) => {
    const {code, userInfo} = ctx.request.body;
    if(!code) next();
    // const result = await fly.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`)
    
    const data = await wxusersModel.findOne({ username: userInfo.nickName });
    if (data) {
      const token = jwt.sign({ username: data.username, password: data.password, id: data.id }, TOKEN, {expiresIn: 60*60*12})
      ctx.body = { code: 200, data: {userInfo: { username: data.username, avatarUrl: data.avatarUrl, id: data.id } }, token, message: '登录成功' };
    } else {
        const id = uuid();
        wxusersModel.create( { id, username: userInfo.nickName, password:'', avatarUrl: userInfo.avatarUrl })
        const token = jwt.sign({ username: userInfo.nickName, password: '', id }, TOKEN, {expiresIn: 60*60*12})
        ctx.body = { code: 200, data: { userInfo: { username: userInfo.nickName, avatarUrl: userInfo.avatarUrl, id } }, token, message: '注册成功' };
    }
  })

  
module.exports = router