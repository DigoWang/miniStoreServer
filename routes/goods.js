const router = require('koa-router')();
const mongoose = require('mongoose');

const goodsData = require('../data/goods.json');

const goodsModel = require('../model/goodsModel')

//当前路由前缀
router.prefix('/goods')

/**
 * @param goodsData @Array 商品数据
 */
/* goodsModel.insertMany(goodsData, (error, data) => {
    if(error) throw error
    console.log('success to insert data......')
}) */

/**
 * 获取热门搜索关键字数组
 */
router.get('/hot_search', (ctx, next) => {
    const data = ['华为mate40', 'Apple手机', '懒人减肥机', '健身划船机', '雀氏纸尿裤', '补水面膜', '老人机', '游戏笔记本电脑', 'DR钻戒']
    ctx.body = {code: 200, data, message: '获取热门搜索成功'}
})

/**
 * 搜索获取商品信息
 */
router.get("/search_goods", async (ctx, next) => {
    let { keyword, pageIndex } = ctx.request.query;
    const reg = new RegExp(keyword, "i");
    // 如果传了 keyword, 没有传 pageIndex, 则返回按照搜索内容返回相关的第一页数据
    if (keyword && !pageIndex) {
        const data = await goodsModel.find({
            $or: [
                //多条件，数组
                {
                    brandCode: { $regex: reg }
                },
                {
                    brandName: { $regex: reg }
                },
                {
                    skuName: { $regex: reg }
                },
            ],
        }, null, { limit: 20, sort: { comments: 1 }});
        ctx.body = {code: 200, data: {goodsList: data}, message: '搜索获取商品数据成功'}

        // 如果没有传参数, 则返回全部数据,用于首页的全部展示
    } 
    // 如果传了 keyword 和 pageIndex, 则返回按照搜索内容返回相关的第 pageIndex 页数据
    else if(keyword && pageIndex) {
        const data = await goodsModel.find({
            $or: [
                //多条件，数组
                {
                    brandCode: { $regex: reg }
                },
                {
                    brandName: { $regex: reg }
                },
                {
                    skuName: { $regex: reg }
                },
            ],
        }, null, {skip: 20*(pageIndex-1), limit: 20, sort:{ comments: 1 }});
        ctx.body = {code: 200, data: {goodsList: data}, message: '搜索获取商品数据成功'}
    } 
    // 如果没传 keyword， 则返回第 pageIndex 页的数据
    else {
        pageIndex *= 1
        if(pageIndex > 1) {
            const data = await goodsModel.find({}, null, {skip: 20*(pageIndex-1), limit: 20, sort:{ comments: 1 }})
            ctx.body = {code: 200, data: {goodsList: data}, message: '获取商品数据成功'}
        } else {
            const data = await goodsModel.find({}, null, {limit: 20, sort:{ comments: 1 }});
            ctx.body = {code: 200, data: {goodsList: data}, message: '获取商品数据成功'}
        }
    }
});

/**
 * 点击三级分类获取对应分类的商品信息
 */
router.get("/category_goods", async (ctx, next) => {
    let { category3Id, pageIndex } = ctx.request.query;
    category3Id *= 1
    if(category3Id && !pageIndex) {
        const data = await goodsModel.find({"categoryInfo.cid3": category3Id}, null, {limit: 20, sort:{ comments: 1 }})
        if(data)
            ctx.body = {code: 200, data: {goodsList: data}, message: '获取分类商品成功'}
        else
            ctx.body = {code: 201, data: null, message: '获取分类商品失败'}

    } 
    else if(category3Id && pageIndex) {
        pageIndex *= 1;
        const data = await goodsModel.find({"categoryInfo.cid3": category3Id}, null, {skip: 20*(pageIndex-1),limit: 20, sort:{ comments: 1 }})
        if(data) 
            ctx.body = {code: 200, data: {goodsList: data}, message: '获取分类商品成功'}
        else
            ctx.body = {code: 201, data: null, message: '获取分类商品失败'}
    }
    else {
        ctx.body = {code: 201, data: null, message: '参数错误'}
    }
})

/**
 * 点击商品选项卡获取商品详情
 */
router.get("/goods_detail", async (ctx, next) => {
    let { skuId } = ctx.request.query;
    skuId *= 1
    if(skuId) {
        const data = await goodsModel.findOne({skuId});
        if(data) {
            ctx.body = {code: 200, data, message: '获取商品详情成功'}
        } else {
            ctx.body = {code: 201, data: null, message: '未找到对应商品数据'}
        }
    } else {
        ctx.body = {code: 201, data: null, message: '参数错误'}
    }
})

module.exports = router