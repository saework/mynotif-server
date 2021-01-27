const express = require("express");
//require('./scr/pass');
const cron = require('node-cron');
const _ = require('lodash');
const bodyParser = require("body-parser");
//const app = express();
const config = require('./config.js');
const cronFunc = require(`./scr/cron/cron-func`);
const cronTasks = require(`./scr/cron/cron-tasks`);
const PersBD = require(`./scr/db/db-seq`);
const jwt = require('jsonwebtoken');
const React = require('react');
const Router = require('react-router');
const passport = require('passport');
require('./scr/services/passp-strateg.js')(passport);

const bcrypt = require( 'bcrypt' );  // хеширование паролей
const emailFunc = require('./scr/services/email-func');
const logger = require('./scr/services/logger-config');

//const log4js = require("log4js");

//const LocalStrategy = require('passport-local').Strategy;


//!!! добавить защиту от sql-инъекций для форм !!! ////
//!!! удалить react, react-router !!!
//!!! проверка на дубликат пользователя !!!

const TIMEZONE = config.TIMEZONE;
const timeStopCronTasks = config.timeStopCronTasks;
const timeStartCronTasks = config.timeStartCronTasks;
const jwtTokenKey = config.jwtTokenKey;
// const prod = config.prod;

// if (prod){
//   log4js.configure({
// 	//appenders: { console: { type: 'console' }, file: { type: 'file', filename: 'logs/bot_'+process.argv[2]+'.log' } },
// 	appenders: { 
// 		console: { type: 'console'}, 
// 		file: { type: 'file', filename: 'logs/mynotif.log' } },
// 	categories: { default: { appenders: ['console', 'file'], level: 'info' } }
// 	});
// }else{
//   log4js.configure({
// 	appenders: {
// 	  out: {
// 		type: 'stdout',
// 		layout: {
// 		  //type: 'pattern', pattern: '%d %p %c %f:%l %m%n'
// 		  type: 'pattern', pattern: '%d %p  %f:%l - %m%n'
// 		}
// 	  }
// 	},
// 	categories: {
// 	  default: { appenders: ['out'], level: 'info', enableCallStack: true }
// 	}
//   });
// }

//const logger = log4js.getLogger("mynotif");
logger.trace("Entering cheese testing");
logger.debug("Got cheese.");
logger.info("Cheese is Comté.");
logger.warn("Cheese is quite smelly.");
logger.error("Cheese is too ripe!");
logger.fatal("Cheese was breeding ground for listeria.");
//console.log(process.env)
console.log(process.argv)



  const app = express();
  //app.use(express.bodyParser());
//   app.use(passport.initialize());
//   app.use(passport.session());


app.use(function(req, res, next){
	///!!! убрать !!!
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	///!!! убрать!!!
	next();
});

app.use(express.static(__dirname + "/public"));
 
app.use(express.json());


//!!! перезагружает страницу при роутинге - не подходит!!!
// app.get('/*', (request, response) => {
// 	//response.sendFile(path.join(__dirname, './public/index.html'));
// 	response.sendFile(__dirname + "/public/index.html");
// });


// app.get('/', (request, response) => {
// 	//response.sendFile(path.join(__dirname, './public/index.html'));
// 	response.sendFile(__dirname + "/public/index.html");
// });

// let generatePassword=()=> {
//     var length = 8,
//         charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
//         retVal = "";
//     for (var i = 0, n = charset.length; i < length; ++i) {
//         retVal += charset.charAt(Math.floor(Math.random() * n));
//     }
//     return retVal;
// }

// Сбросить пароль
app.post("/newpassword",  function(request, response){
	const currUserEmail = request.body.data.currUserEmail;

	if (currUserEmail){
		const newPassword = generatePassword();
		const passwordHash = bcrypt.hashSync(newPassword, 10 );
		if (passwordHash){
			//logger.info(`<< изменение записи в базе (изменен hash пароля пользователя: ${currUserEmail} >>`);
			logger.info(`Изменение записи в базе (изменен hash пароля пользователя: ${currUserEmail}`);
			PersBD.update({hash: passwordHash}, {
				where: {
				email: currUserEmail
				}
			}).then((res) => {
				if (res[0] === 1){
					const emailCapt = `Сервис mynotif.ru - пароль сброшен`;
					const emailText = `<b>Новый пароль:</b><b>${newPassword}</b>`;
					emailFunc.sendEmail(currUserEmail, emailCapt, emailText)
					const mes = "Новый пароль отправлен на Ваш Email"
					//logger.info(mes);
					logger.info(mes);
					response.json({result: "ok",mes: mes});
				}
			}).catch(err=>logger.info(err));
		}else{
			const errMes = "<< Пароль не обновлен. Не определен hash нового пароля >>"
			logger.info(errMes);
			response.json({result: errMes});
		}
	}else{
		const errMes = "<< Пароль не обновлен. Не определен email >>"
		logger.info(errMes);
		response.json({result: errMes});
	}
})


// let createUserAccount=(currUserEmail, password, response)=>{
// 	const passwordHash = bcrypt.hashSync( password, 10 );

// 	// генерируем jwt токен
// 	const jwtToken = jwt.sign({currUserEmail}, jwtTokenKey);
// 	const jwtHash = bcrypt.hashSync(jwtToken, 10 );
// 	if (jwtToken && jwtHash){
// 		PersBD.create({
// 			email: currUserEmail,
// 			bdData: "",
// 			hash: passwordHash,
// 			jwtHash: jwtHash
// 		}).then(resCreateUser=>{
// 			//logger.info(res);
// 			if (!_.isEmpty(resCreateUser)){
// 				logger.info("<<Учетная запись создана>>");
// 				const resCr = {result: "jwt", jwt: jwtToken}
// 				logger.info(resCr);
// 				response.json(resCr);
// 				return resCr
// 			}
// 		}).catch(err=>logger.info(err));
// 	}else{
// 		const errMes = "<<Учетная запись не создана. Ошибка генерации hash>>"
// 		logger.info(errMes);
// 		return {result: errMes}
// 	}
// }

// Зарегистрироваться
app.post("/signup",  function(request, response){

	let currUserEmail = request.body.username;
	let password = request.body.password; 
	if (currUserEmail && password){
		//logger.info(currUserEmail);
		currUserEmail = currUserEmail.replace(/"/g,'');
		logger.info(currUserEmail);
		if (currUserEmail){
			PersBD.findOne({
				attributes:['hash'],
				where:{
					email:currUserEmail
				}
			}).then(resHush=>{
				logger.info("<<Получен hash пользователя>>");
				if (resHush === null) {
					const createUserResult = createUserAccount(currUserEmail, password, response);
					//logger.info(createUserResult);
					//response.json(createUserResult);
				} else {
					const errMes = "Уже существует пользователь с таким email!"
					logger.info(errMes);
					response.json({result: errMes});
				}

				//const dbHash = resHush.hash; //
				// if (dbHash === null) {
				// 	const createUserResult = createUserAccount(currUserEmail, password);
				// 	response.json(createUserResult);
				// } else {
				// 	const errMes = "<<Учетная запись не создана. Уже существует пользователь с таким email!>>"
				// 	logger.info(errMes);
				// 	response.json({result: errMes});
				// }
			}).catch(err=>logger.info(err));
		}
	}else{
		const errMes = "Учетная запись не создана. Не определены email и/или пароль"
		logger.info(errMes);
		response.json({result: errMes});
	}
})


// Вход в аккаунт
app.post('/login', (request, response, next) => {
	passport.authenticate('local',  {session: false}, (err, user, info) => {
		   
	  if (err || !user) {
		return response.status(401).json({
		  result: 'Не верный логин или пароль!',
		  err: err
		})      
	  }
	  request.login(user, {session: false}, (err) => {
		if (err) {
			response.send(err)
		}
   
		// генерируем jwt токен
		const jwtToken = jwt.sign({user}, jwtTokenKey)  //!!
		//const token = jwt.sign({user}, jwtTokenKey,{ expiresIn: 604800})  // 1 week
		logger.info(jwtToken)
		//return  res.json({ user, token })
		const jwtHash = bcrypt.hashSync(jwtToken, 10 );
		if (jwtHash){
			PersBD.update({jwtHash: jwtHash}, {
				where: {
				email: user
				}
			}).then((res) => {
				if (res[0] === 1){
					const mes = "<< JWT записан в БД >>"
					logger.info(mes);
					response.json({jwtToken});
					return  jwtToken;
				}
			}).catch(err=>logger.info(err));
		}else{
			const mes = "<< Не определен jwtHash. Вход в систему отклонен >>"
			logger.info(mes);
			return  response.json(mes)
		}
		//return  res.json({jwtToken})
	  })
	})(request, response)
  })

app.post("/load", passport.authenticate('jwt', { session: false }), function(request,response){
//	app.post("/load", function(request,response){
	//logger.info(request);
	//let currUserEmail = "test@test"  ///!!! убрать!!
	logger.info(request.body)
	logger.info(request.headers)
	logger.info(request.data)
	let currUserEmail = request.body.currUserEmail;
	//let currUserEmail = request.query.currUserEmail;
	//logger.info(currUserEmail); 
	//if (currUserEmail){
		//logger.info(currUserEmail);
		currUserEmail = currUserEmail.replace(/"/g,'');
		logger.info(currUserEmail);
		if (currUserEmail){
			PersBD.findAll({
				attributes:['bdData'],
				where:{
					email:currUserEmail
				}
			}).then(res=>{
				logger.info("<<получены данные get запроса с параметром>>");
				logger.info(res);
				response.json(res);
			}).catch((err)=>{
				logger.info(err)
				response.json({result: "Ошибка сервера"});
			});
		}else{
			const mes = "Не определен Email!"
			logger.info(mes);
			response.json({result: mes});
		}
	//}
})

app.post("/home",
	//passport.authenticate('jwt', {session: false}),
	function (request, response) {
	if (request.body.data){
		const date = request.body.data;
		// if (date === "startCronTasks" ){
		// 	cronFunc.createParamsCheckAndStartCronTasksForAll();
		// 	//response.redirect('/SignIn');
		// 	//response.redirect('http://localhost:3001/login');//
			
		// }
		// if (date === "stopCronTasks" ){
		// 	cronFunc.stopCronTasks(cronTasks);
		// }
		// if ((date != "startCronTasks" ) && (date != "stopCronTasks" )){
			//logger.info(request.body.data);
		const bdRows = JSON.stringify(request.body.data.bdRows);
		const bdRowsArr = request.body.data.bdRows.bdRows;
		let currUserEmail = JSON.stringify(request.body.data.currUserEmail);	
		currUserEmail = currUserEmail.replace(/"/g,'');
		//logger.info(currUserEmail);
		if (currUserEmail){		
			PersBD.findAll({
				where:{
					email:currUserEmail
				}
			}).then(res=>{
				logger.info(res)
				if (res.length>0){
					logger.info(`<< Изменение записи в базе (изменены задачи пользователя: ${currUserEmail} >>`);
					PersBD.update({ bdData: bdRows }, {
						where: {
						email: currUserEmail
						}
					}).then((res) => {
						if (res[0] === 1){
							//response.send("<< данные таблицы обновлены >>");
							const mes = "Данные таблицы обновлены";
							response.json({result: "ok", mes: mes});
							logger.info("<< Запуск функции updateAndStartCronTasks >>");
							cronFunc.updateAndStartCronTasksByForUser(bdRowsArr, currUserEmail);
						}else{
							response.json({result: "ok", mes: "обновление таблицы не требуется"});
							logger.info("<< Запуск функции updateAndStartCronTasks >>");
						}
					//}).catch(err=>logger.info(err));
					}).catch((err)=>{
						logger.info(err)
						response.json({result: "Ошибка сервера"});
					});
				
					// }else{
				// 	logger.info(`<< добавление записи в базу (добавлен новый пользователь и его задачи: ${currUserEmail} >>`);
				// 	PersBD.create({
				// 		email: currUserEmail,
				// 		bdData: bdRows,
				// 		hash: jwtHash
				// 	}).then(res=>{
				// 		//logger.info(res);
				// 		if (!_.isEmpty(res)){
				// 			logger.info("запуск функции updateAndStartCronTasks");
				// 			cronFunc.updateAndStartCronTasksByForUser(bdRowsArr, currUserEmail);
				// 		}
				// 	}).catch(err=>logger.info(err));
				 }
				//response.send("<<данные таблицы обновлены>>");
			//}).catch(err=>logger.info(err));
		}).catch((err)=>{
			logger.info(err)
			response.json({result: "Ошибка сервера"});
		});
		}else{
			const mes = "Не определен Email!"
			logger.info(mes);
			response.status(401).send({result: mes});
		}
	//	}
	 }
    //response.send("!!!");
});

	logger.info('<< tasks: start waiting all - after restart server >>');
	cronFunc.createParamsCheckAndStartCronTasksForAll();

	// останавливаем все cron tasks, для перезапуска с учетом изменений
	cron.schedule(timeStopCronTasks, () => 
	{
		logger.info('<< tasks: destroy all >>');
		cronFunc.stopCronTasks(cronTasks);
	}, {
		scheduled: true,
		timezone: TIMEZONE
	});

	// запускаем на ожидание все cron tasks на сегодня, с учетом изменений
	cron.schedule(timeStartCronTasks, () =>
	{
		logger.info('<< tasks: start waiting all - for today>>');
		cronFunc.createParamsCheckAndStartCronTasksForAll();
	}, {
		scheduled: true,
		timezone: TIMEZONE
	});

// adding passport's strategies local and jwt
//require('./scr/passport.js')(passport);

app.listen(3000);

