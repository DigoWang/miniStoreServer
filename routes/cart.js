const router = require('koa-router')();
const mongoose = require('mongoose');
const { v4: uuid } = require("uuid");
const jwt = require('jsonwebtoken');

const goodsModel = require('../model/goodsModel');
const usersModel = require('../model/usersModel');
const wxusersModel = require('../model/wxusersModel');
const cartModel = require('../model/cartModel')

// 当前路由前缀
router.prefix('/cart');

const {TOKEN} = require('../config/index');
const judgeToken = require('../utils/judgeToken');

/**
 * 添加至购物车
 */
router.put("/addToCart", async (ctx, next) => {
    let { skuId } = ctx.request.body;
    skuId *= 1
    if(!skuId) next();
    
    const { token } = ctx.request.header;
    if (token) {
        const decoded =  jwt.verify(token, TOKEN);
        // token过期
        if(!decoded) {
            ctx.body = {code: 201, data: null, message: 'token已过期'}
        }
        const {id: userId} = decoded;
        const data = await goodsModel.findOne({ skuId });
        if (data) {
            const cart = await cartModel.findOne({ userId, skuId });
            if (cart) {
                const skuNum = cart.skuNum + 1;
                const cartPrice = cart.cartPrice + cart.skuPrice
                await cartModel.updateOne({ userId, skuId }, { skuNum, cartPrice }, (err, oCart) => {
                    if (oCart) {
                        ctx.body = {code: 200, data: null, message: '添加购物车成功'}
                    } else {
                        ctx.body = {code: 201, data: null, message: '添加购物车失败'}
                    }
                });       
            } else {
                const nCart = await cartModel.create(
                    {
                        brandName: data.brandName,
                        id: uuid(),
                        userId: userId,
                        skuId: skuId,
                        cartPrice: data.priceInfo.price,
                        skuNum: 1,
                        imgUrl: data.imageInfo.whiteImage,
                        skuName: data.skuName,
                        isChecked: 1,
                        skuPrice: data.priceInfo.price,
                });
                if(nCart) {
                    ctx.body = {code: 200, data: null, message: '创建购物车成功'}
                } else {
                    ctx.body = {code: 201, data: null, message: '创建购物车失败'}
                }
            }
        } else {
            ctx.body = {code: 201, data: null, message: '未找到相关商品'}
        }
    } else {
        ctx.body = {code: 201, data: null, message: '用户未登录'}
    }
});

/**
 * 根据token获取购物车信息
 */
router.get("/getCart", async (ctx, next) => {
    const { token } = ctx.request.header;
    if (token) {
        const decoded = await jwt.verify(token, TOKEN);
        // token过期
        if(!decoded) {
            ctx.body = {code: 201, data: null, message: 'token已过期'}
        } else {
            const {username, password} = decoded;
            let user = null
            if(password) {
                user = await usersModel.findOne({username, password});
            } else {
                user = await wxusersModel.findOne({username})
            }
            if(!user.id) next();
            const data = await cartModel.find({userId: user.id});
            if(data) {
                ctx.body = {code: 200, data: {cartList: data}, message: '获取购物车成功'}
            } else {
                ctx.body = {code: 200, data: [], message: '购物车为空'}
            }
        }       
    } else {
        ctx.body = { code: 201, data: null, message: '用户未登录' }
    }
});

/**
 * 修改购物车单个商品选中状态
 */
router.post('/checkOneCart', async (ctx, next) => {
    let {skuId, isChecked} = ctx.request.body;
    skuId *= 1
    isChecked *= 1
    if(!skuId || (isChecked !== 1 && isChecked !== 0)){
        ctx.body = {code: 201, data: null, message: '参数错误'}
    }
    const { token } = ctx.request.header;
    if (token) {
        const decoded = await jwt.verify(token, TOKEN);
        // token过期
        if(!decoded) {
            ctx.body = {code: 201, data: null, message: 'token已过期'}
        } else {
            const {id} = decoded;
            await cartModel.updateOne({skuId, userId: id}, {isChecked}, (err, data) => {
                if(data)
                    ctx.body = {code: 200, data: null, message: '修改选中状态成功'}
                else 
                    ctx.body = {code: 201, data: null, message: '修改选中状态失败'}

            })
        }
    } else {
        ctx.body = { code: 201, data: null, message: '用户未登录' }
    }
});

/**
 * 修改购物车全部商品选中状态
 */
router.post('/checkAllCart', async (ctx, next) => {
    let { isChecked } = ctx.request.body;
    isChecked *= 1;
    const { token } = ctx.request.header;
    if (token) {
        const decoded = await jwt.verify(token, TOKEN);
        // token过期
        if(!decoded) {
            ctx.body = { code: 201, data: null, message: 'token已过期' }
        } else {
            const {id} = decoded;
            await cartModel.updateMany({userId: id}, {isChecked}, (err, data) => {
                if(err) next();
                if(data) {
                    console.log(data)
                    ctx.body = { code: 200, data: null, message: '修改全部商品选中状态成功' }
                } else {
                    ctx.body = { code: 201, data: null, message: '购物车为空' }
                }
            })
        }
    } else {
        ctx.body = { code: 201, data: null, message: '用户未登录' }
    }
});

/**
 * 添加或减少商品数量
 */
router.post('/changeSkuNum', async (ctx, next) => {
    let {skuId, skuNum} = ctx.request.body;
    skuId *= 1;
    skuNum *= 1;
    if(!skuId || skuNum <= 0) {
        ctx.body = { code: 200, data: null, message: '参数错误' }
    }
    const {token} = ctx.request.header;
    if (token) {
        const decoded = await jwt.verify(token, TOKEN);
        // token过期
        if(!decoded) {
            ctx.body = {code: 201, data: null, message: 'token已过期'}
        } else {
            const {id} = decoded;
            const data = await cartModel.findOne({userId: id, skuId})
            if(data) {
                await cartModel.updateOne(
                    { userId: id, skuId }, 
                    { skuNum: skuNum, cartPrice: data.skuPrice * skuNum }, 
                    (err, data) => {
                        if(err) next();
                        if(data) {
                            ctx.body = {code: 200, data: null, message: '数量修改成功'}
                    } else {
                        ctx.body = {code: 201, data: null, message: '数量修改失败'}
                    }
                })
            } else {
                ctx.body = {code: 201, data: null, message: '未找到商品信息'}
            }
        }
    } else {
        ctx.body = { code: 201, data: null, message: '用户未登录' }
    }
    cartModel.findOne({userId: token, skuId}).exec((err, data) => {
      if(err) throw err;
      if(data) {
        cartModel.findOne({userId: token, skuId}).updateOne({
          skuNum: skuNum,
          cartPrice: data.skuPrice * skuNum
        }, (err, data) => {
          if(err) throw err
          if(data)
          response.send({status: 200, data: null})
        })
        
      }
    })
});

/**
 * 删除单个购物车商品
 */
router.delete('/deleteOneCart', async (ctx, next) => {
    const { skuId } = ctx.request.query;
    const result = await judgeToken(ctx, deleteOneCart);
    if(result) {
        ctx.body = {code: 200, data: null, message: '删除成功'}
    } else {
        ctx.body = {code: 201, data: null, message: '删除失败'}
    }


    async function deleteOneCart(userId) {
        const data = await cartModel.deleteOne({ userId, skuId });
        return data.deletedCount ? 1 : 0
    }    
});


module.exports = router