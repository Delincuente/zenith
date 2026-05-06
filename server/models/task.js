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
    custom_number: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  }, {
    hooks: {
      beforeCreate: async (task) => {
        const count = await sequelize.models.task.count();
        task.custom_number = `TK-${(count + 1).toString().padStart(3, '0')}`;
      },
    },
    underscored: true,
    tableName: 'tasks'
  });

  return Task;
};
