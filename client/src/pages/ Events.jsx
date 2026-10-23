import { useEffect, useState } from "react";
import EventCard from "../components/EventCard";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch("http://localhost:5000/api/v1/events");

        if (!response.ok) {
          throw new Error("Failed to load events");
        }

        const data = await response.json();

        setEvents(data);
      } catch (err) {
        setError("Could not load events");
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  if (loading) {
    return <p>Loading events...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>
      <h1>Campus Events</h1>

      <div className="event-grid">
        {events.map((event) => (
          <EventCard
            key={event.id || event._id}
            event={event}
          />
        ))}
      </div>
    </main>
  );
}

export default Events;