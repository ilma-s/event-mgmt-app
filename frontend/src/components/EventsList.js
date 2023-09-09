import { Link } from 'react-router-dom';

import classes from './EventsList.module.css';

function EventsList({ events }) {
    return (
        <div className={classes.events}>
            <h1 className={classes.header}>All Events</h1>
            <ul className={classes.list}>
                {events.map((event) => (
                    <li key={event.id} className={classes.item}>
                        <Link to={`/events/${event.id}`}>
                            <img src={event.imageURL} alt={event.title} />
                            <div className={classes.content}>
                                <h2>{event.title}</h2>
                                <time>{event.eventDate}</time>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default EventsList;
