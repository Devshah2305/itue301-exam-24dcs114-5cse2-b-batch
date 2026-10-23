import EventCard from "../components/EventCard";

const EVENTS = [
  {
    id: 1,
    title: "React Workshop",
    category: "tech",
    date: "2026-11-05",
    duration: 90,
    fee: 0,
    seatsLeft: 20,
  },
  {
    id: 2,
    title: "Cultural Fest",
    category: "cultural",
    date: "2026-12-01",
    duration: 120,
    fee: 50,
    seatsLeft: 0,
  },
  {
    id: 3,
    title: "Cricket Tournament",
    category: "sports",
    date: "2026-11-20",
    duration: 45,
    fee: 25.5,
    seatsLeft: 5,
  },
  {
    id: 4,
    title: "AI & ML Summit",
    category: "tech",
    date: "2026-11-15",
    duration: 180,
    fee: 100,
    seatsLeft: 50,
  },
];

function Events() {
  return (
    <main>
      <h1>Upcoming Events</h1>

      <div className="events-grid">
        {EVENTS.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </main>
  );
}

export default Events;
