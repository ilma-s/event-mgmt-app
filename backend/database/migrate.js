const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DATABASE = './database.db';

function getCompletedMigrations() {
    const db = new sqlite3.Database(DATABASE);
    const migrationsCompleted = [];

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all('SELECT name FROM migrations ORDER BY name', (err, rows) => {
                if (err) {
                    db.close();
                    return reject(err);
                }

                rows.forEach((row) => {
                    migrationsCompleted.push(row.name);
                });

                db.close();
                resolve(migrationsCompleted);
            });
        });
    });
}

function getAllMigrations() {
    const migrationsFolder = './database_migrations';
    return new Promise((resolve, reject) => {
        fs.readdir(migrationsFolder, (err, files) => {
            if (err) {
                return reject(err);
            }

            resolve(files);
        });
    });
}

async function getUnprocessedMigrations() {
    const completedMigrations = await getCompletedMigrations();
    const allMigrations = await getAllMigrations();

    if (completedMigrations.length === 0) {
        return allMigrations;
    }

    if (
        JSON.stringify(completedMigrations) ===
        JSON.stringify(allMigrations.slice(0, completedMigrations.length))
    ) {
        return allMigrations.filter(
            (migration) => !completedMigrations.includes(migration),
        );
    } else {
        throw new Error(
            'Completed migrations do not match the content of the migrations folder.',
        );
    }
}

async function processMigrations() {
    try {
        const unprocessedMigrations = await getUnprocessedMigrations();
        const db = new sqlite3.Database(DATABASE);

        for (const migration of unprocessedMigrations) {
            const migrationPath = path.join('./database_migrations', migration);
            const query = fs.readFileSync(migrationPath, 'utf8');

            await new Promise((resolve, reject) => {
                db.serialize(() => {
                    db.exec(query, (err) => {
                        if (err) {
                            db.close();
                            return reject(err);
                        }

                        const insertIntoMigration =
                            'INSERT INTO migrations VALUES (?)';
                        db.run(insertIntoMigration, migration, (err) => {
                            if (err) {
                                db.close();
                                return reject(err);
                            }

                            console.log(`Processing migration ${migration}`);
                            resolve();
                        });
                    });
                });
            });
        }

        db.close();
    } catch (err) {
        console.error('An error occurred during database migration:', err);
    }
}

processMigrations();
