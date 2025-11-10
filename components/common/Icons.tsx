import React from 'react';

// A simple faucet icon component
export const FaucetIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-green-500"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.092 1.21-.138 2.43-.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7zM12 21v-6m0 0l-3.03-3.03m3.03 3.03L15.03 9" />
    </svg>
);

// A simple bottle icon component with a corrected path
export const BottleIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6 text-blue-500"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.25 2.25h3.5a1.5 1.5 0 011.5 1.5v1.5h-6.5V3.75a1.5 1.5 0 011.5-1.5zM8.25 6h7.5a1.5 1.5 0 011.5 1.5v9.75a1.5 1.5 0 01-1.5 1.5h-7.5a1.5 1.5 0 01-1.5-1.5V7.5A1.5 1.5 0 018.25 6z" />
    </svg>
);
