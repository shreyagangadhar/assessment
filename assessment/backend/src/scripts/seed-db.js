const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Database configuration - use the same config as the main app
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Check if sections already exist
    const existingSections = await pool.query('SELECT COUNT(*) FROM sections');
    if (existingSections.rows[0].count > 0) {
      console.log('Sections already exist, skipping...');
    } else {
      console.log('Inserting sections data...');
      await pool.query(`
        INSERT INTO sections (name) VALUES 
        ('A'), ('B'), ('C'), ('D')
        ON CONFLICT (name) DO NOTHING
      `);
      console.log('Sections inserted successfully');
    }
    
    // Check if classes already exist
    const existingClasses = await pool.query('SELECT COUNT(*) FROM classes');
    if (existingClasses.rows[0].count > 0) {
      console.log('Classes already exist, skipping...');
    } else {
      console.log('Inserting classes data...');
      await pool.query(`
        INSERT INTO classes (name, sections) VALUES 
        ('Class 1', 'A,B'),
        ('Class 2', 'A,B,C'),
        ('Class 3', 'A,B,C,D'),
        ('Class 4', 'A,B'),
        ('Class 5', 'A,B,C')
        ON CONFLICT (name) DO NOTHING
      `);
      console.log('Classes inserted successfully');
    }
    
    // Check if departments already exist
    const existingDepts = await pool.query('SELECT COUNT(*) FROM departments');
    if (existingDepts.rows[0].count > 0) {
      console.log('Departments already exist, skipping...');
    } else {
      console.log('Inserting departments data...');
      await pool.query(`
        INSERT INTO departments (name) VALUES 
        ('Computer Science'),
        ('Mathematics'),
        ('English'),
        ('Science'),
        ('Social Studies')
        ON CONFLICT (name) DO NOTHING
      `);
      console.log('Departments inserted successfully');
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seed function if this script is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
