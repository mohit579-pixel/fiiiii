import app from './app.js';
import { config } from 'dotenv';
import connectToDB from './config/dbConnection.js';
import cloudinary from 'cloudinary';

config();
const PORT = process.env.PORT || 5000;


cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.listen(PORT, async (err) => {
    await connectToDB();
    if (err) {
        console.error(`Error starting the server: ${err}`);
    } else {
        console.log(`App is running at http://localhost:${PORT}`);
    }
});

export default app;