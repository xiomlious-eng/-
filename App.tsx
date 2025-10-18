import React, { useState, useRef, useEffect } from 'react';
// FIX: Import `Modality` as a value and other items as types to fix type error.
import { Modality, type Chat, type GoogleGenAI, type LiveSession, type LiveServerMessage, type Blob } from '@google/genai';
import { startChatSession, getGoogleAI } from './services/geminiService';
import { type ChatMessage } from './types';
import Header from './components/Header';
import ChatMessageComponent from './components/ChatMessage';
import ChatInput from './components/ChatInput';

// Helper functions for audio processing
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [chatInput, setChatInput] = useState('');
  
  const chatSessionRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const liveSessionRef = useRef<LiveSession | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);


  useEffect(() => {
    aiRef.current = getGoogleAI();
    chatSessionRef.current = startChatSession();
    if (!chatSessionRef.current) {
        setError("Failed to initialize the AI chat session. Please check your API key and refresh the page.");
    }
    setChatHistory([{
        role: 'model',
        content: "Hello! I'm Cognita, your personal AI study assistant. How can I help you today? You can ask me to explain concepts, summarize articles, or test your knowledge."
    }]);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSendMessage = async (message: string) => {
    if (!chatSessionRef.current || !message.trim()) {
        if (!message.trim()) setChatInput('');
        return;
    }

    setIsLoading(true);
    setError(null);
    setChatInput('');
    const userMessage: ChatMessage = { role: 'user', content: message };
    
    setChatHistory(prev => [...prev, userMessage, { role: 'model', content: '' }]);

    try {
      const stream = await chatSessionRef.current.sendMessageStream({ message });
      let streamedText = '';

      for await (const chunk of stream) {
        streamedText += chunk.text;
        setChatHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = { role: 'model', content: streamedText };
            return newHistory;
        });
      }
    } catch (err) {
      console.error(err);
      const errorMessage = "Sorry, I encountered an error. Please try again.";
      setError(errorMessage);
       setChatHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = { role: 'model', content: errorMessage };
            return newHistory;
        });
    } finally {
      setIsLoading(false);
    }
  };
  
  const stopRecording = async () => {
    if (!isRecording) return;
    setIsRecording(false);

    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
        audioContextRef.current = null;
    }
    if (liveSessionRef.current) {
        liveSessionRef.current.close();
        liveSessionRef.current = null;
    }
    
    if (chatInput.trim()) {
        handleSendMessage(chatInput.trim());
    }
  };

  const startRecording = async () => {
    if (!aiRef.current) {
        setError("AI service not initialized.");
        return;
    }
    setIsRecording(true);
    setError(null);
    setChatInput('');
    let accumulatedTranscript = '';
    
    try {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const sessionPromise = aiRef.current.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => { console.debug('Live session opened.'); },
                onmessage: (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        accumulatedTranscript += text;
                        setChatInput(accumulatedTranscript);
                    }
                    if (message.serverContent?.turnComplete) {
                        stopRecording();
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    setError("Voice recognition error. Please try again.");
                    stopRecording();
                },
                onclose: (e: CloseEvent) => {
                    console.debug('Live session closed.');
                    // Handles manual stop before turnComplete
                    if (isRecording) {
                        stopRecording();
                    }
                },
            },
            config: {
                inputAudioTranscription: {},
                responseModalities: [Modality.AUDIO], // Required for live session
            },
        });

        liveSessionRef.current = await sessionPromise;

        // FIX: Cast window to `any` to allow for `webkitAudioContext` for Safari compatibility.
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        sourceRef.current = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
        scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
        
        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            // FIX: Per @google/genai guidelines, use the session promise to send data to avoid stale closures.
            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
        };
        
        sourceRef.current.connect(scriptProcessorRef.current);
        scriptProcessorRef.current.connect(audioContextRef.current.destination);

    } catch (err) {
        console.error("Failed to start recording:", err);
        setError("Could not access microphone. Please check permissions and try again.");
        setIsRecording(false);
    }
  };

  const handleToggleRecording = () => {
      if (isRecording) {
          stopRecording();
      } else {
          startRecording();
      }
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-slate-50 dark:bg-slate-900">
      <Header />
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl">
          {chatHistory.map((msg, index) => (
            <ChatMessageComponent key={index} message={msg} />
          ))}
          {isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length -1].role === 'model' && (
             <div className="flex justify-start">
                 <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md ml-10">
                     <div className="flex items-center space-x-2 text-slate-500">
                         <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></div>
                         <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></div>
                         <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></div>
                     </div>
                 </div>
             </div>
          )}
          {error && <div className="text-red-500 text-center my-4 p-2 bg-red-100 dark:bg-red-900/50 rounded-md">{error}</div>}
        </div>
      </main>
      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading} 
        isRecording={isRecording}
        onToggleRecording={handleToggleRecording}
        inputValue={chatInput}
        onInputChange={setChatInput}
      />
    </div>
  );
};

export default App;
