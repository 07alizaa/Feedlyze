// src/services/qrService.js
const QRCode = require('qrcode');
const logger = require('../utils/logger');

class QRService {
  /**
   * Generate QR code as base64 string
   * @param {string} url - URL to encode in QR code
   * @param {Object} options - QR code options
   * @returns {Promise<string>} - Base64 QR code string
   */
  static async generateQRCode(url, options = {}) {
    try {
      const defaultOptions = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      };

      const qrOptions = { ...defaultOptions, ...options };

      // Generate QR code as data URL (base64)
      const qrCodeDataURL = await QRCode.toDataURL(url, qrOptions);

      logger.info(`QR code generated for URL: ${url}`);
      
      return qrCodeDataURL;
    } catch (error) {
      logger.error('QR code generation error:', error);
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Generate QR code as buffer (for file storage)
   * @param {string} url
   * @param {Object} options
   * @returns {Promise<Buffer>}
   */
  static async generateQRCodeBuffer(url, options = {}) {
    try {
      const defaultOptions = {
        errorCorrectionLevel: 'M',
        type: 'png',
        quality: 0.92,
        margin: 1,
        width: 300
      };

      const qrOptions = { ...defaultOptions, ...options };

      // Generate QR code as buffer
      const buffer = await QRCode.toBuffer(url, qrOptions);

      return buffer;
    } catch (error) {
      logger.error('QR code buffer generation error:', error);
      throw new Error(`Failed to generate QR code buffer: ${error.message}`);
    }
  }

  /**
   * Generate survey QR code URL
   * @param {string} shortCode - Survey short code
   * @returns {string} - Full survey URL
   */
  static getSurveyURL(shortCode) {
    const baseURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseURL}/s/${shortCode}`;
  }

  /**
   * Generate QR code for survey
   * @param {string} shortCode
   * @returns {Promise<string>} - Base64 QR code
   */
  static async generateSurveyQR(shortCode) {
    const surveyURL = this.getSurveyURL(shortCode);
    return await this.generateQRCode(surveyURL);
  }
}

module.exports = QRService;