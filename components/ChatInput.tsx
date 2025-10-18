import React, { useRef, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isRecording: boolean;
  onToggleRecording: () => void;
  inputValue: string;
  onInputChange: (value: string) => void;
}

const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm5 10.126V15a1 1 0 11-2 0v-.874A5.968 5.968 0 014 9V7a1 1 0 012 0v2a3.988 3.988 0 003 3.874V15a1 1 0 112 0v-1.126a5.968 5.968 0 014-5.874V7a1 1 0 112 0v2a5.968 5.968 0 01-4 5.874z" clipRule="evenodd" />
    </svg>
);

const StopIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <rect width="8" height="8" x="6" y="6" rx="1" />
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);


const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, isRecording, onToggleRecording, inputValue, onInputChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading && !isRecording) {
      onSendMessage(inputValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 sticky bottom-0"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="relative flex items-center bg-slate-100 dark:bg-slate-900 rounded-full shadow-inner">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Listening..." : "Ask a question, or start recording..."}
            rows={1}
            className="w-full bg-transparent p-4 pl-6 pr-28 text-slate-800 dark:text-slate-200 resize-none focus:outline-none placeholder-slate-400"
            disabled={isLoading || isRecording}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            <button
              type="button"
              onClick={onToggleRecording}
              disabled={isLoading}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              className={`p-2.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                isRecording 
                ? 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 animate-pulse' 
                : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 focus:ring-blue-500'
              }`}
            >
              {isRecording ? <StopIcon /> : <MicIcon />}
            </button>
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim() || isRecording}
              aria-label="Send message"
              className="ml-2 p-2.5 rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            >
              {isLoading ? <LoadingSpinner /> : <SendIcon />}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;