import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import Event from "./models/Event.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ── Request logger: one line per request ─────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${req.method}] [${req.path}] [${new Date().toISOString()}]`);
  next();
});

// ── POST /api/v1/events ───────────────────────────────────────────────────────
app.post("/api/v1/events", async (req, res, next) => {
  try {
    const { title, capacity, fee } = req.body;

    if (
      typeof title !== "string" ||
      title.trim().length < 1 ||
      title.trim().length > 80
    ) {
      return res.status(400).json({
        error: "Title is required and must be 1 to 80 characters",
      });
    }

    if (
      !Number.isInteger(capacity) ||
      capacity < 1 ||
      capacity > 500
    ) {
      return res.status(400).json({
        error: "Capacity must be a whole number from 1 to 500",
      });
    }

    if (
      fee !== undefined &&
      (typeof fee !== "number" || !Number.isFinite(fee) || fee < 0)
    ) {
      return res.status(400).json({
        error: "Fee must be a number greater than or equal to 0",
      });
    }

    const event = await Event.create({
      title: title.trim(),
      capacity,
      fee: fee ?? 0,
      date: req.body.date ?? new Date(),
      category: req.body.category ?? "tech",
      duration: req.body.duration ?? 0,
    });

    // Return only the four fields the spec requires: { id, title, capacity, fee }
    return res.status(201).json({
      id: event._id.toString(),
      title: event.title,
      capacity: event.capacity,
      fee: event.fee,
    });
  } catch (error) {
    next(error);
  }
});

// ── GET /api/v1/events ────────────────────────────────────────────────────────
app.get("/api/v1/events", async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.maxFee !== undefined) {
      const maxFee = Number(req.query.maxFee);
      if (!Number.isNaN(maxFee)) {
        filter.fee = { $lte: maxFee };
      }
    }

    const events = await Event.find(filter).lean();

    const result = events.map((event) => ({
      id: event._id.toString(),
      title: event.title,
      capacity: event.capacity,
      fee: event.fee,
      // Extra fields kept for the frontend
      seatsLeft: event.capacity,
      date: event.date,
      category: event.category,
      duration: event.duration,
    }));

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// ── GET /api/v1/events/:id ────────────────────────────────────────────────────
app.get("/api/v1/events/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = await Event.findById(req.params.id).lean();

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json({
      id: event._id.toString(),
      title: event.title,
      capacity: event.capacity,
      fee: event.fee,
    });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /api/v1/events/:id ─────────────────────────────────────────────────
app.delete("/api/v1/events/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ error: "Event not found" });
    }

    const event = await Event.findByIdAndDelete(req.params.id).lean();

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json({
      id: event._id.toString(),
      title: event.title,
      capacity: event.capacity,
      fee: event.fee,
    });
  } catch (error) {
    next(error);
  }
});

// ── Deliberate error endpoint ─────────────────────────────────────────────────
// In Express 4 a synchronous throw in a route handler does NOT automatically
// reach the error middleware, so we must call next(err) explicitly.
app.get("/api/v1/boom", (req, res, next) => {
  try {
    throw new Error("Intentional test error");
  } catch (err) {
    next(err);
  }
});

// ── Global error handler (no stack trace in response) ────────────────────────
// Must be defined AFTER all routes and have exactly four parameters.
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(500).json({ error: "Something went wrong" });
});

// ── Connect MongoDB then start listening ──────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
