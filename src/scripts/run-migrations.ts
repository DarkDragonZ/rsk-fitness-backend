import dataSource from "../data-source";

async function run() {
  try {
    console.log('Initializing data source for migrations...');
    await dataSource.initialize();
    console.log('Running migrations...');
    await dataSource.runMigrations();
    console.log('Migrations completed.');
    await dataSource.destroy();
  } catch (err) {
    console.error('Failed to run migrations:', err);
    process.exit(1);
  }
}

run();
