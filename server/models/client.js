const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Client = sequelize.define('client', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    company_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    underscored: true,
    tableName: 'clients'
  });

  return Client;
};
