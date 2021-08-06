var mongoose = require("./db.js");
let UserSchema = mongoose.Schema({
    name: String,
    userName: String,
    password: String,
    avatar: String,
    email: String,
    phone: Number,
    age: Number,
})

let UserModel = mongoose.model("user", UserSchema, "user");

module.exports = UserModel;