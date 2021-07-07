const router = require('koa-router')();
const mongoose = require('mongoose');
const { v4: uuid } = require("uuid");
const jwt = require('jsonwebtoken');
const moment = require('moment');

const goodsModel = require('../model/goodsModel');
const usersModel = require('../model/usersModel');
const wxusersModel = require('../model/wxusersModel');
const cartModel = require('../model/cartModel');

// 当前路由前缀
router.prefix('/order');

const {TOKEN} = require('../config/index');
const judgeToken = require('../utils/judgeToken');

const orderSchema = new mongoose.Schema({
    orderId: String,
    userId: String,
    skuId: Number,
    skuName: String,
    skuNum: Number,
    skuPrice: Number,
    imgUrl: String,
    brandName: String,
    totalPrice: Number,
    isPaid: Number,
    isFinished: Number,
    consigneeInfo: Object,
    createTime: String,
    arriveTime: String
});
const orderModel = mongoose.model("orders", orderSchema);

/**
 * 添加单个商品订单
 */
router.put('/addOneOrder', async (ctx, next) => {
    let { skuId } = ctx.request.body;
    skuId *= 1;
    if(!skuId) {
        ctx.body = { code: 201, data: null, message: '参数错误' }
    }
    const result = await judgeToken(ctx, addOneOrder);
    if(result) {
        ctx.body = {code: 200, data: null, message: '添加订单成功'}
    } else {
        ctx.body = {code: 201, data: null, message: '添加订单失败'}
    }
    async function addOneOrder(userId) {
        const data = await goodsModel.findOne({ skuId });
        if(data) {
            const order = await orderModel.create({
                brandName: data.brandName,
                orderId: uuid(),
                userId: userId,
                skuId: skuId,
                totalPrice: data.priceInfo.price,
                skuNum: 1,
                imgUrl: data.imageInfo.whiteImage,
                skuName: data.skuName,
                skuPrice: data.priceInfo.price,
                isPaid:0,
                isFinished:0,
                consigneeInfo: {
                    cName: '彭于晏',
                    cTel: '13485724452',
                    cAddress: '北京市昌平区北七家镇宏福科技园综合楼尚硅谷教育'
                },
                createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                arriveTime: '2100-12-31'
            });
            return order ? 1 : 0
        } else {
            return 0      
        }
    }
})

/**
 * 提交购物车的商品订单
 */
router.put('/addOrders', async (ctx, next) => {
    let { skuIdList } = ctx.request.body;
    if( !Array.isArray(skuIdList) || !skuIdList || !skuIdList.length) {
        ctx.body = { code: 201, data: null, message: '参数错误' }
    }
    let result = await judgeToken(ctx, addManyOrder);
    console.log(result)
    if(result) {
        ctx.body = {code: 200, data: null, message: '创建订单成功'}
    } else {
        ctx.body = { code: 201, data: null, message: '创建订单失败' }
    }
    async function addManyOrder(userId) {
        const orderId = uuid();
        return skuIdList.every(async skuId => {
            const data = await cartModel.findOne({ skuId: skuId*1, userId });
            if(data) {
                const order = await orderModel.create({
                    brandName: data.brandName,
                    orderId,
                    userId: data.userId,
                    skuId: data.skuId,
                    totalPrice: data.cartPrice,
                    skuNum: data.skuNum,
                    imgUrl: data.imgUrl,
                    skuName: data.skuName,
                    skuPrice: data.skuPrice,
                    isPaid:1,
                    isFinished:1,
                    consigneeInfo: {
                        cName: '彭于晏',
                        cTel: '13485724452',
                        cAddress: '北京市昌平区北七家镇宏福科技园综合楼尚硅谷教育'
                    },
                    createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                    arriveTime: '2100-12-31'
                });
                await cartModel.deleteMany({ skuId: skuId*1, userId })
                return order ? true : false
            } else {
                return false 
            }
        })
    }
   
    /* const {token} = ctx.request.header;
    if (token) {
        const decoded =  jwt.verify(token, TOKEN);
        // token过期
        if(!decoded) {
            ctx.body = {code: 201, data: null, message: 'token已过期'}
        }
        const {id:userId} = decoded;
        const data = await cartModel.find({isChecked: 1,userId})
        if(data){
            const list= data.map(item=>{
                return  {
                      brandName: item.brandName,
                      id: item.id,
                      userId: item.userId,
                      skuId: skuId,
                      totalPrice: item.priceInfo.price *item.skuNum,
                      skuNum: item.skuNum,
                      imgUrl: item.imageInfo.whiteImage,
                      skuName: item.skuName,
                      skuPrice: item.priceInfo.price,
                  }
              })
              const order = await orderModel.insertMany(list);
              if(order) {
                  ctx.body = {code: 200, data: null, message: '添加订单成功'}
              } else {
                  ctx.body = {code: 201, data: null, message: '添加订单失败'}
              }
        }else{
            ctx.body = {code: 201, data: null, message: '添加订单失败'}
        }
    
    } */
})

/**
 * 获取订单列表
 */
router.get('/orderList', async (ctx, next) => {
    const data = await judgeToken(ctx, getOrderList);
    if(data) {
        ctx.body = {code: 200, data: { orderList: data }, message: '获取订单列表成功'}
    } else {
        ctx.body = {code: 200, data: { orderList: [] }, message: '暂无订单信息' }
    }
    async function getOrderList(userId) {
        const data = await orderModel.find({userId});
        return data
    }
})


module.exports = router