// src/components/surveys/QRCodeModal.jsx
// Displays backend-generated QR code as a read-only survey distribution asset
import { useState } from 'react';
import {
  Download,
  Copy,
  Printer,
  ExternalLink,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button, Modal, Spinner } from '../common';
import toast from 'react-hot-toast';

/**
 * QRCodeModal - Displays the backend-generated QR code for survey distribution
 * 
 * Backend provides:
 * - survey.qr_code_url: Base64 data URL or image URL
 * - survey.short_code: Unique survey identifier
 * - survey.public_url: Full URL for survey access (optional, can be derived)
 * 
 * This component does NOT generate QR codes - it only displays backend-provided ones.
 */
const QRCodeModal = ({ survey, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // DEBUG: Log what the backend is sending
  console.log('QRCodeModal - Survey data received:', {
    id: survey.id,
    title: survey.title,
    short_code: survey.short_code,
    qr_code_url: survey.qr_code_url,
    qr_code: survey.qr_code,
    public_url: survey.public_url,
    hasQrCode: !!(survey.qr_code_url || survey.qr_code)
  });

  // Use backend-provided public_url or construct from short_code
  const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
  const publicUrl = survey.public_url || `${baseUrl}/s/${survey.short_code}`;

  // Get QR code image source from backend
  const qrCodeSrc = survey.qr_code_url || survey.qr_code;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      toast.error('Failed to copy link');
    }
  };

  const handleDownloadPNG = () => {
    if (!qrCodeSrc) {
      toast.error('QR code not available');
      return;
    }

    const link = document.createElement('a');
    link.download = `feedlyze-survey-${survey.short_code}.png`;
    
    // If it's already a base64 data URL, use it directly
    if (qrCodeSrc.startsWith('data:')) {
      link.href = qrCodeSrc;
      link.click();
      toast.success('QR code downloaded!');
    } else {
      // If it's an external URL, fetch and convert to blob
      fetch(qrCodeSrc)
        .then(response => response.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('QR code downloaded!');
        })
        .catch(() => {
          toast.error('Failed to download QR code');
        });
    }
  };

  const handlePrint = () => {
    if (!qrCodeSrc) {
      toast.error('QR code not available');
      return;
    }

    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${survey.title} - QR Code</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
              background: white;
            }
            .qr-container {
              text-align: center;
              padding: 40px;
              background: white;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 20px;
              color: #1F2937;
            }
            .qr-image {
              width: 300px;
              height: 300px;
              margin: 20px auto;
            }
            .url {
              font-size: 14px;
              color: #6B7280;
              margin-top: 20px;
              word-break: break-all;
            }
            .instructions {
              font-size: 12px;
              color: #9CA3AF;
              margin-top: 10px;
            }
            .branding {
              font-size: 10px;
              color: #9CA3AF;
              margin-top: 30px;
            }
            @media print {
              body { background: white; }
              .qr-container { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>${survey.title}</h1>
            <img src="${qrCodeSrc}" alt="Survey QR Code" class="qr-image" />
            <p class="url">${publicUrl}</p>
            <p class="instructions">Scan this QR code to share your feedback</p>
            <p class="branding">Powered by Feedlyze</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for image to load before printing
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleOpenSurvey = () => {
    window.open(publicUrl, '_blank');
  };

  return (
    <Modal open={true} onClose={onClose} size="md" showCloseButton={false}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-dark-900">Survey QR Code</h2>
            <p className="text-sm text-dark-500 mt-1">Distribution & Sharing</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-light-100 text-dark-500 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Display */}
        <div className="text-center">
          <div className="bg-white p-6 rounded-2xl border border-light-200 inline-block mb-4 relative">
            {/* Loading state */}
            {!imageLoaded && !imageError && qrCodeSrc && (
              <div className="absolute inset-0 flex items-center justify-center bg-white rounded-2xl">
                <Spinner size="lg" />
              </div>
            )}
            
            {/* Error state */}
            {imageError && (
              <div className="flex flex-col items-center justify-center w-[200px] h-[200px] text-dark-400">
                <AlertCircle className="w-12 h-12 mb-2" />
                <p className="text-sm">QR code unavailable</p>
              </div>
            )}
            
            {/* No QR code available */}
            {!qrCodeSrc && !imageError && (
              <div className="flex flex-col items-center justify-center w-[200px] h-[200px] text-dark-400">
                <AlertCircle className="w-12 h-12 mb-2" />
                <p className="text-sm">QR code not generated</p>
              </div>
            )}
            
            {/* QR Code Image from Backend */}
            {qrCodeSrc && !imageError && (
              <img
                id="survey-qr-code"
                src={qrCodeSrc}
                alt={`QR Code for ${survey.title}`}
                className={`w-[200px] h-[200px] ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  setImageError(true);
                  setImageLoaded(false);
                }}
              />
            )}
          </div>

          {/* Survey Info */}
          <h3 className="font-semibold text-dark-900 mb-1">{survey.title}</h3>
          <p className="text-sm text-dark-500 mb-1 font-mono bg-light-50 px-3 py-1 rounded-lg inline-block">
            {publicUrl}
          </p>
          <p className="text-xs text-dark-400 mb-4">
            Short code: <span className="font-mono font-medium">{survey.short_code}</span>
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              variant="secondary"
              icon={Download}
              onClick={handleDownloadPNG}
              disabled={!qrCodeSrc || imageError}
            >
              Download PNG
            </Button>
            <Button
              variant="secondary"
              icon={Printer}
              onClick={handlePrint}
              disabled={!qrCodeSrc || imageError}
            >
              Print
            </Button>
            <Button
              variant="secondary"
              icon={copied ? Check : Copy}
              onClick={handleCopyLink}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button
              variant="secondary"
              icon={ExternalLink}
              onClick={handleOpenSurvey}
            >
              Preview
            </Button>
          </div>

          {/* Open Survey CTA */}
          <Button
            variant="primary"
            icon={ExternalLink}
            onClick={handleOpenSurvey}
            className="w-full"
          >
            Open Public Survey
          </Button>

          {/* Tip */}
          <div className="mt-6 p-4 bg-primary-50 rounded-xl text-left">
            <p className="text-sm text-primary-700">
              💡 <strong>Tip:</strong> Place this QR code on receipts, tables, or promotional 
              materials for easy customer access. The QR code links directly to your survey.
            </p>
          </div>

          {/* Distribution Stats (if available) */}
          {survey.response_count !== undefined && (
            <div className="mt-4 p-3 bg-light-50 rounded-lg">
              <p className="text-xs text-dark-500">
                <span className="font-semibold text-dark-700">{survey.response_count}</span> responses collected via this survey
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default QRCodeModal;
