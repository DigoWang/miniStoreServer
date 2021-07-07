const router = require('koa-router')();
const mongoose = require('mongoose');
const { v4: uuid } = require("uuid");

const category1Data = require('../data/category1.json');
const category2Data = require('../data/category2.json');
const category3Data = require('../data/category3.json');

router.prefix('/category')

const category1or2Schema = new mongoose.Schema({
    grade: Number,
    name: String,
    id: Number,
    parentId: Number
})
const category3Schema = new mongoose.Schema({
    grade: Number,
    name:String,
    picUrl: String,
    id: Number,
    parentId: Number
});
const category1Model = mongoose.model('category1', category1or2Schema);
const category2Model = mongoose.model('category2', category1or2Schema);
const category3Model = mongoose.model('category3', category3Schema);

/**
 * @param category1Data @Array 一级分类数据
 */
/* category1Model.insertMany(category1Data, (error, data) => {
    if(error) throw error
    console.log('success to insert data......')
}) */

/**
 * @param category2Data @Array 二级分类数据
 */
/* category2Model.insertMany(category2Data, (error, data) => {
    if(error) throw error
    console.log('success to insert data......')
}) */

/**
 * @param category3Data @Array 三级分类数据
 */
/* category3Model.insertMany(category3Data, (error, data) => {
    if(error) throw error
    console.log('success to insert data......')
}) */

router.get('/category_one', async (ctx, next) => {
    const result = await category1Model.find();
    if(result) ctx.body = {code: 200, data: {category1List: result}, message: '获取一级分类成功'}
    else ctx.body = {code: 201, data: null, message: '获取一级分类失败'}
})
router.get('/category_two', async (ctx, next) => {
    const result = await category2Model.find();
    if(result) ctx.body = {code: 200, data: {category2List: result}, message: '获取二级分类成功'}
    else ctx.body = {code: 201, data: null, message: '获取二级分类失败'}
})
router.get('/category_three', async (ctx, next) => {
    const result = await category3Model.find();
    if(result) ctx.body = {code: 200, data: {category3List: result}, message: '获取三级分类成功'}
    else ctx.body = {code: 201, data: null, message: '获取三级分类失败'}
})


module.exports = router