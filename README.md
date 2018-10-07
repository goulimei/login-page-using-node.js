# login-page-using-node.js
User Login functionality with express-session middleware use node.js.

基于express框架，结合cookie-parser、body-parser、express-session中间件、自定义路由，实现用户登录功能。利用morgan中间件，记录客户端访问情况的日志，输出到控制台和文件。通过ejs模板，实现视图层与逻辑层分离，通过render进行页面渲染。对用户登录进行业务逻辑层面处理，通过Redis客户端和逻辑判断，检测数据库是否已有用户名KEY，若有，则获取对应value值进行判定；若无，则将用户名和密码，以键值对形式存入Redis。同时对session信息进行持久化，方便多个请求间共享用户会话。
