import mongoose from "mongoose";

const connectDB = async (DATABASE_URL)=>{
    try {
        const DB_OPTIONS = {
            dbname :"geekshop"

        }
        await mongoose.connect(DATABASE_URL,DB_OPTIONS);
        console.log("Database connection successful");
    } catch (error) {
        console.error("Error connecting to database:", error.message);
        process.exit(1);
    }
}

export default connectDB