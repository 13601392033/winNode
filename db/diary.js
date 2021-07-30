var mongoose = require("./db.js");
let diarySchema = mongoose.Schema({
    id: String, // 唯一标识
    title: String,
    content: String,
    userId: String,
    date: Number,
    dateTime: String,//年月日
})

let DiaryModel = mongoose.model("diary", diarySchema, "diary");
module.exports = DiaryModel;