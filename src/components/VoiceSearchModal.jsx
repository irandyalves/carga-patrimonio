import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, Volume2, Search } from 'lucide-react';
import { startVoiceRecognition, isSpeechRecognitionSupported } from '../services/speechRecognition';

export const VoiceSearchModal = ({ isOpen, onClose, onSearch }) => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setErrorMessage('');
      handleStartListening();
    } else {
      handleStopListening();
    }

    return () => {
      handleStopListening();
    };
  }, [isOpen]);

  const handleStartListening = () => {
    if (!isSpeechRecognitionSupported()) {
      setErrorMessage('O reconhecimento de voz não é suportado pelo seu navegador.');
      return;
    }

    setErrorMessage('');
    setIsListening(true);

    const instance = startVoiceRecognition({
      onResult: ({ transcript: text, isFinal }) => {
        setTranscript(text);
        if (isFinal && text.trim()) {
          setTimeout(() => {
            onSearch(text.trim());
            onClose();
          }, 600);
        }
      },
      onError: (err) => {
        setIsListening(false);
        if (err === 'not-allowed') {
          setErrorMessage('Permissão do microfone negada. Por favor, autorize no navegador.');
        } else {
          setErrorMessage(`Erro ao capturar áudio: ${err}`);
        }
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    setRecognitionInstance(instance);
  };

  const handleStopListening = () => {
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch (e) {
        // ignore
      }
      setRecognitionInstance(null);
    }
    setIsListening(false);
  };

  const handleApplyVoiceText = () => {
    if (transcript.trim()) {
      onSearch(transcript.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Busca por Voz Inteligente</span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">
          {isListening ? 'Estou ouvindo... Fale agora' : 'Microfone Pausado'}
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Fale o número do patrimônio (ex: <em>"1002"</em>) ou a descrição (ex: <em>"Notebook Dell"</em>)
        </p>

        {/* Microphone Animated Visualizer */}
        <div className="flex justify-center my-6">
          <div className="relative">
            {isListening && (
              <>
                <div className="absolute -inset-4 rounded-full bg-indigo-500/20 animate-ping" />
                <div className="absolute -inset-8 rounded-full bg-blue-500/10 animate-pulse" />
              </>
            )}

            <button
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-xl shadow-indigo-500/40 scale-105'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {isListening ? (
                <Mic className="w-10 h-10 animate-pulse" />
              ) : (
                <MicOff className="w-10 h-10" />
              )}
            </button>
          </div>
        </div>

        {/* Transcript Box */}
        <div className="min-h-[60px] bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 mb-4 flex items-center justify-center">
          {transcript ? (
            <span className="text-base font-medium text-white tracking-wide">
              "{transcript}"
            </span>
          ) : (
            <span className="text-xs text-slate-500 italic">
              {isListening ? 'Aguardando sua fala em português...' : 'Clique no microfone para falar novamente'}
            </span>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/40 rounded-xl p-2.5 mb-4">
            {errorMessage}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {transcript && (
            <button
              onClick={handleApplyVoiceText}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Pesquisar "{transcript}"</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancelar
          </button>
        </div>

      </div>
    </div>
  );
};
