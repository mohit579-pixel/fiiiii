import mongoose from "mongoose";

mongoose.set('strictQuery', false);

const connectToDB = async () => {
    try {
        let connection = await mongoose.connect(process.env.MONGO_URL);

        if (connection) {
            console.log(`Connected to db ${connection.connection.host}`);
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

export default connectToDB;