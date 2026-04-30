const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data.');

    // Create users
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@taskmanager.com',
      password: 'admin123',
      role: 'admin',
    });

    const alice = await User.create({
      name: 'Alice Johnson',
      email: 'alice@taskmanager.com',
      password: 'password123',
      role: 'member',
    });

    const bob = await User.create({
      name: 'Bob Smith',
      email: 'bob@taskmanager.com',
      password: 'password123',
      role: 'member',
    });

    const charlie = await User.create({
      name: 'Charlie Brown',
      email: 'charlie@taskmanager.com',
      password: 'password123',
      role: 'member',
    });

    console.log('Created users.');

    // Create projects
    const webApp = await Project.create({
      title: 'Website Redesign',
      description: 'Complete redesign of the company website with modern UI/UX principles.',
      owner: admin._id,
      members: [admin._id, alice._id, bob._id],
    });

    const mobileApp = await Project.create({
      title: 'Mobile App Development',
      description: 'Build a cross-platform mobile application for customer engagement.',
      owner: admin._id,
      members: [admin._id, bob._id, charlie._id],
    });

    const apiProject = await Project.create({
      title: 'API Integration',
      description: 'Integrate third-party APIs for payment processing and analytics.',
      owner: admin._id,
      members: [admin._id, alice._id, charlie._id],
    });

    console.log('Created projects.');

    // Create tasks
    const now = new Date();
    const tasks = [
      // Website Redesign tasks
      {
        title: 'Design homepage mockup',
        description: 'Create wireframes and high-fidelity mockup for the new homepage.',
        project: webApp._id,
        assignedTo: alice._id,
        status: 'done',
        dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
      {
        title: 'Implement responsive navigation',
        description: 'Build a responsive navigation bar with hamburger menu for mobile.',
        project: webApp._id,
        assignedTo: bob._id,
        status: 'in-progress',
        dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for automated testing and deployment.',
        project: webApp._id,
        assignedTo: alice._id,
        status: 'todo',
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
      // Mobile App tasks
      {
        title: 'Set up React Native project',
        description: 'Initialize React Native project with TypeScript template.',
        project: mobileApp._id,
        assignedTo: bob._id,
        status: 'done',
        dueDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
      {
        title: 'Build authentication screens',
        description: 'Implement login, signup, and password reset screens.',
        project: mobileApp._id,
        assignedTo: charlie._id,
        status: 'in-progress',
        dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
      {
        title: 'Push notification setup',
        description: 'Configure Firebase Cloud Messaging for push notifications.',
        project: mobileApp._id,
        assignedTo: bob._id,
        status: 'todo',
        dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // overdue
        createdBy: admin._id,
      },
      // API Integration tasks
      {
        title: 'Research payment gateways',
        description: 'Compare Stripe, PayPal, and Square for payment processing.',
        project: apiProject._id,
        assignedTo: alice._id,
        status: 'done',
        dueDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
      {
        title: 'Implement Stripe integration',
        description: 'Set up Stripe checkout and webhook handling.',
        project: apiProject._id,
        assignedTo: charlie._id,
        status: 'todo',
        dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        createdBy: admin._id,
      },
      {
        title: 'Analytics dashboard API',
        description: 'Build API endpoints for analytics data aggregation.',
        project: apiProject._id,
        assignedTo: alice._id,
        status: 'in-progress',
        dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // overdue
        createdBy: admin._id,
      },
    ];

    await Task.insertMany(tasks);
    console.log('Created tasks.');

    console.log('\n✅ Seed complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Login credentials:');
    console.log('  Admin:   admin@taskmanager.com / admin123');
    console.log('  Alice:   alice@taskmanager.com / password123');
    console.log('  Bob:     bob@taskmanager.com / password123');
    console.log('  Charlie: charlie@taskmanager.com / password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
