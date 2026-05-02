const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WebhookEvent = sequelize.define('webhook_event', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    event_id: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    processed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  }, {
    underscored: true,
    timestamps: true,
  });

  return WebhookEvent;
};
