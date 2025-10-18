
import React from 'react';

const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10.868 2.884c.321-.772.142-1.68-.43-2.252a1.5 1.5 0 00-2.062.061C7.81 1.258 7.5 2.528 7.5 3.444v1.085c0 .334.134.65.373.888l.058.057a5.002 5.002 0 005.45 5.451l.058.057a1.25 1.25 0 00.888.373h1.085c.916 0 2.186-.31 2.844-.878a1.5 1.5 0 00.06-2.062c-.573-.572-1.48-.75-2.253-.43L10.868 2.884zM10 5a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        <path d="M3.75 6A2.25 2.25 0 001.5 8.25v9A2.25 2.25 0 003.75 19.5h9A2.25 2.25 0 0015 17.25V8.25A2.25 2.25 0 0012.75 6H3.75zM12 8.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V9a.75.75 0 00-.75-.75h-.01zM10.5 8.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V9a.75.75 0 00-.75-.75h-.01zM9 8.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V9a.75.75 0 00-.75-.75h-.01z" />
    </svg>
);

const Header: React.FC = () => {
    return (
        <header className="bg-gradient-to-r from-slate-900 to-slate-700 shadow-lg p-4 sticky top-0 z-10">
            <div className="container mx-auto flex items-center justify-center">
                <BookIcon />
                <h1 className="ml-3 text-2xl font-bold text-white tracking-wide">AI Study Assistant</h1>
            </div>
        </header>
    );
};

export default Header;
