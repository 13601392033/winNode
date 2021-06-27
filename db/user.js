var mongoose = require("./db.js");
let UserSchema = mongoose.Schema({
    name: String,
    userName:String,
    password:String,
})

let UserModel = mongoose.model(null, UserSchema, "user");

module.exports = UserModel;