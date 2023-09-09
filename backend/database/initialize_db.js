const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DATABASE = './database.db';

function initializeDatabase() {
    const db = new sqlite3.Database(DATABASE);

    db.serialize(() => {
        db.run(
            'CREATE TABLE IF NOT EXISTS migrations (name TEXT NOT NULL);',
            (err) => {
                if (err) {
                    console.error(
                        'An error occurred while initializing the database:',
                        err,
                    );
                } else {
                    console.log('Database initialization successful.');
                }

                db.close();
            },
        );
    });
}

initializeDatabase();
