const express = require("express");
const cron = require('node-cron');
const moment = require('moment'); 
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const { Sequelize, Model, DataTypes } = require("sequelize");
const app = express();
const config = require('./config.js');

const TIMEZONE = config.TIMEZONE;
const repeatMap = config.repeatMap;
const timeStopCronTasks = config.timeStopCronTasks;
const timeStartCronTasks = config.timeStartCronTasks;
const sendEmailConfig = config.sendEmailConfig;
const fromSendEmailAddress = config.fromSendEmailAddress;
const sequelizeConfig = config.sequelizeConfig;

let cronTasks={};
//const cronTaskParamsArr = [];

// const cronTaskParamsArr = [
// 	{cronTaskName: "test_test_1",
// 	 cronTaskTime: "08 00 * * *",
// 	 emailAddress: "saework@ya.ru",
// 	 emailText: "задача 1"
// 	},
// 	{cronTaskName: "test_test_2",
// 	 cronTaskTime: "09 00 * * *",
// 	 emailAddress: "saework@ya.ru",
// 	 emailText: "задача 2"
// 	},
// ];
10
  // останавливаем все cron tasks, чтобы запустить с учетом изменений
  cron.schedule(timeStopCronTasks, () => 
  {
	console.log('tasks: destroy all');
	stopCronTasks(cronTasks);
	}, {
	scheduled: true,
	timezone: TIMEZONE
  });

  // запускаем все cron tasks, чтобы с учетом изменений + на случай падения сервера
  cron.schedule(timeStartCronTasks, () =>
  {
	console.log('tasks: start today all');
	createParamsCheckAndStartCronTasks();
	}, {
	scheduled: true,
	timezone: TIMEZONE
  });

//async function sendEmail(emailAddress, emailCapt, emailText){
let sendEmail = async (emailAddress, emailCapt, emailText)=>{	
	let transporter = nodemailer.createTransport({
	host: sendEmailConfig.host,
	port: sendEmailConfig.port,
	secure: sendEmailConfig.secure,
	auth: {
		user: sendEmailConfig.auth.user,
		pass: sendEmailConfig.auth.pass 
	}
	});
	// send email
	let emailInfo = await transporter.sendMail({
		from: sendEmailConfig.auth.user, 
		to: emailAddress, 
		subject: emailCapt, 
		//text: text, 
		html: emailText 
	});
	const now = new Date();
	console.log(`Email - sent - ${emailInfo.messageId} - ${emailAddress} - ${emailCapt} - ${text} - ${now}`);
	//console.log("Email sent: %s", info.messageId);
 }

 let getKeyByValue = (object, value) => {
	return Object.keys(object).find(key => object[key] === value);
  }

 // сгенерировать название cron задачи
 let generateCronTaskName = (email, ndate, repeat) => {
	const nemail = email.replace(/[@._-]*/g,'');
	const nrepeat = getKeyByValue(repeatMap, repeat);
	return `${nemail}_${ndate}_${nrepeat}`;
 }


 //let createCronTaskParams = async () => {
	//let createCronTaskParams = () => {
	let	createParamsCheckAndStartCronTasks = () => {
		 // формируем параметры для полного списка cron задач
		const cronTaskParamsArr = [];
		//cronTaskParamsArr = []; // очищаем массив
		PersBD.findAll({
			attributes:['bdData','email']
		}).then(res=>{
			console.log(`<<получены данные bdData из базы>>`);
			console.log(res);
			return(res)
		}).then(res=>{
		if (res){
			res.forEach(row => {
				try{
					//const bdDataString = row[0].dataValues.bdData;
					const bdDataString = row.dataValues.bdData;
					//const bdRows = JSON.parse(bdDataString).bdRows;
					const bdData = JSON.parse(bdDataString);
					console.log(bdData);
					const bdRows = bdData.bdRows;
					console.log(bdRows);
					const email = row.dataValues.email;
					//console.log(bdData);
					if (bdRows && email){
						bdRows.forEach(bdRow => {
						const bdDate = bdRow.bdDate;
						const bdPeriod = bdRow.bdPeriod;
						const persName = bdRow.persName;
						const bdComm = bdRow.bdComm;
						const bdTmz = bdRow.bdTmz;
						if (bdDate && bdPeriod){
							const date = bdDate.split(", ")[0];
							const time = bdDate.split(", ")[1];
							if (date && time){
								const day = Number(date.split(".")[0]);
								const month = Number(date.split(".")[1]);
								const year = Number(date.split(".")[2]);
								const hour = Number(time.split(":")[0]);
								const minute = Number(time.split(":")[1]);
								if (day && month && year && hour && minute){
									const weekDay = Number(moment(date, "DD.MM.YYYY").day());
									const ndate = `${day}${month}${year}${hour}${minute}`;
									const cronTime = `${minute} ${hour} * * *`;
									const emailCapt = `Уведомление mynotif.ru - ${persName}`;
									const emailText = `<b>${persName}</b><b>${bdComm}</b>`;
  
									const cronTaskParamsObj =
										{cronTaskName: generateCronTaskName(email, ndate, bdPeriod),
										 cronTaskTime: cronTime,
										 cronTaskPeriod: bdPeriod,
										 cronStartDay: day,
										 cronStartMonth: month,
										 cronStartYear: year,
										 cronStartHour: hour,
										 cronStartMinute: minute,
										 cronStartWeekDay: weekDay,
										 cronTimeZone: bdTmz,
										 emailAddress: email,
										 emailCapt: emailCapt,
										 emailText: emailText
										}
									cronTaskParamsArr.push(cronTaskParamsObj);
								}
							}
						}
						});
					}
				}catch(e){
					console.log(e);
				}
			});
		}
		console.log("<<cronTaskParamsArr сформирован>>");
		//console.log(cronTaskParamsArr);
		return cronTaskParamsArr;
	}).then(cronTaskParamsArr=>{
		checkAndstartCronTasks(cronTaskParamsArr);
	}).catch(err=>console.log(err));
 }


 let startCronTasks= (cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText) => {
	cronTasks[cronTaskName] = cron.schedule(cronTaskTime, () => 
	{
	  console.log(`Task - start - ${cronTaskName} - ${new Date()}`);
	  sendEmail(emailAddress, emailCapt, emailText).catch(console.error);
	}, {
	  scheduled: true,
	  timezone: cronTimeZone
	});
	console.log(`Task - start waiting - ${cronTaskName} - ${new Date()}`);
	cronTasks[cronTaskName].start();
 }

 //let checkAndstartCronTasks = async (cronTaskParamsArr) => {
	let checkAndstartCronTasks = (cronTaskParamsArr) => {
		console.log(`<<cronTaskParamsArr - ${JSON.stringify(cronTaskParamsArr)}`);
		cronTaskParamsArr.forEach((cronTaskParamsObj)=> {
		
		const { cronTaskName, cronTaskTime, cronTaskPeriod, cronStartDay, cronStartMonth, cronStartYear, cronStartHour, cronStartMinute, cronStartWeekDay, cronTimeZone, emailAddress, emailCapt, emailText } = cronTaskParamsObj;
		const currDate = new Date();
		const currDay = Number(currDate.getDate());
		const currWeekDay = Number(currDate.getDay());
		const currMonth = Number(currDate.getMonth())+1;
		const currYear = Number(currDate.getFullYear());
		const workWeekDays = [1,2,3,4,5];
        //!!! Привести типы чтобы совпадали !!!

		switch (cronTaskPeriod) {
			case repeatMap.norep: {  // Без повторов
				if ((currDay===cronStartDay) && (currMonth===cronStartMonth) && (currYear===cronStartYear)) {
					startCronTasks(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
				}
				break;
			}
			case (repeatMap.evday): {  // Ежедневно
				if ((currDay>=cronStartDay) && (currMonth>=cronStartMonth) && (currYear>=cronStartYear)) {
					startCronTasks(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
				}
				break;
			}
			case repeatMap.evweek: {  // Еженедельно
				if ((currWeekDay===cronStartWeekDay) && (currDay>=cronStartDay) && (currMonth>=cronStartMonth) && (currYear>=cronStartYear)) {
					startCronTasks(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
				}
				break;
			}
			case repeatMap.evwkweek: {  // ПН-ПТ
				if ((workWeekDays.includes(currWeekDay)) && (currDay>=cronStartDay) && (currMonth>=cronStartMonth) && (currYear>=cronStartYear)) {
					startCronTasks(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
				}
				break;
			}
			case repeatMap.evmonth: {  // Ежемесячно
				if ((currDay===cronStartDay) && (currMonth>=cronStartMonth) && (currYear>=cronStartYear)) {
					startCronTasks(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
				}
				break;
			}
			case repeatMap.evyear: {  // Ежегодно
				if ((currDay===cronStartDay) && (currMonth===cronStartMonth) && (currYear>=cronStartYear)) {
					startCronTasks(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
				}
				break;
			}
			default: {
				console.log("<<проверка и старт задач по cronTaskParamsArr - отсутствуют задачи для старта>>")
			}
		}
	});
	console.log("<<проверка и старт задач по cronTaskParamsArr - завершено >>")
 };
 

//  let startCronTasks = (cronTaskParamsArr) => {
// 	cronTaskParamsArr.forEach(function(cronTaskParamsObj) 
// 	{
// 		const cronTaskName=cronTaskParamsObj.cronTaskName;
// 		const cronTaskTime=cronTaskParamsObj.cronTaskTime;
// 		const emailAddress=cronTaskParamsObj.emailAddress;
// 		const emailText=cronTaskParamsObj.emailText;
// 		const now = new Date();
// 		cronTasks[cronTaskName] = cron.schedule(cronTaskTime, () => 
// 		{
// 		  console.log(`Task - start - ${cronTaskName} - ${now}`);
// 		  sendEmail(emailText, emailAddress).catch(console.error);
// 		}, {
// 		  scheduled: true,
// 		  timezone: TIMEZONE
// 		});
// 		console.log(`Task - start waiting - ${cronTaskName} - ${now}`);
// 		cronTasks[cronTaskName].start();	

// 		//createCronTaskParams("test@test");
// 		createCronTaskParams();
// 	});
//  };

 let stopCronTasks = (cronTasks) => {
	 //console.log(cronTasks);
	 if (cronTasks){
		for (let key in cronTasks) {
			console.log(`Task - destroy - ${key} - ${new Date()}`);
			cronTasks[key].destroy();
		}
	}
 };

const sequelize = new Sequelize(sequelizeConfig.DBName, sequelizeConfig.DBLogin, sequelizeConfig.DBPass, {
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
 	modelName: sequelizeConfig.modelName
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
	let currUserEmail = request.query.currUserEmail;
	//console.log(currUserEmail); 
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

app.get("/sel",function(request,response){
	console.log(request);
})

app.post("/", function (request, response) {
    //if(!request.body) return response.sendStatus(400);
	//console.log(request.body.data)
	if (request.body.data){
		const date = request.body.data;
		if (date === "startCronTasks" ){
			//startCronTasks(cronTaskParamsArr);

			///!!!
			// (async () => {
			// 	console.log(`tasks: starting all for - ${new Date()}` );
			// 	try{
			// 		//let cronTaskParamsArr = createCronTaskParams();
			// 		//cronTaskParamsArr = []; // очищаем массив
			// 		createCronTaskParams();	
			// 		console.log("<<await checkAndstartCronTasks(cronTaskParamsArr);>>")
			// 		checkAndstartCronTasks(cronTaskParamsArr);
			// 	}catch(e){
			// 		console.log(e);//
			// 	}
			//   })();
			///!!!

			///!!!!
			//cronTaskParamsArr = []; // очищаем массив
			//while (cronTaskParamsArr.length) { cronTaskParamsArr.pop(); }
			createCronTaskParams();	
			//console.log("<<запуск checkAndstartCronTasks>>")
			//console.log(cronTaskParamsArr)
			//heckAndstartCronTasks(cronTaskParamsArr);
			///!!!

		}
		if (date === "stopCronTasks" ){
			stopCronTasks(cronTasks);
		}
		if ((date != "startCronTasks" ) && (date != "stopCronTasks" )){

			console.log(request.body.data);
			const bdRows = JSON.stringify(request.body.data.bdRows);
			let currUserEmail = JSON.stringify(request.body.data.currUserEmail);	
			//console.log(currUserEmail);
			if (currUserEmail){	
				currUserEmail = currUserEmail.replace(/"/g,'');
				PersBD.findAll({
					where:{
						email:currUserEmail
					}
				}).then(res=>{
					console.log(res)
					if (res.length>0){
						console.log("<<изменение записи в базе>>")
						PersBD.update({ bdData: bdRows }, {
							where: {
							email: currUserEmail
							}
						}).then((res) => {
							console.log(res);
						});
					}else{
						console.log("<<добавление записи в базу>>")
						PersBD.create({
							email: currUserEmail,
							bdData: bdRows
						}).then(res=>{
							console.log(res);
						}).catch(err=>console.log(err));
					}
					response.send("<<данные таблицы обновлены>>");
				}).catch(err=>console.log(err));
			}
		}
	 }

    //response.send("!!!");
});

app.listen(3000);


// let findCronTaskParamsByUserEmail = (currUserEmail) => {
// 	if (currUserEmail){
// 		PersBD.findAll({
// 			attributes:['bdData'],
// 			where:{
// 				email:currUserEmail
// 			}
// 		}).then(res=>{
// 			console.log(`<<получены данные из базы для - ${currUserEmail} >>`);
// 			//console.log(res);
// 			return(res)
// 		}).then(res=>{
// 			if (res){
// 				try{
// 					const bdDataString = res[0].dataValues.bdData;
// 					const bdRows = JSON.parse(bdDataString).bdRows;
// 					//console.log(bdData);
// 					if (bdRows){
// 						bdRows.forEach(bdRow => {
// 						const bdDate = bdRow.bdDate;
// 						const bdPeriod = bdRow.bdPeriod;
// 						if (bdDate && bdPeriod){
// 							const date = bdDate.split(", ")[0];
// 							const time = bdDate.split(", ")[1];
// 							if (date && time){
// 								const day = date.split(".")[0];
// 								const month = date.split(".")[1];
// 								const year = date.split(".")[2];
// 								const hour = date.split(":")[0];
// 								const minute = date.split(":")[1];
// 								if (day && month && hour && minute){

// 									// cronTaskParamsArr = [
// 									// 	{cronTaskName: "test_test_1",
// 									// 	 cronTaskTime: "08 00 * * *",
// 									// 	 emailAddress: "saework@ya.ru",
// 									// 	 emailText: "задача 1"
// 									// 	},


// 									// let cronTaskTime;
// 									// switch (bdPeriod) {
// 									// 	case "Без повторов": {
// 									// 		cronTaskTime = `${minute} ${hour} ${hour} ${day} ${month}`
// 									// 	}
// 									// 	case "Ежедневно": {
// 									// 		cronTaskTime = `${minute} ${hour} ${hour} ${day} ${month}`
// 									// 	}
// 									// }
// 								}
// 							}

// 						}
						
// 						});
// 					}
// 				}catch(e){
// 					console.log(e);
// 				}
// 			}
// 		}).catch(err=>console.log(err));
// 	}
//  }