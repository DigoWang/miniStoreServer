const mongoose = require('mongoose');
const wxusersSchema = new mongoose.Schema({
  id: String,
  username: String,
  password: String,
  gender: Number,
  avatarUrl: String
});
const wxusersModel = mongoose.model("wxusers", wxusersSchema);

module.exports = wxusersModel