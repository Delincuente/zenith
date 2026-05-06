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
    custom_number: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  }, {
    hooks: {
      beforeCreate: async (client) => {
        const count = await sequelize.models.client.count();
        client.custom_number = `CL-${(count + 1).toString().padStart(3, '0')}`;
      },
    },
    underscored: true,
    tableName: 'clients'
  });

  return Client;
};
