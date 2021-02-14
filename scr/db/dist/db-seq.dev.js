"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var _require = require('sequelize'),
    Sequelize = _require.Sequelize,
    Model = _require.Model;

var logger = require('../services/logger-config');

var config = require('../../config.js');

var sequelizeConfig = config.sequelizeConfig;
var sequelize = new Sequelize(sequelizeConfig.DBName, sequelizeConfig.DBLogin, sequelizeConfig.DBPass, {
  dialect: 'mysql',
  define: {
    timestamps: false
  }
});

var PersBD =
/*#__PURE__*/
function (_Model) {
  _inherits(PersBD, _Model);

  function PersBD() {
    _classCallCheck(this, PersBD);

    return _possibleConstructorReturn(this, _getPrototypeOf(PersBD).apply(this, arguments));
  }

  return PersBD;
}(Model);

PersBD.init({
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  bdData: {
    type: Sequelize.STRING,
    allowNull: true
  },
  hash: {
    type: Sequelize.STRING,
    allowNull: true
  },
  jwtHash: {
    type: Sequelize.STRING,
    allowNull: true
  }
}, {
  sequelize: sequelize,
  modelName: sequelizeConfig.modelName
});

try {
  sequelize.authenticate();
  logger.info('DB-seq - Соединение с БД установлено');
} catch (error) {
  logger.error("DB-seq - \u041E\u0448\u0438\u0431\u043A\u0430: ".concat(error));
}

module.exports = PersBD;