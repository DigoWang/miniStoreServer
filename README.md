# mini-server
电商小程序后端服务器

## 技术栈:
   Node.js + koa2 + koa-router + mongodb(数据库) + mongoose + jwt(制作token， token校验)

## 打开方式
  1. 项目根目录运行命令 ` npm i `, 安装第三方包
  2. 运行打开 mongodb
  3. 打开 routes 文件夹下的 home.js, goods.js, category.js 里面的数据库插入函数调用的注释
  4. 项目根目录运行命令 ` npm run dev ` 运行
注意:运行之后, 如果控制台打印出 'success to insert data......', 代表数据插入成功, 请立刻注释掉数据库插入函数调用, 否则下次启动项目或更改文件的时候会重复向数据库插入数据

### 如果需要实现微信登录或者微信支付, 请修改 config 目录下的 index.js中的相应参数
