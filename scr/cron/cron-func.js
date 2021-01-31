
const logger = require('../services/logger-config');
const moment = require('moment'); 
const _ = require('lodash');
const PersBD = require(`../db/db-seq`);
const emailFunc = require(`../services/email-func`);
const cronTasks = require(`./cron-tasks`);
const cron = require('node-cron');
const config = require('../../config.js');
const repeatMap = config.repeatMap;

// Поиск тех. названия периодичности задачи для наименования cron задачи
let getKeyByValue = (object, value) => {
	return Object.keys(object).find(key => object[key] === value);
}
// Для наименования cron задачи
let getCronEmailName = (email) =>{
	const nemail = email.replace(/[@._-]*/g,'');
	return nemail;
}

// Сгенерировать название cron задачи
let generateCronTaskName = (email, ndate, repeat) => {
	const nemail = getCronEmailName(email);
	const nrepeat = getKeyByValue(repeatMap, repeat);
	return `${nemail}_${ndate}_${nrepeat}`;
 }

// Формирование параметров для запуска cron задач
let createCronTaskParamObjs = (cronTaskParamsArr, bdRows, email) => {
	logger.info(`Cron-func - запуск функции createCronTaskParamObjs (Формирование параметров для запуска cron задач) для пользователя: ${email}`);
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
						//logger.info(`Cron-func - cron параметры добавлены в массив cronTaskParamsArr для пользователя: ${email}`);
					}
				}
			}
			});
		}
	}catch(err){
		logger.error(`Cron-func - Ошибка в функции createCronTaskParamObjs: ${err}`);
	}
}
// Запуск/перезапуск cron задач пользователя на ожидание после изменения им списка/параметров собственных задач
let updateAndStartCronTasksByForUser = (bdRowsArr, currUserEmail)=>{
	logger.info(`Cron-func - запуск функции updateAndStartCronTasksByForUser (Запуск/перезапуск cron задач пользователя на ожидание после изменения им списка/параметров собственных задач)`);	
	const cronTaskParamsArr = [];
	new Promise((res) => {
		const stopCronTasksResult = stopCronTasks(cronTasks, currUserEmail);
		res(stopCronTasksResult);
	}).then(()=>{
		return new Promise((res) => {
			if (bdRowsArr.length > 0){
				createCronTaskParamObjs(cronTaskParamsArr, bdRowsArr, currUserEmail)
			}		
			res(cronTaskParamsArr);
		});
	}).then(()=>{
		if (cronTaskParamsArr.length > 0){
			checkAndStartCronTasks(cronTaskParamsArr);
		}else{
			logger.info(`Cron-func - функция updateAndStartCronTasksByForUser - массив cronTaskParamsArr пуст`);	
		}	
	}).catch((err)=>{
		logger.error(`Cron-func - функция updateAndStartCronTasksByForUser - Ошибка: ${err}`);
	});
}

// Запуск cron задачи на ожидание
let startCronTask= (cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText) => {
	logger.info(`Cron-func - запуск функции startCronTask (Запуск cron задачи на ожидание) - cronTaskName: ${cronTaskName}, cronTaskTime: ${cronTaskTime}`);
	cronTasks[cronTaskName] = cron.schedule(cronTaskTime, () => 
	{
	  logger.info(`Task - запуск cron задачи - cronTaskName: ${cronTaskName}, cronTaskTime: ${cronTaskTime}`);
	  emailFunc.sendEmail(emailAddress, emailCapt, emailText).catch((err)=>{
			logger.error(`Email - функция sendEmail - Ошибка: ${err}`)});
	}, {
	  scheduled: true,
	  timezone: cronTimeZone
	});
	cronTasks[cronTaskName].start();
}
// Проверка задач на необходимость старта
let checkAndStartCronTasks = (cronTaskParamsArr) => {
	logger.info(`Cron-func - запуск функции checkAndStartCronTasks (Проверка задач на необходимость старта)`);
	//logger.info(`Cron-func - cronTaskParamsArr - ${JSON.stringify(cronTaskParamsArr)}`);
	cronTaskParamsArr.forEach((cronTaskParamsObj)=> {		
		const { cronTaskName, cronTaskTime, cronTaskPeriod, cronStartDay, cronStartMonth, cronStartYear, cronStartHour, cronStartMinute, cronStartWeekDay, cronTimeZone, emailAddress, emailCapt, emailText } = cronTaskParamsObj;
		const currDate = new Date();
		const currDay = Number(currDate.getDate());
		const currWeekDay = Number(currDate.getDay());
		const currMonth = Number(currDate.getMonth())+1;
		const currYear = Number(currDate.getFullYear());
		const workWeekDays = [1,2,3,4,5];

		switch (cronTaskPeriod) {
			case repeatMap.norep: {  // Без повторов
				if ((currDay===cronStartDay) && (currMonth===cronStartMonth) && (currYear===cronStartYear)) {
					startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
				}
				break;
			}
			case (repeatMap.evday): {  // Ежедневно
				if ((currDay>=cronStartDay) && (currMonth>=cronStartMonth) && (currYear>=cronStartYear)) {
					startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
				}
				break;
			}
			case repeatMap.evweek: {  // Еженедельно
				if ((currWeekDay===cronStartWeekDay) && (currDay>=cronStartDay) && (currMonth>=cronStartMonth) && (currYear>=cronStartYear)) {
					startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
				}
				break;
			}
			case repeatMap.evwkweek: {  // ПН-ПТ
				if ((workWeekDays.includes(currWeekDay)) && (currDay>=cronStartDay) && (currMonth>=cronStartMonth) && (currYear>=cronStartYear)) {
					startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
				}
				break;
			}
			case repeatMap.evmonth: {  // Ежемесячно
				if ((currDay===cronStartDay) && (currMonth>=cronStartMonth) && (currYear>=cronStartYear)) {
					startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
				}
				break;
			}
			case repeatMap.evyear: {  // Ежегодно
				if ((currDay===cronStartDay) && (currMonth===cronStartMonth) && (currYear>=cronStartYear)) {
					startCronTask(cronTaskName, cronTaskTime, cronTimeZone, emailAddress, emailCapt, emailText);
				}
				break;
			}
			default: {
				logger.info(`Cron-func - функции checkAndStartCronTasks - отсутствуют задачи для старта`);
			}
		}
	});
	logger.info(`CronTasks: ${cronTasks}`);
};

// Формирование параметров для полного списка cron задач
let createParamsCheckAndStartCronTasksForAll = () => {
	logger.info(`Cron-func - запуск функции createParamsCheckAndStartCronTasksForAll (Формирование параметров для полного списка cron задач)`);
	const cronTaskParamsArr = [];
	PersBD.findAll({
		attributes:['bdData','email']
	}).then(res=>{
		logger.info(`Cron-func - функция createParamsCheckAndStartCronTasksForAll - получены данные bdData из БД`);
		//logger.info(res);
		return(res)
	}).then(res=>{
	if (res){
		res.forEach(row => {
			const bdDataString = row.dataValues.bdData;
			if (bdDataString){
				const bdData = JSON.parse(bdDataString);
				//logger.info(bdData);
				const bdRows = bdData.bdRows;
				//logger.info(bdRows);
				const email = row.dataValues.email; 
				createCronTaskParamObjs(cronTaskParamsArr, bdRows, email);
			}
		});
	}
	logger.info(`Cron-func - функция createParamsCheckAndStartCronTasksForAll - cronTaskParamsArr сформирован`);
	//logger.info(cronTaskParamsArr);
	return cronTaskParamsArr;
	}).then(cronTaskParamsArr=>{
		checkAndStartCronTasks(cronTaskParamsArr);
	}).catch((err)=>{
		logger.error(`Cron-func - функция createParamsCheckAndStartCronTasksForAll - Ошибка: ${err}`);
	});
}

//Уничтожить все cron задачи или задачи пользователя по email 
let stopCronTasks = (cronTasks, email = "all") => {
	logger.info(`Cron-func - запуск функции stopCronTasks (Уничтожить все cron задачи или задачи пользователя по email)`);
	if (!_.isEmpty(cronTasks)){
		let nemail;
		if (email !== "all"){
			nemail = getCronEmailName(email)
			logger.info(`Cron-func - функция stopCronTasks - уничтожение задач пользователя: ${email}`);
		}else{
			logger.info(`Cron-func - функция stopCronTasks - уничтожение задач всех пользователей`);
		}
		for (let key in cronTasks) {
			let cronNemail;
			if (email !== "all"){
				cronNemail = key.split("_")[0];
			}
			if (cronNemail===nemail){
				logger.info(`Task - destroy - ${key}`);
				cronTasks[key].destroy();
			}
		}
	}else{
		logger.info(`Cron-func - функция stopCronTasks - массив cronTasks пуст`);
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
  