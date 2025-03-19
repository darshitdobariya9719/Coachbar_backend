import { connect } from "mongoose";

const connectDB = async () => {
  try {
    console.log("MongoDB connecting...",`${process.env.DB_URL}/${process.env.DB_NAME}`);
    await connect(`${process.env.DB_URL}`);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
