'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Subscriptions Table
    await queryInterface.createTable('subscriptions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      stripe_subscription_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      stripe_customer_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      plan: {
        type: Sequelize.STRING,
        allowNull: false
      },
      price_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      current_period_start: {
        type: Sequelize.DATE,
        allowNull: false
      },
      current_period_end: {
        type: Sequelize.DATE,
        allowNull: false
      },
      cancel_at_period_end: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Payments Table
    await queryInterface.createTable('payments', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      stripe_invoice_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      stripe_payment_intent_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
      },
      billing_reason: {
        type: Sequelize.STRING,
        allowNull: true
      },
      paid_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Webhook Events Table
    await queryInterface.createTable('webhook_events', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      event_id: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      processed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('webhook_events');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('subscriptions');
  }
};
