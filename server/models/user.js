const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('user', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'client'),
      defaultValue: 'client',
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    stripe_customer_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripe_subscription_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    current_plan: {
      type: DataTypes.STRING,
      defaultValue: 'free',
    },
    subscription_status: {
      type: DataTypes.STRING,
      defaultValue: 'none',
    },
    current_period_end: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  });

  User.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  return User;
};
