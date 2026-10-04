import React from 'react';
import { BookOpen } from 'lucide-react';

export default function Loading({ text = "Loading books..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-8 text-center">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <BookOpen className="w-6 h-6 text-indigo-600 absolute" />
      </div>
      <p className="text-slate-600 font-medium animate-pulse">{text}</p>
    </div>
  );
}
