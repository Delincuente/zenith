const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Subscription = sequelize.define('subscription', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    stripe_subscription_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    stripe_customer_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    plan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    current_period_start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    current_period_end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    cancel_at_period_end: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {
    underscored: true,
    timestamps: true,
  });

  return Subscription;
};
