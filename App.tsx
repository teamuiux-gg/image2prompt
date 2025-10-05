
import React, { useState, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import PromptOutput from './components/PromptOutput';
import ThemeToggle from './components/ThemeToggle';
import { DotsIcon, ExpandIcon, SparklesIcon } from './components/icons';
import { PromptMode, UploadedFile } from './types';
import { generatePrompts } from './services/geminiService';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'dark';
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [promptMode, setPromptMode] = useState<PromptMode>(PromptMode.Separate);
  const [generatedPrompts, setGeneratedPrompts] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const handleThemeSet = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
  };
  
  const handleGenerateClick = async () => {
      if(uploadedFiles.length === 0) return;
      setIsLoading(true);
      setError(null);
      setGeneratedPrompts('');
      
      try {
        const result = await generatePrompts(uploadedFiles, promptMode);
        setGeneratedPrompts(result);
        if (result.startsWith("An error occurred")) {
            setError(result);
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        setError(errorMessage);
        setGeneratedPrompts(`Error: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
  };

  const PromptModeToggleSwitch = () => (
    <div className="bg-slate-800/50 p-3 rounded-lg flex items-center justify-between mb-4">
      <span className="text-sm font-medium text-slate-300">Prompt Mode:</span>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-medium transition-colors ${promptMode === PromptMode.Unified ? 'text-slate-400' : 'text-teal-400'}`}>Unified Prompt</span>
        <button
          onClick={() => setPromptMode(prev => prev === PromptMode.Unified ? PromptMode.Separate : PromptMode.Unified)}
          disabled={isLoading}
          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors disabled:opacity-50 ${promptMode === PromptMode.Separate ? 'bg-teal-500' : 'bg-slate-600'}`}
        >
          <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${promptMode === PromptMode.Separate ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
        <span className={`text-sm font-medium transition-colors ${promptMode === PromptMode.Separate ? 'text-teal-400' : 'text-slate-400'}`}>Separate Prompts</span>
      </div>
    </div>
  );
  
  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-7xl mx-auto bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-2xl shadow-black/20 p-6 sm:p-8 md:p-10 border border-slate-700/50">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-sky-400">
            AI Image to Prompt Generator
          </h1>
          <ThemeToggle theme={theme} setTheme={handleThemeSet} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column */}
          <div className="flex flex-col">
              <h2 className="text-xl font-bold mb-4 text-slate-100">1. Upload Images</h2>
              <div className="flex-grow">
                 <ImageUploader files={uploadedFiles} onFilesChange={setUploadedFiles} isLoading={isLoading} />
              </div>
              <button 
                onClick={handleGenerateClick}
                disabled={uploadedFiles.length === 0 || isLoading}
                className="mt-4 w-full bg-teal-600 hover:bg-teal-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                {isLoading ? 'Generating...' : 'Generate Prompt'}
              </button>
          </div>

          {/* Right Column */}
           <div className="flex flex-col">
              <h2 className="text-xl font-bold mb-4 text-slate-100">2. Generation Settings & Output</h2>
              <PromptModeToggleSwitch />
              <PromptOutput prompts={generatedPrompts} isLoading={isLoading} />
           </div>
        </div>

        <footer className="text-center mt-8 text-sm text-slate-500">
          powered by genkitez
        </footer>
      </main>

       {/* Floating Action Buttons */}
       <div className="fixed bottom-6 right-6 flex flex-col items-center gap-2 bg-slate-800/80 backdrop-blur-sm p-2 rounded-full border border-slate-700">
            <button className="p-2 text-slate-400 hover:text-teal-300 transition-colors"><DotsIcon className="w-5 h-5"/></button>
            <button className="p-2 text-slate-400 hover:text-teal-300 transition-colors"><SparklesIcon className="w-5 h-5"/></button>
            <button className="p-2 text-slate-400 hover:text-teal-300 transition-colors"><ExpandIcon className="w-5 h-5"/></button>
       </div>
    </div>
  );
};

export default App;
