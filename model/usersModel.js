const mongoose = require('mongoose');
const usersSchema = new mongoose.Schema({
  id: String,
  username: String,
  password: String,
  avatarUrl: String
});
const usersModel = mongoose.model("users", usersSchema);

module.exports = usersModel