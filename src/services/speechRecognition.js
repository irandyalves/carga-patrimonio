// Web Speech API wrapper for voice searching in Portuguese (pt-BR)

export const isSpeechRecognitionSupported = () => {
  return typeof window !== 'undefined' && (
    'SpeechRecognition' in window || 
    'webkitSpeechRecognition' in window
  );
};

export const startVoiceRecognition = ({ onResult, onEnd, onError }) => {
  if (!isSpeechRecognitionSupported()) {
    onError && onError('Reconhecimento de voz não é suportado pelo seu navegador.');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = 'pt-BR';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    onResult && onResult({
      transcript: finalTranscript || interimTranscript,
      isFinal: !!finalTranscript
    });
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    onError && onError(event.error);
  };

  recognition.onend = () => {
    onEnd && onEnd();
  };

  recognition.start();
  return recognition;
};
