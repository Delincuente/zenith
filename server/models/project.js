const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('project', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    client_id: {
      type: DataTypes.UUID,
      allowNull: true,
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
      type: DataTypes.ENUM('active', 'completed', 'on_hold', 'cancelled'),
      defaultValue: 'active',
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    custom_number: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  }, {
    hooks: {
      beforeCreate: async (project) => {
        const count = await sequelize.models.project.count();
        project.custom_number = `PR-${(count + 1).toString().padStart(3, '0')}`;
      },
    },
    underscored: true,
    tableName: 'projects'
  });

  return Project;
};
