const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({
    id: String,
    userId: String,
    skuId: Number,
    cartPrice: Number,
    skuNum: Number,
    imgUrl: String,
    skuName: String,
    isChecked: Number,
    skuPrice: Number,
    brandName: String
});
const cartModel = mongoose.model("carts", cartSchema);
module.exports = cartModel