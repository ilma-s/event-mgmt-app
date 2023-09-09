const express = require('express');
const router = express.Router();
const {
    isValidText,
    isValidDate,
    isValidImageUrl,
} = require('../util/validation');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3');

const path = require('path');
const databaseFile = path.join(__dirname, '../database/database.db'); // Construct an absolute path

let db = new sqlite3.Database(databaseFile, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQlite database.');
});

function handleError(res, error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
}

router.get('/', (req, res) => {
    const query = 'SELECT * FROM events';
    db.all(query, [], (err, rows) => {
        if (err) {
            handleError(res, err);
            return;
        }
        res.json({ events: rows });
    });
});

router.get('/:id', (req, res) => {
    const query = 'SELECT * FROM events WHERE id = ?';
    db.get(query, [req.params.id], (err, row) => {
        if (err) {
            handleError(res, err);
            return;
        }
        if (row) {
            res.json({ event: row });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    });
});

router.post('/', (req, res) => {
    const data = req.body;

    let errors = {};

    if (!isValidText(data.title)) {
        errors.title = 'Invalid title.';
    }

    if (!isValidText(data.description)) {
        errors.description = 'Invalid description.';
    }

    if (!isValidDate(data.date)) {
        console.log(data.date);
        errors.date = 'Invalid date.';
    }

    if (!isValidImageUrl(data.image)) {
        errors.image = 'Invalid image.';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(422).json({
            message: 'Adding the event failed due to validation errors.',
            errors,
        });
    }

    const query =
        'INSERT INTO events (id, title, eventDate, imageURL, eventDescription) VALUES (?, ?, ?, ?, ?)';
    const params = [
        uuidv4(),
        data.title,
        data.date,
        data.image,
        data.description,
    ];

    db.run(query, params, (err) => {
        if (err) {
            handleError(res, err);
            return;
        }
        res.status(201).json({ message: 'Event saved.', event: data });
    });
});

router.patch('/:id', (req, res) => {
    const data = req.body;

    let errors = {};

    if (!isValidText(data.title)) {
        errors.title = 'Invalid title.';
    }

    if (!isValidText(data.description)) {
        errors.description = 'Invalid description.';
    }

    if (!isValidDate(data.date)) {
        errors.date = 'Invalid date.';
    }

    if (!isValidImageUrl(data.image)) {
        errors.image = 'Invalid image.';
    }

    if (Object.keys(errors).length > 0) {
        return res.status(422).json({
            message: 'Updating the event failed due to validation errors.',
            errors,
        });
    }

    const query =
        'UPDATE events SET title = ?, eventDate = ?, imageURL = ?, eventDescription = ? WHERE id = ?';
    const params = [
        data.title,
        data.date,
        data.image,
        data.description,
        req.params.id,
    ];

    db.run(query, params, (err) => {
        if (err) {
            handleError(res, err);
            return;
        }
        res.json({ message: 'Event updated.', event: data });
    });
});

router.delete('/:id', (req, res) => {
    const query = 'DELETE FROM events WHERE id = ?';
    db.run(query, [req.params.id], (err) => {
        if (err) {
            handleError(res, err);
            return;
        }
        res.json({ message: 'Event deleted.' });
    });
});

module.exports = router;
