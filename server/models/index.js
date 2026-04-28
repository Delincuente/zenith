const Sequelize = require('sequelize');
const config = require('../config/config.js');
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Models
db.User = require('./user')(sequelize);
db.Client = require('./client')(sequelize);
db.Project = require('./project')(sequelize);
db.Task = require('./task')(sequelize);

// Associations
// User & Client
db.User.hasMany(db.Client, { foreignKey: 'user_id' });
db.Client.belongsTo(db.User, { foreignKey: 'user_id' });

// User & Project
db.User.hasMany(db.Project, { foreignKey: 'user_id' });
db.Project.belongsTo(db.User, { foreignKey: 'user_id' });

// Project & Client
db.Client.hasMany(db.Project, { foreignKey: 'client_id' });
db.Project.belongsTo(db.Client, { foreignKey: 'client_id' });

// Project & Task
db.Project.hasMany(db.Task, { foreignKey: 'project_id', onDelete: 'CASCADE' });
db.Task.belongsTo(db.Project, { foreignKey: 'project_id' });

// Task & User (Assignee)
db.User.hasMany(db.Task, { foreignKey: 'assigned_to' });
db.Task.belongsTo(db.User, { foreignKey: 'assigned_to', as: 'assignee' });

module.exports = db;
