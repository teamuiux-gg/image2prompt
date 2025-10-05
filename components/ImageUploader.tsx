
import React, { useCallback, useState } from 'react';
import { UploadIcon, XCircleIcon } from './icons';
import { UploadedFile } from '../types';

interface ImageUploaderProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ files, onFilesChange, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((incomingFiles: FileList | null) => {
    if (!incomingFiles) return;
    const newFiles: UploadedFile[] = Array.from(incomingFiles)
      .filter(file => file.type.startsWith('image/'))
      .map(file => ({
        file,
        preview: URL.createObjectURL(file),
      }));
    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange]);

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDragging(true);
  }, [isLoading]);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (!isLoading) handleFiles(e.dataTransfer.files);
  }, [handleFiles, isLoading]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };
  
  const removeFile = (indexToRemove: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    URL.revokeObjectURL(files[indexToRemove].preview);
    onFilesChange(updatedFiles);
  };

  return (
    <div
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`relative flex-grow flex flex-col justify-center items-center border-2 border-dashed rounded-lg p-6 transition-colors duration-300 min-h-[250px] ${isDragging ? 'border-teal-400 bg-slate-800' : 'border-slate-600 bg-slate-800/50'}`}
    >
      <input
        type="file"
        multiple
        accept="image/jpeg, image/png"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        onChange={onFileChange}
        disabled={isLoading}
      />
      {files.length === 0 ? (
        <div className="text-center text-slate-400 pointer-events-none">
          <UploadIcon className="mx-auto h-12 w-12 text-slate-500 mb-4" />
          <p className="font-semibold text-slate-300">Click or Drag to Upload (Multiple Files)</p>
          <p className="text-sm">JPG or PNG (Max 20MB each)</p>
        </div>
      ) : (
        <div className="w-full h-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto p-1">
          {files.map((uploadedFile, index) => (
            <div key={`${uploadedFile.file.name}-${index}`} className="relative aspect-square group">
              <img
                src={uploadedFile.preview}
                alt={`preview ${index}`}
                className="w-full h-full object-cover rounded-md"
              />
              <button
                onClick={() => removeFile(index)}
                disabled={isLoading}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                aria-label="Remove image"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
