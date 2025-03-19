import { connect } from "mongoose";

const connectDB = async () => {
  try {
    console.log("MongoDB connecting...",`${process.env.DB_URL}/${process.env.DB_NAME}`);
    await connect(`mongodb+srv://darshitdobariya9719:Darshit%402021@demo.imf2a.mongodb.net/test?retryWrites=true&w=majority`);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDB;
