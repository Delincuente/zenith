'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'stripe_customer_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'stripe_subscription_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('users', 'current_plan', {
      type: Sequelize.STRING,
      defaultValue: 'free',
    });
    await queryInterface.addColumn('users', 'subscription_status', {
      type: Sequelize.STRING,
      defaultValue: 'none',
    });
    await queryInterface.addColumn('users', 'current_period_end', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'stripe_customer_id');
    await queryInterface.removeColumn('users', 'stripe_subscription_id');
    await queryInterface.removeColumn('users', 'current_plan');
    await queryInterface.removeColumn('users', 'subscription_status');
    await queryInterface.removeColumn('users', 'current_period_end');
  }
};
