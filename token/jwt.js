// 引入模块依赖
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
let key = "I_LOVE_JING";
// 创建 token 类
class Jwt {
    constructor(data) {
        this.data = data;

    }

    //生成token
    generateToken() {
        let data = this.data;
        let created = Math.floor(Date.now() / 1000);
        //let cert = fs.readFileSync(path.join(__dirname, '../pem/private_key.pem'));//私钥 可以自己生成
        let cert = key;
        let token = jwt.sign({
            data,
            exp: created + 60 * 30,
        }, cert);
        return token;
    }
//, {algorithms: ['RS256']}
    // 校验token
    verifyToken() {
        let token = this.data;
        //let cert = fs.readFileSync(path.join(__dirname, '../pem/public_key.pem'));//公钥 可以自己生成
        let cert = key;
        let res;
        try {
            let result = jwt.verify(token, cert) || {};
            let {exp = 0} = result, current = Math.floor(Date.now() / 1000);
            if (current <= exp) {
                res = result.data || {};
            }
        } catch (e) {
            res = 'err';
        }
        return res;
    }
}

module.exports = Jwt;