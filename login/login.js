//引入依赖模块 
var morgan = require('morgan');//日志
var cookieParser = require('cookie-parser');//访问cookie数据
var bodyParser = require('body-parser');//访问body数据
var session = require('express-session');//访问session数据

//初始化Redis客户端
var redis = require('redis');
var redisClient = redis.createClient('6379','127.0.0.1');
var redisStore = require('connect-redis')(session);


//引入依赖模块，并初始化
var app = require('express')();

//记录客户端访问情况，输出到控制台
app.use(morgan('dev'));

//记录客户端访问情况，输出到文件
var fs = require('fs');
var logStream = fs.createWriteStream("./logs/log.txt");
app.use(morgan('combined',{stream:logStream}));

//使用ejs模块引擎 
app.set('view engine','ejs');
app.set('views',__dirname + '/views');
app.set('view options', {layout: false});


//记录是否已经登录和登录后的用户名
var logged_in = false;
var user = null;
/*
*
The extended option allows to choose between parsing 
the URL-encoded data with the querystring library (when false) 
or the qs library (when true). The “extended” syntax allows for 
rich objects and arrays to be encoded into the URL-encoded format, 
allowing for a JSON-like experience with URL-encoded. 
For more information, please see the qs library.
*
*/
app.use(bodyParser.json({ type: 'text/html' }));
app.use(bodyParser.urlencoded({ extended: true }));//use long time
app.use(cookieParser('keyboard cat'));
app.use(session(
	{
		secret:'my app secret',
		store: new redisStore({client:redisClient}),
		resave: false,
	  	saveUninitialized: true,
	  	cookie: { maxAge:60000,
	  		secure: true }
	}
));

//.use()

//检测用户是否已经登录
app.get('/',function(req,res,next){
	if (logged_in) {
		console.log(req.session.name);
		res.render('hello',{name:user});
	} else {
		next();
	}
});

//若用户未登录s
app.get('/',function(req,res,next){
	res.render('login');
});


//进行用户名和密码的验证
app.post('/login',function(req,res,next){
	console.log("req.body.user: " + req.body.user);
	console.log("req.body.password: " + req.body.password);

	redisClient.exists(req.body.user,function(err,valueKey){
		if (valueKey == 0) {
			console.log('user not exist, add');
			logged_in = true;
			redisClient.set(req.body.user,req.body.password);
			user = req.body.user;
			res.status(200).send('Authenticated!');
		} else{
			redisClient.get(req.body.user,function(err,value){
				if(req.body.password == value){
					console.log('password right');
					logged_in = true;
					user = req.body.user;
					res.status(200).send('Authenticated!');
				}else{
					console.log('password wrong');
					res.status(200).send('Bad username/password');
				}
			});
		}
	});
});

//登出
app.get('/logout',function(req,res,next){
	logged_in = false;
	res.status(200).send('Logged out!');
});


app.listen(3000);

