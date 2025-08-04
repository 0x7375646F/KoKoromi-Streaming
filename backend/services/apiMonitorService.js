const fetch = require('node-fetch');
const ApiStatus = require('../db/model/apiStatusModel');

class ApiMonitorService {
    constructor() {
        this.monitoringIntervals = new Map();
        this.isInitialized = false;
    }

    // Initialize the monitoring service
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            console.log('🔄 Initializing API monitoring service...');
            
            // Get all active APIs from database
            const apis = await ApiStatus.findAll({
                where: { isActive: true }
            });

            // Start monitoring each API
            apis.forEach(api => {
                this.startMonitoring(api);
            });

            this.isInitialized = true;
            console.log(`✅ API monitoring service initialized with ${apis.length} APIs`);
        } catch (error) {
            console.error('❌ Failed to initialize API monitoring service:', error);
        }
    }

    // Start monitoring a specific API
    startMonitoring(api) {
        // Clear existing interval if any
        if (this.monitoringIntervals.has(api.id)) {
            clearInterval(this.monitoringIntervals.get(api.id));
        }

        // Start new monitoring interval
        const interval = setInterval(async () => {
            await this.checkApiStatus(api);
        }, api.checkInterval * 1000);

        this.monitoringIntervals.set(api.id, interval);
        
        // Perform initial check
        this.checkApiStatus(api);
        
        console.log(`🔍 Started monitoring API: ${api.name} (${api.url}) - Interval: ${api.checkInterval}s`);
    }

    // Stop monitoring a specific API
    stopMonitoring(apiId) {
        if (this.monitoringIntervals.has(apiId)) {
            clearInterval(this.monitoringIntervals.get(apiId));
            this.monitoringIntervals.delete(apiId);
            console.log(`⏹️ Stopped monitoring API ID: ${apiId}`);
        }
    }

    // Check the status of a specific API
    async checkApiStatus(api) {
        const startTime = Date.now();
        let status = 'unknown';
        let responseTime = null;
        let lastError = null;

        try {
            console.log(`🔍 Checking API: ${api.name} (${api.url})`);
            
            const response = await fetch(api.url, {
                method: 'GET',
                timeout: 10000, // 10 second timeout
                headers: {
                    'User-Agent': 'Kokoromi-API-Monitor/1.0'
                }
            });

            responseTime = Date.now() - startTime;

            if (response.ok) {
                status = 'up';
                console.log(`✅ API ${api.name} is UP (${responseTime}ms)`);
            } else if (response.status >= 500) {
                status = 'down';
                lastError = `HTTP ${response.status}: ${response.statusText}`;
                console.log(`❌ API ${api.name} is DOWN (HTTP ${response.status})`);
            } else {
                status = 'warning';
                lastError = `HTTP ${response.status}: ${response.statusText}`;
                console.log(`⚠️ API ${api.name} has WARNING (HTTP ${response.status})`);
            }
        } catch (error) {
            status = 'down';
            lastError = error.message;
            console.log(`❌ API ${api.name} is DOWN (Error: ${error.message})`);
        }

        // Update database
        try {
            await api.update({
                status,
                responseTime,
                lastError,
                lastCheck: new Date()
            });
        } catch (updateError) {
            console.error(`❌ Failed to update API status for ${api.name}:`, updateError);
        }
    }

    // Add a new API to monitoring
    async addApi(apiData) {
        try {
            const api = await ApiStatus.create(apiData);
            if (api.isActive) {
                this.startMonitoring(api);
            }
            return api;
        } catch (error) {
            console.error('❌ Failed to add API to monitoring:', error);
            throw error;
        }
    }

    // Update an existing API in monitoring
    async updateApi(apiId, apiData) {
        try {
            const api = await ApiStatus.findByPk(apiId);
            if (!api) {
                throw new Error('API not found');
            }

            // Stop current monitoring
            this.stopMonitoring(apiId);

            // Update API data
            await api.update(apiData);

            // Restart monitoring if active
            if (api.isActive) {
                this.startMonitoring(api);
            }

            return api;
        } catch (error) {
            console.error('❌ Failed to update API in monitoring:', error);
            throw error;
        }
    }

    // Remove an API from monitoring
    async removeApi(apiId) {
        try {
            this.stopMonitoring(apiId);
            await ApiStatus.destroy({ where: { id: apiId } });
            console.log(`🗑️ Removed API ID ${apiId} from monitoring`);
        } catch (error) {
            console.error('❌ Failed to remove API from monitoring:', error);
            throw error;
        }
    }

    // Get monitoring status
    getMonitoringStatus() {
        return {
            isInitialized: this.isInitialized,
            activeMonitors: this.monitoringIntervals.size,
            monitoredApis: Array.from(this.monitoringIntervals.keys())
        };
    }

    // Stop all monitoring
    stopAllMonitoring() {
        this.monitoringIntervals.forEach((interval, apiId) => {
            clearInterval(interval);
        });
        this.monitoringIntervals.clear();
        this.isInitialized = false;
        console.log('⏹️ Stopped all API monitoring');
    }
}

// Create singleton instance
const apiMonitorService = new ApiMonitorService();

module.exports = apiMonitorService; 