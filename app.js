const express = require("express");
//require('./scr/pass');
const cron = require('node-cron');
const _ = require('lodash');
const bodyParser = require("body-parser");
//const app = express();
const config = require('./config.js');
const cronFunc = require(`./scr/cron-func`);
const cronTasks = require(`./scr/cron-tasks`);
const PersBD = require(`./scr/db-seq`);
const jwt = require('jsonwebtoken');
const React = require('react');
const Router = require('react-router');
const passport = require('passport');
require('./scr/passp-strateg.js')(passport);

const bcrypt = require( 'bcrypt' );  // хеширование паролей
const emailFunc = require('./scr/email-func');

//const LocalStrategy = require('passport-local').Strategy;


//!!! добавить защиту от sql-инъекций для форм !!! ////
//!!! удалить react, react-router !!!
//!!! проверка на дубликат пользователя !!!

const TIMEZONE = config.TIMEZONE;
const timeStopCronTasks = config.timeStopCronTasks;
const timeStartCronTasks = config.timeStartCronTasks;
const jwtTokenKey = config.jwtTokenKey;


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

let generatePassword=()=> {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

// Сбросить пароль
app.post("/newpassword",  function(request, response){
	const currUserEmail = request.body.data.currUserEmail;

	if (currUserEmail){
		const newPassword = generatePassword();
		const passwordHash = bcrypt.hashSync(newPassword, 10 );
		if (passwordHash){
			console.log(`<< изменение записи в базе (изменен hash пароля пользователя: ${currUserEmail} >>`);
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
					console.log(mes);
					response.json({result: "ok",mes: mes});
				}
			}).catch(err=>console.log(err));
		}else{
			const errMes = "<< Пароль не обновлен. Не определен hash нового пароля >>"
			console.log(errMes);
			response.json({result: errMes});
		}
	}else{
		const errMes = "<< Пароль не обновлен. Не определен email >>"
		console.log(errMes);
		response.json({result: errMes});
	}
})


let createUserAccount=(currUserEmail, password, response)=>{
	const passwordHash = bcrypt.hashSync( password, 10 );

	// генерируем jwt токен
	const jwtToken = jwt.sign({currUserEmail}, jwtTokenKey);
	const jwtHash = bcrypt.hashSync(jwtToken, 10 );
	if (jwtToken && jwtHash){
		PersBD.create({
			email: currUserEmail,
			bdData: "",
			hash: passwordHash,
			jwtHash: jwtHash
		}).then(resCreateUser=>{
			//console.log(res);
			if (!_.isEmpty(resCreateUser)){
				console.log("<<Учетная запись создана>>");
				const resCr = {result: "jwt", jwt: jwtToken}
				console.log(resCr);
				response.json(resCr);
				return resCr
			}
		}).catch(err=>console.log(err));
	}else{
		const errMes = "<<Учетная запись не создана. Ошибка генерации hash>>"
		console.log(errMes);
		return {result: errMes}
	}
}

// Зарегистрироваться
app.post("/signup",  function(request, response){

	let currUserEmail = request.body.username;
	let password = request.body.password; 
	if (currUserEmail && password){
		//console.log(currUserEmail);
		currUserEmail = currUserEmail.replace(/"/g,'');
		console.log(currUserEmail);
		if (currUserEmail){
			PersBD.findOne({
				attributes:['hash'],
				where:{
					email:currUserEmail
				}
			}).then(resHush=>{
				console.log("<<Получен hash пользователя>>");
				if (resHush === null) {
					const createUserResult = createUserAccount(currUserEmail, password, response);
					//console.log(createUserResult);
					//response.json(createUserResult);
				} else {
					const errMes = "Уже существует пользователь с таким email!"
					console.log(errMes);
					response.json({result: errMes});
				}

				//const dbHash = resHush.hash; //
				// if (dbHash === null) {
				// 	const createUserResult = createUserAccount(currUserEmail, password);
				// 	response.json(createUserResult);
				// } else {
				// 	const errMes = "<<Учетная запись не создана. Уже существует пользователь с таким email!>>"
				// 	console.log(errMes);
				// 	response.json({result: errMes});
				// }
			}).catch(err=>console.log(err));
		}
	}else{
		const errMes = "Учетная запись не создана. Не определены email и/или пароль"
		console.log(errMes);
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
		console.log(jwtToken)
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
					console.log(mes);
					response.json({jwtToken});
					return  jwtToken;
				}
			}).catch(err=>console.log(err));
		}else{
			const mes = "<< Не определен jwtHash. Вход в систему отклонен >>"
			console.log(mes);
			return  response.json(mes)
		}
		//return  res.json({jwtToken})
	  })
	})(request, response)
  })

app.post("/load", passport.authenticate('jwt', { session: false }), function(request,response){
	//console.log(request);
	//let currUserEmail = "test@test"  ///!!! убрать!!
	console.log(request.body)
	let currUserEmail = request.body.data.currUserEmail;
	//let currUserEmail = request.query.currUserEmail;
	console.log(currUserEmail); 
	if (currUserEmail){
		//console.log(currUserEmail);
		currUserEmail = currUserEmail.replace(/"/g,'');
		console.log(currUserEmail);
		if (currUserEmail){
			PersBD.findAll({
				attributes:['bdData'],
				where:{
					email:currUserEmail
				}
			}).then(res=>{
				console.log("<<получены данные get запроса с параметром>>");
				console.log(res);
				response.json(res);
			}).catch(err=>console.log(err));
		}
	}
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
			//console.log(request.body.data);
		const bdRows = JSON.stringify(request.body.data.bdRows);
		const bdRowsArr = request.body.data.bdRows.bdRows;
		let currUserEmail = JSON.stringify(request.body.data.currUserEmail);	
		currUserEmail = currUserEmail.replace(/"/g,'');
		//console.log(currUserEmail);
		if (currUserEmail){		
			PersBD.findAll({
				where:{
					email:currUserEmail
				}
			}).then(res=>{
				console.log(res)
				if (res.length>0){
					console.log(`<< изменение записи в базе (изменены задачи пользователя: ${currUserEmail} >>`);
					PersBD.update({ bdData: bdRows }, {
						where: {
						email: currUserEmail
						}
					}).then((res) => {
						if (res[0] === 1){
							response.send("<<данные таблицы обновлены>>");
							console.log("<< запуск функции updateAndStartCronTasks >>");
							cronFunc.updateAndStartCronTasksByForUser(bdRowsArr, currUserEmail);
						}
					}).catch(err=>console.log(err));
				// }else{
				// 	console.log(`<< добавление записи в базу (добавлен новый пользователь и его задачи: ${currUserEmail} >>`);
				// 	PersBD.create({
				// 		email: currUserEmail,
				// 		bdData: bdRows,
				// 		hash: jwtHash
				// 	}).then(res=>{
				// 		//console.log(res);
				// 		if (!_.isEmpty(res)){
				// 			console.log("запуск функции updateAndStartCronTasks");
				// 			cronFunc.updateAndStartCronTasksByForUser(bdRowsArr, currUserEmail);
				// 		}
				// 	}).catch(err=>console.log(err));
				 }
				//response.send("<<данные таблицы обновлены>>");
			}).catch(err=>console.log(err));
		}else{
			const mes = "Не определен Email!"
			console.log(mes);
			response.status(401).send({result: mes});
		}
	//	}
	 }
    //response.send("!!!");
});

	console.log('<< tasks: start waiting all - after restart server >>');
	cronFunc.createParamsCheckAndStartCronTasksForAll();

	// останавливаем все cron tasks, для перезапуска с учетом изменений
	cron.schedule(timeStopCronTasks, () => 
	{
		console.log('<< tasks: destroy all >>');
		cronFunc.stopCronTasks(cronTasks);
	}, {
		scheduled: true,
		timezone: TIMEZONE
	});

	// запускаем на ожидание все cron tasks на сегодня, с учетом изменений
	cron.schedule(timeStartCronTasks, () =>
	{
		console.log('<< tasks: start waiting all - for today>>');
		cronFunc.createParamsCheckAndStartCronTasksForAll();
	}, {
		scheduled: true,
		timezone: TIMEZONE
	});

// adding passport's strategies local and jwt
//require('./scr/passport.js')(passport);

app.listen(3000);

