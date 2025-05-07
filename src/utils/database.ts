import mongoose from "mongoose";

import { DATABASE_URL } from "./env";

const connect = async () => {
  try {
    await mongoose.connect(DATABASE_URL, {
      dbName: "db-acara",
    });
    // console.log("Database connected");
    return Promise.resolve("Database connected");
  } catch (error) {
    // console.error("Database connection failed");
    return Promise.reject(error);
  }
};

export default connect;
