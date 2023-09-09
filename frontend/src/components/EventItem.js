import React from 'react';
import { Link, useSubmit } from 'react-router-dom';
import classes from './EventItem.module.css';

function EventItem({ event }) {
    const submit = useSubmit();

    function startDeleteHandler() {
        const proceed = window.confirm('Are you sure?');

        if (proceed) {
            submit(null, { method: 'delete' });
        }
    }

    return (
        <article className={classes.event}>
            <img src={event.imageURL} alt={event.title} />
            <h1>{event.title}</h1>
            <time>{event.eventDate}</time>
            <p>{event.eventDescription}</p>
            <menu className={classes.actions}>
                <Link to="edit" className={classes.editLink}>
                    Edit
                </Link>
                <button
                    onClick={startDeleteHandler}
                    className={classes.deleteButton}
                >
                    Delete
                </button>
            </menu>
        </article>
    );
}

export default EventItem;
