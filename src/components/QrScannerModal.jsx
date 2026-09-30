import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, X, Camera, AlertCircle, RefreshCw } from 'lucide-react';

export const QrScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [scanError, setScanError] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const scannerRef = useRef(null);
  const containerId = 'qr-reader-video-container';

  // Synthetic beep sound via Web Audio API on successful scan
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn('Audio feedback error:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setScanError('');
      setIsInitializing(true);

      const timer = setTimeout(() => {
        startScanner();
      }, 300);

      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen]);

  const startScanner = async () => {
    try {
      if (scannerRef.current) {
        await stopScanner();
      }

      const html5QrCode = new Html5Qrcode(containerId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' }, // back camera on mobile
        config,
        (decodedText) => {
          // Play beep
          playBeep();

          // Clean decoded text (strip 'PAT:' or 'PATRIMONIO:' prefix if present)
          let cleanCode = decodedText.replace(/^(PAT:|PATRIMONIO:)/i, '').split('|')[0].trim();
          
          stopScanner().then(() => {
            onScanSuccess(cleanCode);
            onClose();
          });
        },
        (errorMessage) => {
          // scanning frames (ignorable)
        }
      );

      setIsInitializing(false);
    } catch (err) {
      console.error('QR Scanner start error:', err);
      setIsInitializing(false);
      setScanError('Não foi possível acessar a câmera. Certifique-se de dar permissão ao navegador.');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Leitor de Câmera</h3>
              <p className="text-[11px] text-slate-400">Aponte para o QR Code ou Código de Barras</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Viewport Container */}
        <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center min-h-[300px]">
          
          <div id={containerId} className="w-full h-full" />

          {/* Loading indicator */}
          {isInitializing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-300 gap-2">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
              <span className="text-xs">Iniciando câmera...</span>
            </div>
          )}

          {/* Reticle Guide */}
          {!isInitializing && !scanError && (
            <div className="absolute pointer-events-none inset-0 flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-dashed border-cyan-400/70 rounded-2xl animate-pulse flex items-center justify-center">
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute shadow-sm shadow-cyan-400" />
              </div>
            </div>
          )}

        </div>

        {/* Error message */}
        {scanError && (
          <div className="mt-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/40 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{scanError}</span>
          </div>
        )}

        {/* Tips Footer */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Camera className="w-3.5 h-3.5 text-blue-400" />
            Suporta QR Code & Código de Barras
          </span>
          <button
            onClick={startScanner}
            className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Reiniciar
          </button>
        </div>

      </div>
    </div>
  );
};
