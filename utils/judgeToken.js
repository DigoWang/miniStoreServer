const jwt = require('jsonwebtoken');
const { TOKEN } = require('../config/index');

module.exports = async (ctx, callback) => {
  const { token } = ctx.request.header;
    if (token) {
      const decoded = await jwt.verify(token, TOKEN);
      // token过期
      if(!decoded) {
          ctx.body = { code: 201, data: null, message: 'token已过期' }
      } else {
        const { id: userId } = decoded;
        return callback(userId);
      }
    } else {
      ctx.body = { code: 201, data: null, message: '用户未登录' }
    }
}