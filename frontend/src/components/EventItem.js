import { useState, useEffect } from 'react';
import { Link, useRouteLoaderData, useSubmit } from 'react-router-dom';

import classes from './EventItem.module.css';

function EventItem({ event }) {
    const token = useRouteLoaderData('root');

    const [isAuthorized, setIsAuthorized] = useState(false);

    const submit = useSubmit();

    const identifier = localStorage.getItem('identifier');

    const [username, setUsername] = useState('');

    useEffect(() => {
        if (token !== null) {
            async function fetchData() {
                try {
                    const response = await fetch('http://localhost:8080/checkAuthorization', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ identifier, id: event.creator }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setIsAuthorized(data.isAuthorized);
                    } else {
                        // Handle errors if needed
                        console.log("idk");
                    }
                } catch (error) {
                    console.error('Error fetching authorization data:', error);
                }
            }

            fetchData();
        }
    }, [identifier, token, event.creator]);

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
            <p>Post by: {event.username}</p>
            {token && isAuthorized && (
                <menu className={classes.actions}>
                    <Link to="edit">Edit</Link>
                    <button onClick={startDeleteHandler}>Delete</button>
                </menu>
            )}
        </article>
    );
}

export default EventItem;
