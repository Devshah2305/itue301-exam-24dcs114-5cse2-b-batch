import PropTypes from "prop-types";

function formatDate(dateValue) {
  const date = new Date(dateValue);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours} h ${mins} min`;
  }

  if (hours > 0) {
    return `${hours} h`;
  }

  return `${mins} min`;
}

function formatFee(fee) {
  return Number(fee) === 0 ? "Free" : `₹${Number(fee).toFixed(2)}`;
}

function EventCard({ event }) {
  const { title, category, date, duration, fee, seatsLeft } = event;

  return (
    <article className="event-card">
      <h2>{title}</h2>

      <p>
        <strong>Category:</strong> {category}
      </p>

      <p>
        <strong>Date:</strong> {formatDate(date)}
      </p>

      <p>
        <strong>Duration:</strong> {formatDuration(duration)}
      </p>

      <p>
        <strong>Fee:</strong> {formatFee(fee)}
      </p>

      <p>
        <strong>Seats:</strong>{" "}
        {Number(seatsLeft) === 0 ? "Full" : `${seatsLeft} seats left`}
      </p>
    </article>
  );
}

EventCard.propTypes = {
  event: PropTypes.shape({
    title:     PropTypes.string.isRequired,
    category:  PropTypes.string.isRequired,
    date:      PropTypes.string.isRequired,
    duration:  PropTypes.number.isRequired,
    fee:       PropTypes.number.isRequired,
    seatsLeft: PropTypes.number.isRequired,
  }).isRequired,
};

export default EventCard;
