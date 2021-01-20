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

//const LocalStrategy = require('passport-local').Strategy;


//!!! добавить защиту от sql-инъекций для форм !!! ////
//!!! удалить react, react-router !!!
//!!! проверка на дубликат пользователя !!!

const TIMEZONE = config.TIMEZONE;
const timeStopCronTasks = config.timeStopCronTasks;
const timeStartCronTasks = config.timeStartCronTasks;
const jwtTokenKey = config.jwtTokenKey;



// passport.use('local',new LocalStrategy(
// 	function(username, password, done) {
// 		user = "test@test"
// 		return done(null, user);

// 	//   User.findOne({ username: username }, function(err, user) {
// 	// 	if (err) { return done(err); }
// 	// 	if (!user) {
// 	// 	  return done(null, false, { message: 'Incorrect username.' });
// 	// 	}
// 	// 	if (!user.validPassword(password)) {
// 	// 	  return done(null, false, { message: 'Incorrect password.' });
// 	// 	}
// 	// 	return done(null, user);
// 	//   });
// 	}

//   ));

//   passport.use('local-my',new LocalStrategy(
// 	function(username, password, done) {
// 	  User.findOne({ username: username }, function(err, user) {
// 		if (err) { return done(err); }
// 		if (!user) {
// 		  return done(null, false, { message: 'Incorrect username.' });
// 		}
// 		if (!user.validPassword(password)) {
// 		  return done(null, false, { message: 'Incorrect password.' });
// 		}
// 		return done(null, user);
// 	  });
// 	}
//   ));


// passport.use(new LocalStrategy({
//     usernameField: 'email',
//     passwordField: 'password',
//     passReqToCallback: true,
//     session: false
//   },
//   function(req, username, password, done) {
// 	  User.findOne({ username: username }, function(err, user) {
// 		if (err) { return done(err); }
// 		if (!user) {
// 		  return done(null, false, { message: 'Incorrect username.' });
// 		}
// 		if (!user.validPassword(password)) {
// 		  return done(null, false, { message: 'Incorrect password.' });
// 		}
// 		return done(null, user);
// 	  });
// 	}
//   ));

//   passport.serializeUser(function(user, cb) {
// 	cb(null, user.id);
//   });
  
//   passport.deserializeUser(function(id, cb) {
// 	db.users.findById(id, function (err, user) {
// 	  if (err) { return cb(err); }
// 	  cb(null, user);
// 	});
//   });

  ///!!!//
  const app = express();
  //app.use(express.bodyParser());
//   app.use(passport.initialize());
//   app.use(passport.session());
//!!!

// passport.use(new LocalStrategy(
// 	function(username, password, done) {
// 	  //const user = "test@test";
// 	  console.log("local!!");
// 	  //return done(null, user)
// 	  return done(null, false, { message: 'Incorrect username.' })
// 	  // User.findOne({ username: username }, function (err, user) {
// 	  //   if (err) { return done(err); }
// 	  //   if (!user) {
// 	  //     return done(null, false, { message: 'Incorrect username.' });
// 	  //   }
// 	  //   if (!user.validPassword(password)) {
// 	  //     return done(null, false, { message: 'Incorrect password.' });
// 	  //   }
// 	  //   return done(null, user);
// 	  // });  //
// 	}	
//   ));

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

//app.use('/load', passport.authenticate('jwt', { session: false }));

// app.use('/home', 
//   passport.authenticate('jwt', {session: false}),(err, user, info) => {
//   //require('./routes/users.js')
//   console.log("!!!");
//   response.sendFile(__dirname + "/public/index.html");
//   }
//   )

// app.use((req, res, next) => {
// 	if(req.headers.authorization){
// 	  jwt.verify(req.headers.authorization.split(' ')[1], tokenKey, (err, payload) => {
// 		if(err)
// 		  next();
// 		else if(payload){
// 		  for(let user of users){
// 			if(user.id === payload.id){
// 			  req.user = user;
// 			  next();
// 			}
// 		  }
   
// 		  if(!req.user) next();
// 		}
// 	  });
// 	}
   
// 	next();
//    });
   
   ///!!!
//    app.get("/home", function(request,response){
// 	//app.get("localhost:3001/home", function(request,response){
// 	let currUserEmail = request.query.currUserEmail;
// 	//console.log(currUserEmail); 
// 	if (currUserEmail){
// 		if (currUserEmail =="test@test"){
// 			response.redirect('http://localhost:3000/home');
// 		}else{
// 			response.redirect('http://localhost:3000/login');
// 		}

// 		response.json(res);
// 	}
// })
   ///!!!!
//    app.get("/login", function(request,response){
// 	response.redirect('http://localhost:3000/login');
// })

// app.get('*', function (req, res) { // This wildcard method handles all requests

//     Router.run(routes, req.path, function (Handler, state) {
//         var element = React.createElement(Handler);
//         var html = React.renderToString(element);
//         res.render('main', { content: html });
//     });
// });


//!!! перезагружает страницу при роутинге - не подходит!!!
// app.get('/*', (request, response) => {
// 	//response.sendFile(path.join(__dirname, './public/index.html'));
// 	response.sendFile(__dirname + "/public/index.html");
// });


// app.get('/', (request, response) => {
// 	//response.sendFile(path.join(__dirname, './public/index.html'));
// 	response.sendFile(__dirname + "/public/index.html");
// });

// app.get('/home', (request, response) => {
// 	//response.sendFile(path.join(__dirname, './public/index.html')); //
// 	const jwt = request.query.jwt;
// 	if (jwt){
// 		response.sendFile(__dirname + "/public/index.html");
// 	}else{
// 		response.redirect('/login');
// 	}
// 	console.log("!!!ответ от сервера!!");
// });

// app.post("/login", function (request, response) {
// 	//console.log(request);
// 	if (request.body.loginData){
// 		const date = request.body.loginData;
// 		console.log(date)
// 		// if (date === "startCronTasks" ){
// 		// 	cronFunc.createParamsCheckAndStartCronTasksForAll();
// 		// 	//response.redirect('/SignIn');
// 		// 	//response.redirect('http://localhost:3001/login');//			
// 		// }
// 		const jwtData = {
// 			email:"test@test",
// 			jwtToken:{jwt:123}
// 		}
// 		response.json(jwtData);
// 		console.log("jwt отправлен!!");
// 	 }else{
// 		console.log("нет данных!!");
// 	 }
    
// });

///!!!
// app.post('/login',
//   passport.authenticate('local'),
//   function(req, res) {
//     // If this function gets called, authentication was successful.
//     // `req.user` contains the authenticated user.
//     res.redirect('/users/' + req.user.username);
//   });

///!!!


// app.post('/login', 
//   passport.authenticate('local', { failureRedirect: '/login' }),
//   function(req, res) {
// 	  console.log("!!!")
//     res.redirect('/home');
//   });


// app.post('/login',
//   passport.authenticate('local'),
//   function(req, res) {
// 	  req.user = "test@test"
// 	  console.log("ok!")
//     // If this function gets called, authentication was successful.
//     // `req.user` contains the authenticated user.
//     res.redirect('/home');
//   }
//  );


// app.post("/login", function(request,response){
// console.log(request.user);
// })
//{ failureRedirect: '/login' },


// const successRedirect =()=>{
// 	return true
// }

// app.post('/login',
//   passport.authenticate('local',  {session: false}, { successRedirect: '/home',
//                                    failureRedirect: '/login' })
// );

// app.post('/login',
//   passport.authenticate('local', { successRedirect: '/home', failureRedirect: '/' }),
//   function (req, res) {
//     console.log('req user', req.body);
//     console.log('after auth', req.user);
//   }
// );

app.post('/login', (req, res, next) => {
	passport.authenticate('local',  {session: false}, (err, user, info) => {
		
	// 	console.log(req.body) 
	// const loginData = req.body.loginData;
	// if (_.isEmpty(loginData)) {
	// 	return res.status(400).json({
	// 	  message: 'loginData не определен!',
	// 	  user: user
	// 	})      
	//   }
	
	//   user = loginData.email;
	//   console.log('user = ', user);
   
	  if (err || !user) {
		return res.status(400).json({
		  message: 'Something is not right',
		  user: user
		})      
	  }
	  req.login(user, {session: false}, (err) => {
		if (err) {
		  res.send(err)
		}
   
		// generate a signed json web token with the contents of user object and return it in the response
   
		//const token = jwt.sign({user}, jwtTokenKey)  //!!
		const secretOrKey = 'jwt_secret_key'
		const token = jwt.sign({user}, secretOrKey,{ expiresIn: 604800})  // 1 week

		
		//const token = jwt.sign(payload, secretOrKey, { expiresIn });
		console.log(token)

		//res.redirect('/home');

		//return  res.json({ user, token })
		return  res.json({token})

	  })
	})(req, res)
  })

//   app.post('/load', passport.authenticate('jwt', { session: false }
//   , (err, user, info) => {
// 	if (err)  {
// 		console.log(err);
// 	}
// 	console.log(user);
// 	return user;

//   } 
//   ),
//     function(req, res) {
//         res.send("load");
//     }
// );

// app.post("/load", function(request,response){
// 	console.log(request)
// 	response.send("!!!");
//   }
// );

app.post('/load', passport.authenticate('jwt', { session: false }),
  function(req, res) {
	  res.send("load");
  }
);

//!!
// app.post("/load", function(request,response){
// 	//console.log(request);
// 	let currUserEmail = request.body.params.currUserEmail;
// 	//let currUserEmail = request.query.currUserEmail;
// 	console.log(currUserEmail); 
// 	if (currUserEmail){
// 		//console.log(currUserEmail);
// 		currUserEmail = currUserEmail.replace(/"/g,'');
// 		console.log(currUserEmail);
// 		if (currUserEmail){
// 			PersBD.findAll({
// 				attributes:['bdData'],
// 				where:{
// 					email:currUserEmail
// 				}
// 			}).then(res=>{
// 				console.log("<<получены данные get запроса с параметром>>");
// 				console.log(res);
// 				response.json(res);
// 			}).catch(err=>console.log(err));
// 		}
// 	}
// })
//!!

// app.get("/load", function(request,response){
// 	let currUserEmail = request.query.currUserEmail;
// 	console.log(currUserEmail); 
// 	if (currUserEmail){
// 		//console.log(currUserEmail);
// 		currUserEmail = currUserEmail.replace(/"/g,'');
// 		console.log(currUserEmail);
// 		if (currUserEmail){
// 			PersBD.findAll({
// 				attributes:['bdData'],
// 				where:{
// 					email:currUserEmail
// 				}
// 			}).then(res=>{
// 				console.log("<<получены данные get запроса с параметром>>");
// 				console.log(res);
// 				response.json(res);
// 			}).catch(err=>console.log(err));
// 		}
// 	}
// })

// let loadDataFromDBbyEmail=(currUserEmail)=>{
// 	if (currUserEmail){
// 		//console.log(currUserEmail);
// 		currUserEmail = currUserEmail.replace(/"/g,'');
// 		console.log(currUserEmail);
// 		if (currUserEmail){
// 			PersBD.findAll({
// 				attributes:['bdData'],
// 				where:{
// 					email:currUserEmail
// 				}
// 			}).then(res=>{
// 				console.log("<<получены данные get запроса с параметром>>");
// 				console.log(res);
// 				response.json(res);
// 			}).catch(err=>console.log(err));
// 		}
// 	}
// }

// app.use('/users', 
//   passport.authenticate('jwt', {session: false}),
//   require('./routes/users.js'))

app.post("/home",
	//passport.authenticate('jwt', {session: false}),
	function (request, response) {
	if (request.body.data){
		const date = request.body.data;
		if (date === "startCronTasks" ){
			cronFunc.createParamsCheckAndStartCronTasksForAll();
			//response.redirect('/SignIn');
			//response.redirect('http://localhost:3001/login');//
			
		}
		if (date === "stopCronTasks" ){
			cronFunc.stopCronTasks(cronTasks);
		}
		if ((date != "startCronTasks" ) && (date != "stopCronTasks" )){
			//console.log(request.body.data);
			const bdRows = JSON.stringify(request.body.data.bdRows);
			const bdRowsArr = request.body.data.bdRows.bdRows;
			let currUserEmail = JSON.stringify(request.body.data.currUserEmail);	
			//console.log(currUserEmail);
			if (currUserEmail){	
				currUserEmail = currUserEmail.replace(/"/g,'');
				const jwtHash = "fhasljvasdgsdafdsfgdfgs";   ///!!!
				PersBD.findAll({
					where:{
						email:currUserEmail
					}
				}).then(res=>{
					console.log(res)
					if (res.length>0){
						console.log(`<< изменение записи в базе (изменены задачи пользователя: ${currUserEmail} >>`);
						PersBD.update({ bdData: bdRows, hash: jwtHash }, {
							where: {
							email: currUserEmail
							}
						}).then((res) => {
							if (res[0] === 1){
								console.log("<< запуск функции updateAndStartCronTasks >>");
								cronFunc.updateAndStartCronTasksByForUser(bdRowsArr, currUserEmail);
							}
						}).catch(err=>console.log(err));
					}else{
						console.log(`<< добавление записи в базу (добавлен новый пользователь и его задачи: ${currUserEmail} >>`);
						PersBD.create({
							email: currUserEmail,
							bdData: bdRows,
							hash: jwtHash
						}).then(res=>{
							//console.log(res);
							if (!_.isEmpty(res)){
								console.log("запуск функции updateAndStartCronTasks");
								cronFunc.updateAndStartCronTasksByForUser(bdRowsArr, currUserEmail);
							}
						}).catch(err=>console.log(err));
					}
					response.send("<<данные таблицы обновлены>>");
				}).catch(err=>console.log(err));
			}
		}
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

