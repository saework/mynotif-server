const userFunc = require('./scr/services/user-func');
const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect;
server = require('./app');
chai.use(chaiHttp);

describe('Тесты http запросов', () => {
  it('Главная страница', (done) => {
    chai
      .request(server)
      .get('/')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        //expect(res.body).to.haveOwnProperty('data')

        done();
      });
  });

  it('Регистрация нового пользователя', (done) => {
    chai
      .request(server)
      .post('/signup')
      .send({
        username: 'test@test.ru',
        password: '111',
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.haveOwnProperty('result');
        expect(res.body.result).to.equal('jwt');
        expect(res.body.result).to.not.be.empty;
        done();
      });
  });

  it('Вход пользователя с верным паролем', (done) => {
    chai
      .request(server)
      .post('/login')
      .send({
        username: 'test@test.ru',
        password: '111',
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.haveOwnProperty('jwtToken');
        done();
      });
  });

  it('Вход пользователя с НЕ верным паролем', (done) => {
    chai
      .request(server)
      .post('/login')
      .send({
        username: 'test@test.ru',
        password: '321',
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
  });

  it('Вход пользователя с НЕ верным логином', (done) => {
    chai
      .request(server)
      .post('/login')
      .send({
        username: 'notest@test.ru',
        password: '111',
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        done();
      });
  });

  it('Пользователь вошел в систему - получение данных из БД', (done) => {
    chai
      .request(server)
      .post('/home')
      .set('authorization', 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidGVzdEB0ZXN0LnJ1IiwiaWF0IjoxNjEyMDc5NzU3fQ.ts4FH3Ei0s-XZb6bmW1vh7yK5OXmi3jSamrZN3-LAHY')
      .send({
        data: {
          bdRows: [],
          currentUser: 'test@test.ru',
          jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidGVzdEB0ZXN0LnJ1IiwiaWF0IjoxNjEyMDc5NzU3fQ.ts4FH3Ei0s-XZb6bmW1vh7yK5OXmi3jSamrZN3-LAHY',
        },
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.haveOwnProperty('result');
        expect(res.body.result).to.equal('ok');
        //expect(res.body.mes).to.equal("Данные таблицы обновлены")

        done();
      });
  });

  it('Пользователь сохраняет список задач в БД', (done) => {
    chai
      .request(server)
      .post('/home')
      .set('authorization', 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidGVzdEB0ZXN0LnJ1IiwiaWF0IjoxNjEyMDc5NzU3fQ.ts4FH3Ei0s-XZb6bmW1vh7yK5OXmi3jSamrZN3-LAHY')
      .send({
        data: {
          bdRows: [
            {
              id: 1,
              persName: 'Задача пользователя 1',
              bdDate: '13.01.2021, 23:09',
              bdComm: 'Комментарий',
              bdTmz: 'Asia/Yekaterinburg',
              bdPeriod: 'Без повторов',
            },
            {
              id: 2,
              persName: 'Задача пользователя 2',
              bdDate: '10.01.2021, 20:27',
              bdComm: 'Длинный комментарий',
              bdTmz: 'Asia/Yekaterinburg',
              bdPeriod: 'Ежедневно',
            },
          ],
          currentUser: 'test@test.ru',
          jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidGVzdEB0ZXN0LnJ1IiwiaWF0IjoxNjEyMDc5NzU3fQ.ts4FH3Ei0s-XZb6bmW1vh7yK5OXmi3jSamrZN3-LAHY',
        },
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.haveOwnProperty('result');
        expect(res.body.result).to.equal('ok');
        expect(res.body.mes).to.equal('Данные таблицы обновлены');
        done();
      });
  });

  it('Загрузка задач пользователя из БД', (done) => {
    chai
      .request(server)
      .post('/load')
      .set('authorization', 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoidGVzdEB0ZXN0LnJ1IiwiaWF0IjoxNjEyMDc5NzU3fQ.ts4FH3Ei0s-XZb6bmW1vh7yK5OXmi3jSamrZN3-LAHY')
      .send({ currentUser: 'test@test.ru' })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body[0]).to.haveOwnProperty('bdData');
        expect(res.body[0].bdData).to.not.be.empty;
        done();
      });
  });

  it('Смена пароля пользователя', (done) => {
    chai
      .request(server)
      .post('/newpassword')
      .send({
        data: {
          currentUser: 'test@test.ru',
        },
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.haveOwnProperty('result');
        expect(res.body.result).to.equal('ok');
        done();
      });
  });

  it('Удаление аккаунта пользователяy', () => {
    userFunc.deleteUserAccount('test@test.ru', (result) => {
      expect(result).to.equal('Учетная запись удалена');
    });
  });
});
