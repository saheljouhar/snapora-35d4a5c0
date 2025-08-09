
import { useState } from 'react';
import { Camera, Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
}

const PhotoUploadModal = ({ isOpen, onClose, onUpload }: PhotoUploadModalProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      setUploading(false);
      setUploaded(true);
      
      // Show success state then trigger completion
      setTimeout(() => {
        onUpload();
        setUploaded(false);
      }, 1500);
    }, 2000);
  };

  const handleCameraAccess = () => {
    // Create file input for camera
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      handleFileUpload(files);
    };
    input.click();
  };

  const handleGalleryAccess = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      handleFileUpload(files);
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-in-right">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Add Photos</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              style={{ minWidth: '48px', minHeight: '48px' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {uploading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Uploading your photos...</p>
              </div>
            ) : uploaded ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-800 font-medium">Photos uploaded successfully!</p>
                <p className="text-gray-600 text-sm">Thank you for sharing your memories</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 text-center mb-6">
                  Choose how you'd like to add photos
                </p>

                {/* Camera Button */}
                <button
                  onClick={handleCameraAccess}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl p-6 flex items-center justify-center gap-4 transition-all duration-300 hover:scale-105 shadow-lg"
                  style={{ minHeight: '80px' }}
                >
                  <Camera className="w-8 h-8" />
                  <div className="text-left">
                    <div className="font-semibold text-lg">Take Photo</div>
                    <div className="text-sm opacity-90">Use your camera</div>
                  </div>
                </button>

                {/* Gallery Button */}
                <button
                  onClick={handleGalleryAccess}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-2xl p-6 flex items-center justify-center gap-4 transition-all duration-300 hover:scale-105 shadow-lg"
                  style={{ minHeight: '80px' }}
                >
                  <ImageIcon className="w-8 h-8" />
                  <div className="text-left">
                    <div className="font-semibold text-lg">Choose from Library</div>
                    <div className="text-sm opacity-90">Select existing photos</div>
                  </div>
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Photos will be compressed to 1080px width for faster sharing
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoUploadModal;
