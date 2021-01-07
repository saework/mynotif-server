const express = require("express");
const cron = require('node-cron');
const bodyParser = require("body-parser");
const { Sequelize, Model, DataTypes } = require("sequelize");
const app = express();

cron.schedule('* * * * *', () => {
	console.log('running a task every minute');
  });

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

app.get("/load",function(request,response){
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
    //response.send("!!!");
});

app.listen(3000);
