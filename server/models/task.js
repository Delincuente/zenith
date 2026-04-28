const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Task = sequelize.define('task', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    project_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('todo', 'in_progress', 'review', 'done'),
      defaultValue: 'todo',
    },
    assigned_to: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  }, {
    underscored: true,
    tableName: 'tasks'
  });

  return Task;
};
