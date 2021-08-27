const jwt = require("jsonwebtoken")
//撒盐，加密时候混淆
const secret = '113Bmongodasd12asddasdasxZcxqwedqwdasdASjsdalkfnxcvmas'

//生成token
//info也就是payload是需要存入token的信息
exports.createToken = function(info) {
	let token = jwt.sign(info, secret, {
        //Token有效时间 单位s
		expiresIn: 60 * 60 * 24 * 7,
	})
	return token
}

//验证Token
exports.verifyToken = function verifyToken(token) {
	return new Promise((resolve, reject) => {
		jwt.verify(token, secret, (error, result) => {
            if(error){
                reject(error)
            } else {
                resolve(result)
            }
		})
	})
}

 