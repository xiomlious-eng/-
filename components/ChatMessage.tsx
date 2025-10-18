
import React from 'react';
import { type ChatMessage, type Role } from '../types';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatMessageProps {
  message: ChatMessage;
}

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const ModelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message }) => {
  const { role, content } = message;
  const isUser = role === 'user';

  const wrapperClasses = `flex items-start gap-4 my-4 ${isUser ? 'justify-end' : ''}`;
  const bubbleClasses = `w-full max-w-2xl p-4 rounded-xl shadow-md ${
    isUser
      ? 'bg-blue-500 text-white rounded-br-none'
      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
  }`;
  
  const Icon = isUser ? UserIcon : ModelIcon;

  return (
    <div className={wrapperClasses}>
      {!isUser && <div className="flex-shrink-0 mt-1"><Icon /></div>}
      <div className={bubbleClasses}>
        {isUser ? <p>{content}</p> : <MarkdownRenderer content={content} />}
      </div>
      {isUser && <div className="flex-shrink-0 mt-1"><Icon /></div>}
    </div>
  );
};

export default ChatMessageComponent;
