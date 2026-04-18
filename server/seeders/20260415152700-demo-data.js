'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const adminId = uuidv4();
    const clientId = uuidv4();
    const projectId = uuidv4();
    const password = await bcrypt.hash('password123', 10);

    // Users
    await queryInterface.bulkInsert('Users', [
      {
        id: adminId,
        name: 'John Agency',
        email: 'admin@example.com',
        password: password,
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: clientId,
        name: 'Jane Client',
        email: 'client@example.com',
        password: password,
        role: 'client',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Clients
    await queryInterface.bulkInsert('Clients', [
      {
        id: uuidv4(),
        user_id: adminId,
        company_name: 'Acme Corp',
        phone: '123-456-7890',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Projects
    await queryInterface.bulkInsert('Projects', [
      {
        id: projectId,
        user_id: adminId,
        title: 'Modern SaaS Platform',
        description: 'Building a full-stack SaaS project management tool from scratch.',
        status: 'active',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Tasks
    await queryInterface.bulkInsert('Tasks', [
      {
        id: uuidv4(),
        project_id: projectId,
        title: 'Setup Database',
        description: 'Initialize MySQL and Sequelize migrations.',
        status: 'done',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        project_id: projectId,
        title: 'Implement Auth',
        description: 'JWT with refresh tokens.',
        status: 'in_progress',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tasks', null, {});
    await queryInterface.bulkDelete('Projects', null, {});
    await queryInterface.bulkDelete('Clients', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
