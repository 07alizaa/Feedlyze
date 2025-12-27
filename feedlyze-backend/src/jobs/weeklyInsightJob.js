// src/jobs/weeklyInsightJob.js
const cron = require('node-cron');
const InsightService = require('../services/insightService');
const logger = require('../utils/logger');

/**
 * Weekly Insight Generation Job
 * Runs every Monday at 00:00 (midnight)
 * Generates aggregated insights for the previous week for all businesses
 */

// Cron expression: At 00:00 on Monday
// Format: minute hour day-of-month month day-of-week
const CRON_SCHEDULE = '0 0 * * 1'; // Every Monday at midnight

let isRunning = false;

/**
 * Run the insight generation job
 */
const runInsightJob = async () => {
  if (isRunning) {
    logger.warn('Weekly insight job already running, skipping...');
    return;
  }

  isRunning = true;
  const startTime = Date.now();

  logger.info('====================================');
  logger.info('Starting Weekly Insight Generation Job');
  logger.info('====================================');

  try {
    const results = await InsightService.generateWeeklyInsightsForAllBusinesses();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    logger.info('====================================');
    logger.info('Weekly Insight Job Complete');
    logger.info(`Duration: ${duration} seconds`);
    logger.info(`Businesses processed: ${results.total}`);
    logger.info(`Insights created: ${results.success}`);
    logger.info(`Skipped (already exist): ${results.skipped}`);
    logger.info(`Errors: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      logger.error('Errors encountered:', results.errors);
    }
    
    logger.info('====================================');

    return results;
  } catch (error) {
    logger.error('Weekly insight job failed:', error);
    throw error;
  } finally {
    isRunning = false;
  }
};

/**
 * Schedule the cron job
 */
const scheduleWeeklyInsightJob = () => {
  const job = cron.schedule(CRON_SCHEDULE, async () => {
    await runInsightJob();
  }, {
    scheduled: true,
    timezone: 'UTC' // Use UTC for consistency, adjust as needed
  });

  logger.info(`Weekly insight job scheduled: ${CRON_SCHEDULE} (Every Monday at midnight UTC)`);

  return job;
};

/**
 * Validate cron expression
 */
const validateCronSchedule = () => {
  return cron.validate(CRON_SCHEDULE);
};

module.exports = {
  scheduleWeeklyInsightJob,
  runInsightJob,
  validateCronSchedule,
  CRON_SCHEDULE
};
