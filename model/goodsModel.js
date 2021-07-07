const mongoose = require('mongoose');
const goodsSchema = new mongoose.Schema({
    brandCode: String,
    brandName: String,
    categoryInfo: Object,
    comments: Number,
    commissionInfo: Object,
    couponInfo: Object,
    deliveryType: Number,
    goodCommentsShare: Number,
    imageInfo: Object,
    inOrderComm30Day: Number,
    inOrderCount30Days: Number,
    isHot: Number,
    isJdSale: Number,
    materialUrl: String,
    owner: String,
    priceInfo: Object,
    shopInfo: Object,
    skuId: Number,
    skuName: String,
    spuid: Number,
})
const goodsModel = mongoose.model("goods", goodsSchema);

module.exports = goodsModel