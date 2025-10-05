
import React, { useState, useCallback } from 'react';
import { CopyIcon, CheckIcon, LoadingSpinner } from './icons';

interface PromptOutputProps {
  prompts: string;
  isLoading: boolean;
}

const PromptOutput: React.FC<PromptOutputProps> = ({ prompts, isLoading }) => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      return false;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      setCopied(false);
      return false;
    }
  }, []);

  const handleCopy = () => {
    if (prompts && !isLoading) {
      copy(prompts);
    }
  };
  
  const hasContent = prompts && prompts.trim() !== '';

  return (
    <div className="flex-grow flex flex-col">
      <div className="relative flex-grow bg-slate-800/50 rounded-lg p-4 flex flex-col">
        <h3 className="font-semibold mb-2 text-slate-200">Generated Result:</h3>
        <div className="relative flex-grow">
          <textarea
            readOnly
            value={isLoading ? "" : prompts}
            placeholder="Upload image(s) and set the mode to generate AI prompts."
            className="w-full h-full p-3 bg-slate-900/70 border border-slate-700 rounded-md resize-none text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-300 min-h-[150px]"
          />
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 rounded-md">
                <LoadingSpinner className="w-8 h-8 text-teal-400" />
                <p className="mt-4 text-slate-300">Generating prompts...</p>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={handleCopy}
        disabled={!hasContent || isLoading}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
      >
        {copied ? (
            <>
                <CheckIcon className="w-5 h-5"/> Copied!
            </>
        ) : (
            <>
                <CopyIcon className="w-5 h-5" /> Copy All Prompts
            </>
        )}
      </button>
    </div>
  );
};

export default PromptOutput;
