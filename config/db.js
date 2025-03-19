import { connect } from "mongoose";

const connectDB = async () => {
  try {
    console.log("MongoDB connecting...");
    await connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
