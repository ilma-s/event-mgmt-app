CREATE TABLE events (
    id TEXT,
    title TEXT,
    eventDate TEXT,
    imageURL TEXT,
    eventDescription TEXT,
    creator TEXT,
    FOREIGN KEY (creator) REFERENCES users(id)
);
