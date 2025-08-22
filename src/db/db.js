import mongoose from "mongoose";

export const connectToDb = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("connected to databse"))
    .catch((err) => console.log(err));
};

