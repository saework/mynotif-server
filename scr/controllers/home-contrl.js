const logger = require('../services/logger-config');
const PersBD = require(`../db/db-seq`);
const cronFunc = require(`../cron/cron-func`);

let home = (request, response)=>{	
    const date = request.body.data;
    //logger.info(`Reqest-home - date:${date}`);
    if (date){      
        const bdRows = JSON.stringify(date.bdRows);
        const bdRowsArr = date.bdRows.bdRows;
        let currUserEmail = JSON.stringify(date.currUserEmail);	
        currUserEmail = currUserEmail.replace(/"/g,'');
        if (currUserEmail){		
            logger.info(`Reqest-home - currUserEmail: ${currUserEmail}`);
            PersBD.findAll({
                where:{
                    email:currUserEmail
                }
            }).then(res=>{
                //logger.info(res)
                if (res.length>0){
                    logger.info(`Reqest-home - Изменение записи в базе (изменены задачи пользователя: ${currUserEmail}`);
                    PersBD.update({ bdData: bdRows }, {
                        where: {
                        email: currUserEmail
                        }
                    }).then((res) => {
                        if (res[0] === 1){
                            const mes = "Данные таблицы обновлены";
                            response.json({result: "ok", mes: mes});
                            logger.info("Reqest-home - Запуск функции updateAndStartCronTasks");
                            logger.info(`Reqest-home - res.body: ${response.body}`);  ///!!!
                            cronFunc.updateAndStartCronTasksByForUser(bdRowsArr, currUserEmail);
                        }else{
                            response.json({result: "ok", mes: "Обновление таблицы не требуется"});
                            logger.info("Reqest-home - Обновление таблицы не требуется");
                        }
                    //}).catch(err=>logger.info(err));
                    }).catch((err)=>{
                        logger.error(`Reqest-home - Ошибка: ${err}`)
                        response.json({result: "Ошибка сервера"});
                    });
                }
            }).catch((err)=>{
                logger.error(`Reqest-home - Ошибка: ${err}`)
                response.json({result: "Ошибка сервера"});
            });
        }else{
            const mes = "Не определен Email!"
            logger.warn(`Reqest-home - ${mes}`);
            response.status(401).send({result: mes});
        }
    }else{
        logger.warn("Reqest-home - переменная date не оределена");
        response.json({result: "Ошибка сервера"});
    }
}

module.exports = {
    home
  };