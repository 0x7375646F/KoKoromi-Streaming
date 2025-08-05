const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { connectDB, sequelize } = require('./db/database');
const apiMonitorService = require('./services/apiMonitorService');
const UserAccount = require('./db/model/userModel');
const ApiStatus = require('./db/model/apiStatusModel');
const bcrypt = require('bcrypt');
const { generateUserAvatar } = require('./utils/avatarGenerator');
const { defaultApis } = require('./scripts/initializeApis');

require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 1337

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173','http://127.0.0.1:5173','http://192.168.1.66:5173','http://172.17.0.1:5173','http://192.168.122.46:5173']
}))
app.use('/api/auth',require('./routes/authRoute'));
app.use('/api/users',require('./routes/userRoute'));
app.use('/api/admin',require('./routes/adminRoute'));
app.use('/api/comments',require('./routes/commentRoute'));
app.get('/',(req,res)=>{
    res.send("Hello World!")
})


const startServer = async() => {
    await connectDB();
    await sequelize.sync({ alter: false }); // Re-enable alter for new models
    
    // Create cleanup event for unverified users
    await sequelize.query(`
        CREATE EVENT IF NOT EXISTS cleanup_unverified_users
        ON SCHEDULE EVERY 1 DAY
        STARTS CURRENT_TIMESTAMP
        DO
          DELETE FROM Users
          WHERE verified = false
          AND createdAt < (NOW() - INTERVAL 10 MINUTE);
    `);

    // Create default super admin if none exists
    const adminCount = await UserAccount.count({ where: { role: 'root' } });
    if (adminCount === 0) {
        const sha = crypto.createHash("sha256").update('I@amH@cker6969').digest("hex");
        const hashedPassword = await bcrypt.hash(sha, 10);
        const avatarUrl = generateUserAvatar('sudo');
        await UserAccount.create({
            username: 'sudo',
            password: hashedPassword,
            role: 'root',
            totp: 'admin', // Required field, using placeholder
            picture: avatarUrl,
            verified: true
        });
        console.log('Default super admin created: username: sudo, password: I@amH@cker6969');
        console.log('Admin avatar URL:', avatarUrl);
    }

    // Initialize default APIs if none exist
    const apiCount = await ApiStatus.count();
    if (apiCount === 0) {
        console.log('📡 Initializing default APIs for monitoring...');
        for (const apiData of defaultApis) {
            await ApiStatus.create(apiData);
            console.log(`✅ Added default API: ${apiData.name}`);
        }
    }

    // Initialize API monitoring service
    await apiMonitorService.initialize();



    app.listen(PORT,()=>{
        console.log(`server is running at http://localhost:${PORT}`);
        console.log('Admin dashboard available at /api/admin');
    })
}

startServer()
