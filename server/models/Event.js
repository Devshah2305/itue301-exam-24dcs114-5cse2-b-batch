import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
      maxlength: [80, "title may not exceed 80 characters"],
    },

    date: {
      type: Date,
      required: [true, "date is required"],
      validate: {
        validator: (value) =>
          value instanceof Date && !Number.isNaN(value.getTime()),
        message: "date must be a valid date",
      },
    },

    category: {
      type: String,
      enum: {
        values: ["tech", "cultural", "sports"],
        message: "category must be tech, cultural or sports",
      },
      default: "tech",
    },

    duration: {
      type: Number,
      required: true,
      min: [0, "duration must be 0 or more"],
    },

    capacity: {
      type: Number,
      required: [true, "capacity is required"],
      min: [1, "capacity must be at least 1"],
      max: [500, "capacity may not exceed 500"],
      validate: [
        {
          // Must be a whole number.
          // Regular function required so `this` refers to the document.
          validator: function (value) {
            return Number.isInteger(value);
          },
          message: "capacity must be a whole number",
        },
        {
          // Cultural events may not exceed 200.
          // Regular function required so `this` refers to the document.
          validator: function (value) {
            if (this.category === "cultural") {
              return value <= 200;
            }
            return true;
          },
          message: "capacity of a cultural event may not exceed 200",
        },
      ],
    },

    fee: {
      type: Number,
      min: [0, "fee must be 0 or more"],
      default: 0,
    },
  },
  {
    // Let Mongoose manage createdAt automatically.
    timestamps: { createdAt: "createdAt", updatedAt: false },
    versionKey: false,
  }
);

export default mongoose.model("Event", eventSchema);
