const logger = require('../services/logger-config');
const PersBD = require(`../db/db-seq`);
const userFunc = require('../services/user-func');
const emailFunc = require('../services/email-func');
const bcrypt = require( 'bcrypt' );  // хеширование паролей

let newpassword = (request, response)=>{	
    const currUserEmail = request.body.data.currUserEmail;
    if (currUserEmail){
        const newPassword = userFunc.generatePassword();
        const passwordHash = bcrypt.hashSync(newPassword, 10 );
        if (passwordHash){
            logger.info(`Reqest-newpassword - Изменение записи в БД (изменен hash пароля пользователя: ${currUserEmail})`);
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
                    logger.info(`Reqest-newpassword - ${mes}`);
                    response.json({result: "ok",mes: mes});
                }
            }).catch((err)=>{
                logger.error(`Reqest-newpassword - Ошибка: ${err}`);
                response.json({result: "Ошибка сервера"});
            });
        }else{
            const mes = "Пароль не обновлен. Не определен hash нового пароля."
            logger.warn(`Reqest-newpassword - ${mes}`);
            response.json({result: mes});
        }
    }else{
        const mes = "Пароль не обновлен. Не определен email."
        logger.warn(`Reqest-newpassword - ${mes}`);
        response.json({result: mes});
    }
}
module.exports = {
    newpassword
  };