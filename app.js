const express = require("express");
const cron = require('node-cron');
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const { Sequelize, Model, DataTypes } = require("sequelize");
const app = express();

const TIMEZONE = "Asia/Yekaterinburg";
//const TIMEZONE = "Europe/Moscow";

const cronTasks={};

const cronTaskParamsArr = [
	{cronTaskName: "test_test_1",
	 cronTaskTime: "08 00 * * *",
	 emailAddress: "saework@ya.ru",
	 emailText: "задача 1"
	},
	{cronTaskName: "test_test_2",
	 cronTaskTime: "09 00 * * *",
	 emailAddress: "saework@ya.ru",
	 emailText: "задача 2"
	},
];

async function sendEmail(text, address){
	let transporter = nodemailer.createTransport({
	host: "smtp.yandex.ru",
	port: 465,
	secure: true,
	auth: {
		user: "my-notif@yandex.ru",
		pass: "MM24686421x" 
	}
	});
	// send email
	let emailInfo = await transporter.sendMail({
		from: "my-notif@yandex.ru", 
		to: address, 
		subject: "Уведомление mynotif.ru", 
		text: text, 
		// html: "<b>Текст</b>" 
	});
	const now = new Date();
	console.log(`Email - sent - ${emailInfo.messageId} - ${address} - ${text} - ${now}`);
	//console.log("Email sent: %s", info.messageId);
 }

 let startCronTasks = (cronTaskParamsArr) => {
	cronTaskParamsArr.forEach(function(cronTaskParamsObj) 
	{
		const cronTaskName=cronTaskParamsObj.cronTaskName;
		const cronTaskTime=cronTaskParamsObj.cronTaskTime;
		const emailAddress=cronTaskParamsObj.emailAddress;
		const emailText=cronTaskParamsObj.emailText;
		const now = new Date();
		cronTasks[cronTaskName] = cron.schedule(cronTaskTime, () => 
		{
		  console.log(`Task - start - ${cronTaskName} - ${now}`);
		  sendEmail(emailText, emailAddress).catch(console.error);
		}, {
		  scheduled: true,
		  timezone: TIMEZONE
		});
		console.log(`Task - start waiting - ${cronTaskName} - ${now}`);
		cronTasks[cronTaskName].start();	
	});
 };

 let stopCronTasks = (cronTasks) => {
	 //console.log(cronTasks);
	 for (let key in cronTasks) {
		const now = new Date();
		console.log(`Task - destroy - ${key} - ${now}`);
		cronTasks[key].destroy();
	  }

	//  for (let key in cronTasks) {
	// 	console.log(key, ':', cronTasks[key]);
	//   }
	// cronTasks.forEach(function(cronTask) 
	// {
	// 	console.log(`Task - destroy - ${cronTask} - ${now}`);
	// 	cronTask.destroy();
	// });
 };

//   // останавливаем все cron tasks, чтобы запустить с учетом изменений
//   cron.schedule('57 23 * * *', () => 
//   {
// 	console.log('tasks: stoping all');
// 	}, {
// 	scheduled: true,
// 	timezone: "Asia/Yekaterinburg"
// 	//timezone: "Europe/Moscow"
//   });

//   // запускаем все cron tasks, чтобы с учетом изменений + на случай падения сервера
//   cron.schedule('0 0 * * *', () =>
//   {
// 	console.log('tasks: starting all');
// 	}, {
// 	scheduled: true,
// 	timezone: "Asia/Yekaterinburg"
// 	//timezone: "Europe/Moscow"
//   });

// //cron.schedule('*/2 * * * *', () => {
// 	cron.schedule('03 21 07 01 *', () => {
// 	console.log('running a task');
// 	sendEmail("Приветик", "saework@ya.ru").catch(console.error);
// }, {
// 	scheduled: true,
// 	timezone: "Asia/Yekaterinburg"
// 	//timezone: "Europe/Moscow"
//   });

const sequelize = new Sequelize("mynotif", "root", "root", {
	dialect: "mysql",
	define: {
	  timestamps: false
	}
  });

class PersBD extends Model {}
PersBD.init({
	id:{
		type:Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
		allowNull: false
	},
	email:{
		type: Sequelize.STRING,
		allowNull: false
	},
	bdData:{
		type: Sequelize.STRING,
		allowNull: true
	},
	hash:{
		type: Sequelize.STRING,
		allowNull: true
	}
},{
	sequelize,
 	modelName: "persbd"
});

try{
	sequelize.authenticate();
	console.log("Connection Successful"); 
}catch (error){
	console.log(error);
}

app.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use(express.static(__dirname + "/public"));
 
app.use(express.json());

app.get("/load", function(request,response){

	startCronTasks(cronTaskParamsArr);

	// let currUserEmail = request.query.currUserEmail;
	// //console.log(currUserEmail);
	// if (currUserEmail){
	// 	//console.log(currUserEmail);
	// 	currUserEmail = currUserEmail.replace(/"/g,'');
	// 	console.log(currUserEmail);
	// 	if (currUserEmail){
	// 		PersBD.findAll({
	// 			attributes:['bdData'],
	// 			where:{
	// 				email:currUserEmail
	// 			}
	// 		}).then(res=>{
	// 			console.log("<<получены данные get запроса с параметром>>");
	// 			console.log(res);
	// 			response.json(res);
	// 		}).catch(err=>console.log(err));
	// 	}
	// }
})

app.get("/sel",function(request,response){
	console.log(request);
})

app.post("/", function (request, response) {
    //if(!request.body) return response.sendStatus(400);
	//console.log(request.body.data)
	if (request.body.data){

		stopCronTasks(cronTasks);

	// 	console.log(request.body.data);
	// 	const bdRows = JSON.stringify(request.body.data.bdRows);
	// 	let currUserEmail = JSON.stringify(request.body.data.currUserEmail);	
	// 	//console.log(currUserEmail);
	// 	if (currUserEmail){	
	// 		currUserEmail = currUserEmail.replace(/"/g,'');
	// 		PersBD.findAll({
	// 			where:{
	// 				email:currUserEmail
	// 			}
	// 		}).then(res=>{
	// 			console.log(res)
	// 			if (res.length>0){
	// 				console.log("<<изменение записи в базе>>")
	// 				PersBD.update({ bdData: bdRows }, {
	// 					where: {
	// 					email: currUserEmail
	// 					}
	// 				}).then((res) => {
	// 					console.log(res);
	// 				});
	// 			}else{
	// 				console.log("<<добавление записи в базу>>")
	// 				PersBD.create({
	// 					email: currUserEmail,
	// 					bdData: bdRows
	// 				}).then(res=>{
	// 					console.log(res);
	// 				}).catch(err=>console.log(err));
	// 			}
	// 			response.send("<<данные таблицы обновлены>>");
	// 		}).catch(err=>console.log(err));
	// 	}
	 }

    //response.send("!!!");
});

app.listen(3000);
