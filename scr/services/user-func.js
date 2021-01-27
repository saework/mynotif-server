const logger = require('./logger-config');

let generatePassword=()=> {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

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
			//logger.info(res);
			if (!_.isEmpty(resCreateUser)){
				logger.info("<<Учетная запись создана>>");
				const resCr = {result: "jwt", jwt: jwtToken}
				logger.info(resCr);
				response.json(resCr);
				return resCr
			}
		}).catch(err=>logger.info(err));
	}else{
		const errMes = "<<Учетная запись не создана. Ошибка генерации hash>>"
		logger.info(errMes);
		return {result: errMes}
	}
}
module.exports = {
	generatePassword,
	createUserAccount
  };