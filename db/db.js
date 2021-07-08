const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://admin:zhflovezhf1314@1.117.21.31:27127/mf?authSource=admin", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
});
module.exports = mongoose;