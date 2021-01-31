const logger = require('../services/logger-config');
const PersBD = require(`../db/db-seq`);
const passport = require('passport');
require('../services/passp-strateg.js')(passport);
const config = require('../../config.js');
const bcrypt = require( 'bcrypt' );  // хеширование паролей
const jwt = require('jsonwebtoken');
const jwtTokenKey = config.jwtTokenKey;


let login = (request, response)=>{	
	passport.authenticate('local',  {session: false}, (err, user) => {		
	  if (err){
		const mes = 'Ошибка аутентификации!';
		logger.error(`Reqest-login - Ошибка: ${mes}: ${err}`);
		return response.status(401).json({result: mes, err: err })      
	  }	
	  if (!user) {
		const mes = 'Не верный логин или пароль!';
		logger.warn(`Reqest-login - ${mes}`);
		return response.status(401).json({result: mes, err: null})      
	  }
	  request.login(user, {session: false}, (err) => {
		if (err) {
			const mes = 'Ошибка аутентификации!';
			logger.error(`Reqest-login - Ошибка: ${mes}: ${err}`);
			response.status(401).json({result: mes, err: err }) 
		}
		logger.info(`Reqest-login - Аутентификация пользователя по LocalStrategy пройдена`);	
		const jwtToken = jwt.sign({user}, jwtTokenKey) // Генерируем jwt токен
		logger.info(`Reqest-login - jwtToken: ${jwtToken}`);
		const jwtHash = bcrypt.hashSync(jwtToken, 10 );  // Преобразуем jwt в hash для записи в БД
		if (jwtHash){
			PersBD.update({jwtHash: jwtHash}, {
				where: {
				email: user
				}
			}).then((res) => {
				if (res[0] === 1){
					logger.info(`Reqest-login - jwtHash записан в БД для пользователя: ${user}`);
					response.json({jwtToken});
					return  jwtToken;
				}
			//}).catch(err=>logger.info(err));
			}).catch((err)=>{
				logger.error(`Reqest-login - Ошибка: ${err}`);
				response.json({result: "Ошибка сервера"});
			});
		}else{
			const mes = "Не определен jwtHash. Вход в систему отклонен."
			logger.warn(`Reqest-login - ${mes}`);
			return response.json({result: "Ошибка сервера"});
		}
	  })
	})(request, response)
  }

  module.exports = {
	login
  };