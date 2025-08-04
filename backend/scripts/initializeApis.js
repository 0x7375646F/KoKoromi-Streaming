const ApiStatus = require('../db/model/apiStatusModel');
const { sequelize } = require('../db/database');
require('dotenv').config();

const defaultApis = [
    {
        name: 'Hi-Anime API',
        url: process.env.HI_ANIME_API,
        description: 'Hi Anime API',
        category: 'anime',
        checkInterval: 300, // 5 minutes
        isActive: true
    },
    {
        name: 'M3U8-Proxy',
        url: process.env.M3_U8_PROXY_API,
        description: 'M3U8-Proxy Video Streaming API',
        category: 'anime',
        checkInterval: 600, // 10 minutes
        isActive: true
    }
];

const initializeApis = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        for (const apiData of defaultApis) {
            const existingApi = await ApiStatus.findOne({
                where: { url: apiData.url }
            });

            if (!existingApi) {
                await ApiStatus.create(apiData);
                console.log(`✅ Added API: ${apiData.name} (${apiData.url})`);
            } else {
                console.log(`⏭️ API already exists: ${apiData.name}`);
            }
        }

        console.log('🎉 API initialization completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing APIs:', error);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    initializeApis();
}

module.exports = { initializeApis, defaultApis }; 