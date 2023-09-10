const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcryptjs');

const path = require('path');
const databaseFile = path.join(__dirname, '../database/database.db');

let db = new sqlite3.Database(databaseFile, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

const createUser = async (userData) => {
    return await new Promise((resolve, reject) => {
        const { email, password, username } = userData;

        console.log(username);

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                reject(err);
            } else {
                const query =
                    'INSERT INTO users (id, email, password, username) VALUES (?, ?, ?, ?)';

                db.run(
                    query,
                    [uuidv4(), email, hashedPassword, username],
                    function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ id: this.lastID, email, username });
                        }
                    },
                );
            }
        });
    });
};

const getUserByEmailOrUsername = async (identifier) => {
    return await new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE email = ? OR username = ?';

        db.get(query, [identifier, identifier], (err, row) => {
            if (err) {
                console.error('Error executing query:', err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};


const getUserId = async (identifier) => {
    return await new Promise((resolve, reject) => {
        const query = 'SELECT id FROM users WHERE email = ? OR username = ?';

        db.get(query, [identifier, identifier], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.id);
            }
        });
    });
};

const checkPassword = async (password, hashedPassword) => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        throw error;
    }
};

const isAvailableUsername = async (username) => {

    return await new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) as count FROM users WHERE username = ?';

        db.get(query, [username], (err, row) => {
            if (err) {
                reject(err);
            } else {
                const isAvailable = row.count === 0;
                resolve(isAvailable);
            }
        });
    });
};

const checkAuth = async (identifier) => {
    const query = 'SELECT id FROM users WHERE email = ? OR username = ?';
    return await new Promise((resolve, reject) => {
        db.all(query, [identifier, identifier], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}



    module.exports = {
    createUser,
    getUserByEmailOrUsername,
    checkPassword,
    getUserId,
    isAvailableUsername,
    checkAuth
};
