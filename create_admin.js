require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user");

async function createAdmin() {
    try {
        const mongoUri = process.env.DB_URI;
        if (!mongoUri) throw new Error("DB_URI is missing in .env");

        await mongoose.connect(mongoUri, {
            writeConcern: { w: 1 },
        });
        console.log("Connected to MongoDB");

        const email = "admin@vibaura.com";
        const password = "adminpassword123";

        // Check if admin exists
        const existingAdmin = await User.findOne({ email });
        if (existingAdmin) {
            console.log("Admin user already exists.");
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const admin = new User({
            email,
            passwordHash,
            role: "admin",
        });

        await admin.save();
        console.log(`Admin created successfully!`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

    } catch (err) {
        console.error("Error creating admin:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createAdmin();
