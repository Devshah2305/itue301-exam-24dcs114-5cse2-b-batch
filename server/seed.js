import mongoose from "mongoose";
import dotenv from "dotenv";

import Event from "./models/Event.js";
import { formatValidationError } from "./utils/formatValidationError.js";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  // ── 1. Save one VALID event ────────────────────────────────────────────────
  const validEvent = new Event({
    title:    "Campus Tech Fest",
    date:     new Date("2026-11-05"),
    category: "tech",
    duration: 120,
    capacity: 100,
    fee:      250,
  });

  const savedEvent = await validEvent.save();
  console.log("Saved valid event:");
  console.log(savedEvent.toObject());

  // ── 2. Attempt to save one INVALID event and print formatted error ─────────
  // Errors triggered:
  //   • capacity 250 exceeds the cultural-event cap of 200
  //   • fee -10 is below the minimum of 0
  const invalidEvent = new Event({
    title:    "Invalid Cultural Event",
    date:     new Date("2026-11-06"),
    category: "cultural",
    duration: 90,
    capacity: 250,
    fee:      -10,
  });

  try {
    await invalidEvent.save();
  } catch (error) {
    if (error.name === "ValidationError") {
      console.log("Formatted validation error:");
      console.log(
        JSON.stringify(formatValidationError(error), null, 2)
      );
    } else {
      throw error;
    }
  }

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
