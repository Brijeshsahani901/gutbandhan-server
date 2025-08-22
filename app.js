import express from "express";
import dotenv from "dotenv";
import path from "path";
import { connectToDb } from "./src/db/db.js";
import userRoutes from "./src/routes/user.route.js";
import authRoutes from "./src/routes/auth.route.js";
import profileRoutes from "./src/routes/profile.route.js";
import inquiryRoutes from './src/routes/inquiry.route.js';
import shortlistProfileRoutes from "./src/routes/shortListedProfile.route.js";
import interestedRoutes from "./src/routes/interested.route.js";
import messageRoutes from "./src/routes/message.route.js";
import PartnerPreferenceRoutes from "./src/routes/partenerPreference.route.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const port = process.env.PORT || 7000;
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);


const allowedOrigins = ['http://localhost:5173', 'http://31.97.231.211', 'https://guthbandhan.com', 'https://www.guthbandhan.com'];

// Apply CORS middleware BEFORE routes, with proper options
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like Postman, curl) or from allowedOrigins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));


// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/profile", profileRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use("/api/interests", interestedRoutes);
app.use("/api/partner-preference", PartnerPreferenceRoutes);
app.use("/api/shortlist-profile", shortlistProfileRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.status(200).send("hello world");
});

// Create HTTP server from Express app
const server = http.createServer(app);

// Setup Socket.IO with CORS allowing all origins (or adjust as needed)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("send-message", (data) => {
    console.log("📨 Message Received:", data);
    socket.broadcast.emit("receive-message", data);
  });
    socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// Start the server and connect to database
server.listen(port, () => {
  connectToDb();
  console.log(`Server is running on port ${port}`);
});

             