import { useState } from 'react';
import { FaSpinner, FaTimes, FaUpload } from 'react-icons/fa';
import { uploadImage } from '../../services/upload';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  folder?: string;
  required?: boolean;
  previewClassName?: string;
}

export const ImageUpload = ({
  value,
  onChange,
  label = 'Image',
  folder = 'general',
  required = false,
  previewClassName = 'w-full h-48 object-cover rounded-lg',
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} is not an image file`);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      alert(`${file.name} is too large (${sizeMB}MB). Maximum size is 5MB`);
      return;
    }

    setUploading(true);
    setUploadProgress('Uploading...');

    try {
      const url = await uploadImage(file, 'event-images', folder);
      onChange(url);
      setUploadProgress('Upload complete!');
      setTimeout(() => setUploadProgress(''), 2000);
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
      setUploadProgress('');
    } finally {
      setUploading(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>

      {/* Upload button */}
      <div className="mb-2">
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            className="hidden"
          />
          <div
            className={`flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-md transition-colors ${
              uploading
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                : 'border-indigo-300 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400'
            }`}
          >
            {uploading ? (
              <>
                <FaSpinner className="animate-spin text-indigo-600" />
                <span className="text-sm text-gray-600">{uploadProgress}</span>
              </>
            ) : (
              <>
                <FaUpload className="text-indigo-600" />
                <span className="text-sm text-indigo-600 font-medium">Upload Image</span>
              </>
            )}
          </div>
        </label>
        {uploadProgress && !uploading && (
          <p className="mt-1 text-xs text-green-600">{uploadProgress}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">Max size: 5MB</p>
      </div>

      {/* URL input */}
      <div className="mb-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or enter image URL"
          required={required}
          className="block w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      {/* Preview */}
      {value && (
        <div className="relative mt-2">
          <img
            src={value}
            alt="Preview"
            className={previewClassName}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EInvalid Image%3C/text%3E%3C/svg%3E';
            }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700"
            title="Remove image"
          >
            <FaTimes size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

