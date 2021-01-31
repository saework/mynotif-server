const logger = require('./logger-config');
const _ = require('lodash');
const PersBD = require(`../db/db-seq`);
const bcrypt = require( 'bcrypt' );  // хеширование паролей
const jwt = require('jsonwebtoken');
const config = require('../../config.js');
const jwtTokenKey = config.jwtTokenKey;

let generatePassword=()=> {
    let length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

let createUserAccount=(currUserEmail, password, response)=>{
	logger.info(`CreateUserAccount - запуск функции для пользователя: ${currUserEmail}`);
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
			if (!_.isEmpty(resCreateUser)){
				logger.info(`CreateUserAccount - Учетная запись создана`);
				const resCr = {result: "jwt", jwt: jwtToken}
				logger.info(`CreateUserAccount - jwtToken:  ${jwtToken}`);
				response.json(resCr);
				return resCr
			}else{
				const mes = "Учетная запись не создана. Ошибка БД"
				logger.warn(`CreateUserAccount - ${mes}`);
				response.json({result: "Ошибка сервера"});
				return {result: mes}
			}
		//}).catch(err=>logger.info(err));
		}).catch((err)=>{
			logger.error(`CreateUserAccount - Ошибка: ${err}`);
			response.json({result: "Ошибка сервера"});
			return {result: mes}
		});
	}else{
		const mes = "Учетная запись не создана. Ошибка генерации hash"
		logger.warn(`CreateUserAccount - ${mes}`);
		response.json({result: "Ошибка сервера"});
		return {result: mes}
	}
}

let deleteUserAccount = (currUserEmail)=>{
	logger.info(`DeleteUserAccount - запуск функции для пользователя: ${currUserEmail}`);
	if (currUserEmail){
		PersBD.destroy({
			where: {email: currUserEmail}
		}).then(resDeleteUser=>{
			if (resDeleteUser === 1){
				const mes = "Учетная запись удалена"
				logger.info(`DeleteUserAccount - ${mes}`);
				return mes
			}else{
				const mes = "Учетная запись не удалена. Ошибка БД"
				logger.warn(`DeleteUserAccount - ${mes}`);
				return mes
			}
		}).catch((err)=>{
			logger.error(`DeleteUserAccount - Ошибка: ${err}`);
			return err
		});
	}else{
		const mes = "Не определен Email пользователя"
		logger.warn(`DeleteUserAccount - ${mes}`);
		return mes
	}
}
module.exports = {
	generatePassword,
	createUserAccount,
	deleteUserAccount
  };