const moment = require('moment'); 
const _ = require('lodash');
const config = require('../config.js');
const cronTasks = require(`./cron-tasks`);
const cron = require('node-cron');
const PersBD = require(`./db-seq`);
const emailFunc = require(`./email-func`);

const repeatMap = config.repeatMap;

// поиск тех. названия периодичности задачи для наименования cron задачи
let getKeyByValue = (object, value) => {
	return Object.keys(object).find(key => object[key] === value);
}
// для наименования cron задачи
let getCronEmailName = (email) =>{
	const nemail = email.replace(/[@._-]*/g,'');
	return nemail;
}

 // сгенерировать название cron задачи
 let generateCronTaskName = (email, ndate, repeat) => {
	const nemail = getCronEmailName(email);
	const nrepeat = getKeyByValue(repeatMap, repeat);
	return `${nemail}_${ndate}_${nrepeat}`;
 }
// формирование параметров для запуска cron задач
let createCronTaskParamObjs = (cronTaskParamsArr, bdRows, email) => {
	try{
		if (bdRows.length > 0 && email){
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
}
// запуск/перезапуск cron задач пользователя на ожидание после изменения им списка/параметров собственных задач
let updateAndStartCronTasksByForUser = (bdRowsArr, currUserEmail)=>{	
	const cronTaskParamsArr = [];
	new Promise((res) => {
		const stopCronTasksResult = stopCronTasks(cronTasks, currUserEmail);
		res(stopCronTasksResult);
	}).then(()=>{
		return new Promise((res) => {
			if (bdRowsArr.length > 0){
				createCronTaskParamObjs(cronTaskParamsArr, bdRowsArr, currUserEmail)
				console.log("<<cronTaskParamsArr сформирован>>");
			}		
			res(cronTaskParamsArr);
		});
	}).then(()=>{
		if (cronTaskParamsArr.length > 0){
			console.log("<<запуск функции checkAndStartCronTasks>>");
			checkAndStartCronTasks(cronTaskParamsArr);
		}else{
			console.log("<<массив cronTaskParamsArr пуст>>");
		}	
	}).catch(err=>console.log(err));
}

// запуск cron задачи на ожидание
 let startCronTasks= (cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText) => {
	cronTasks[cronTaskName] = cron.schedule(cronTaskTime, () => 
	{
	  console.log(`Task - start - ${cronTaskName} - ${new Date()}`);
	  emailFunc.sendEmail(emailAddress, emailCapt, emailText).catch(console.error);
	}, {
	  scheduled: true,
	  timezone: cronTimeZone
	});
	console.log(`Task - start waiting - ${cronTaskName} - ${new Date()}`);
	cronTasks[cronTaskName].start();
 }

	let checkAndStartCronTasks = (cronTaskParamsArr) => {
		//console.log(cronTaskParamsArr.length)
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
	console.log("<<проверка и старт задач по cronTaskParamsArr - завершено >>");
	console.log(cronTasks);
 };

 let createParamsCheckAndStartCronTasksForAll = () => {
	// формируем параметры для полного списка cron задач
	const cronTaskParamsArr = [];
	PersBD.findAll({
		attributes:['bdData','email']
	}).then(res=>{
		console.log(`<<получены данные bdData из базы>>`);
		console.log(res);
		return(res)
	}).then(res=>{
	if (res){
		res.forEach(row => {
			//const bdDataString = row[0].dataValues.bdData;
			const bdDataString = row.dataValues.bdData;
			//const bdRows = JSON.parse(bdDataString).bdRows;
			const bdData = JSON.parse(bdDataString);
			console.log(bdData);
			const bdRows = bdData.bdRows;
			console.log(bdRows);
			const email = row.dataValues.email;
			//console.log(bdData);
			// createCronTaskParamObjs(cronTaskParamsArr, bdRows, email)
			createCronTaskParamObjs(cronTaskParamsArr, bdRows, email);
		});
	}
	console.log("<<cronTaskParamsArr сформирован>>");
	//console.log(cronTaskParamsArr);
	return cronTaskParamsArr;
	}).then(cronTaskParamsArr=>{
		checkAndStartCronTasks(cronTaskParamsArr);
	}).catch(err=>console.log(err));
 }

 
 let stopCronTasks = (cronTasks, email = "all") => {
	 //console.log(cronTasks);
	 if (!_.isEmpty(cronTasks)){
		let nemail;
		if (email !== "all"){
			nemail = getCronEmailName(email)
		}
		for (let key in cronTasks) {
			let cronNemail;
			if (email !== "all"){
				cronNemail = key.split("_")[0];
			}
			if (cronNemail===nemail){
				console.log(`Task - destroy - ${key} - ${new Date()}`);
				cronTasks[key].destroy();
				}
		}
	}
	return true;
 };

module.exports = {
	createCronTaskParamObjs,
	updateAndStartCronTasksByForUser,
	checkAndStartCronTasks,
	createParamsCheckAndStartCronTasksForAll,
	stopCronTasks
  };
  