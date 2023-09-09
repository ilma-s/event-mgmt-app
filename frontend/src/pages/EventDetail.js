import {
    useRouteLoaderData,
    json,
    redirect,
    defer,
    Await,
} from 'react-router-dom';
import EventItem from '../components/EventItem';
import EventsList from '../components/EventsList';
import { Suspense } from 'react';

const EventDetailPage = () => {
    const { event, events } = useRouteLoaderData('event-detail');

    return (
        <>
            <Suspense
                fallback={<p style={{ textAlign: 'center' }}>Loading...</p>}
            >
                <Await resolve={event}>
                    {(loadedEvent) => <EventItem event={loadedEvent} />}
                </Await>
            </Suspense>
            <Suspense
                fallback={<p style={{ textAlign: 'center' }}>Loading...</p>}
            >
                <Await resolve={events}>
                    {(loadedEvents) => <EventsList events={loadedEvents} />}
                </Await>
            </Suspense>
        </>
    );
};

export default EventDetailPage;

const loadEvent = async (id) => {
    const response = await fetch('http://localhost:8080/events/' + id);

    if (!response.ok) {
        throw json(
            { message: 'could not fetch details for the selected event' },
            { status: 500 },
        );
    } else {
        const responseData = await response.json();
        return responseData.event;
    }
};

const loadEvents = async () => {
    const response = await fetch('http://localhost:8080/events');

    if (!response.ok) {
        throw json({ message: 'could not fetch events' }, { status: 500 });
    } else {
        const responseData = await response.json();
        return responseData.events;
    }
};

export const loader = async ({ request, params }) => {
    const id = params.eventId;

    return defer({
        event: await loadEvent(id), 
        events: loadEvents(),
    });
};

export const action = async ({ params, request }) => {
    const eventId = params.eventId;
    const response = await fetch('http://localhost:8080/events/' + eventId, {
        method: request.method,
    });

    if (!response.ok) {
        throw json({ message: 'could not delete the event' }, { status: 500 });
    }

    return redirect('/events');
};
