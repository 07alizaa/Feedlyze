// src/components/surveys/QRCodeModal.jsx
import { useState } from 'react';
import { QRCodeSVG } from 'react-qr-code';
import {
  Download,
  Copy,
  Printer,
  ExternalLink,
  X,
  Check,
} from 'lucide-react';
import { Button, Modal } from '../common';
import toast from 'react-hot-toast';

const QRCodeModal = ({ survey, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
  const publicUrl = `${baseUrl}/s/${survey.short_code}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);    } catch (_error) {
      toast.error('Failed to copy link');
    }
  };

  const handleDownloadPNG = () => {
    const svg = document.getElementById('survey-qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = 300;
    canvas.height = 300;
    
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, 300, 300);
      
      const link = document.createElement('a');
      link.download = `${survey.title.replace(/\s+/g, '_')}_QR.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('QR code downloaded!');
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleDownloadSVG = () => {
    const svg = document.getElementById('survey-qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = `${survey.title.replace(/\s+/g, '_')}_QR.svg`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('SVG downloaded!');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const svg = document.getElementById('survey-qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    
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
            }
            .qr-container {
              text-align: center;
              padding: 40px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 20px;
              color: #1F2937;
            }
            .url {
              font-size: 14px;
              color: #6B7280;
              margin-top: 20px;
            }
            .instructions {
              font-size: 12px;
              color: #9CA3AF;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>${survey.title}</h1>
            ${svgData}
            <p class="url">${publicUrl}</p>
            <p class="instructions">Scan this QR code to share your feedback</p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const handleOpenSurvey = () => {
    window.open(publicUrl, '_blank');
  };

  return (
    <Modal open={true} onClose={onClose} size="md">
      <div className="text-center">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-dark-900">Survey QR Code</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-light-100 text-dark-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="bg-white p-6 rounded-2xl border border-light-200 inline-block mb-4">
          <QRCodeSVG
            id="survey-qr-code"
            value={publicUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* Survey Info */}
        <h3 className="font-semibold text-dark-900 mb-1">{survey.title}</h3>
        <p className="text-sm text-dark-500 mb-4">{publicUrl}</p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            variant="secondary"
            icon={Download}
            onClick={handleDownloadPNG}
          >
            Download PNG
          </Button>
          <Button
            variant="secondary"
            icon={Download}
            onClick={handleDownloadSVG}
          >
            Download SVG
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
            icon={Printer}
            onClick={handlePrint}
          >
            Print
          </Button>
        </div>

        {/* Open Survey Link */}
        <Button
          variant="primary"
          icon={ExternalLink}
          onClick={handleOpenSurvey}
          className="w-full"
        >
          Open Survey
        </Button>

        {/* Tip */}
        <div className="mt-6 p-4 bg-primary-50 rounded-xl">
          <p className="text-sm text-primary-700">
            💡 <strong>Tip:</strong> Place this QR code on receipts, tables, or promotional 
            materials for easy customer access.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default QRCodeModal;
