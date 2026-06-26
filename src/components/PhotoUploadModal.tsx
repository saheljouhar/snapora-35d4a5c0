import { useState, useEffect } from 'react';
import { Camera, Upload, X, Image as ImageIcon, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import heic2any from 'heic2any';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const SUPABASE_URL = 'https://dydzqautscblrrcvlreh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5ZHpxYXV0c2NibHJyY3ZscmVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NTUyMTEsImV4cCI6MjA3MDMzMTIxMX0.ammrjtunik84JOH9pWwy9G0pOfU1aRLyp0SEHpvHZPc';

// Upload a file with XHR so we can track progress.
function uploadWithProgress(
  filePath: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${SUPABASE_URL}/storage/v1/object/event_photos/${filePath}`;
    xhr.open('POST', url, true);
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY);
    xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.setRequestHeader('Cache-Control', '3600');
    if (file.type) xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        let message = `Upload failed (${xhr.status})`;
        try {
          const parsed = JSON.parse(xhr.responseText);
          message = parsed.message || parsed.error || message;
        } catch {}
        const err: any = new Error(message);
        err.status = xhr.status;
        reject(err);
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(file);
  });
}

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: () => void;
  eventId?: string | null;
}

const PhotoUploadModal = ({ isOpen, onClose, onUpload, eventId }: PhotoUploadModalProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[] | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [converting, setConverting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!carouselApi) return;
    setCurrentSlide(carouselApi.selectedScrollSnap());
    const onSelect = () => setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on('select', onSelect);
    carouselApi.on('reInit', onSelect);
    return () => {
      carouselApi.off('select', onSelect);
      carouselApi.off('reInit', onSelect);
    };
  }, [carouselApi]);

  if (!isOpen) return null;

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Validate file types — accept by MIME OR by extension
    const invalidType = Array.from(files).find((f) => {
      const type = (f.type || '').toLowerCase();
      const name = (f.name || '').toLowerCase();
      const extMatch = name.match(/\.([a-z0-9]+)$/);
      const ext = extMatch ? extMatch[1] : '';
      return !ALLOWED_IMAGE_TYPES.includes(type) && !ALLOWED_EXTS.includes(ext);
    });
    if (invalidType) {
      toast({
        title: "Unsupported file",
        description: "Only JPG, JPEG, PNG, WEBP, HEIC, or HEIF photos are allowed.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (50MB)
    const tooLarge = Array.from(files).find((f) => f.size > MAX_FILE_SIZE);
    if (tooLarge) {
      toast({
        title: "Photo too large",
        description: "Photo too large. Please contact the event organiser.",
        variant: "destructive",
      });
      return;
    }

    // Detect and convert HEIC/HEIF files
    const fileArray = Array.from(files);
    const hasHeic = fileArray.some((f) => {
      const name = (f.name || '').toLowerCase();
      const type = (f.type || '').toLowerCase();
      return type === 'image/heic' || type === 'image/heif' ||
        name.endsWith('.heic') || name.endsWith('.heif');
    });

    let processed: File[] = fileArray;
    if (hasHeic) {
      setConverting(true);
      try {
        processed = await Promise.all(
          fileArray.map(async (file) => {
            const name = (file.name || '').toLowerCase();
            const type = (file.type || '').toLowerCase();
            const isHeic = type === 'image/heic' || type === 'image/heif' ||
              name.endsWith('.heic') || name.endsWith('.heif');
            if (!isHeic) return file;
            const result = await heic2any({ blob: file, toType: 'image/jpeg', quality: 1 });
            const blob = Array.isArray(result) ? result[0] : result;
            const newName = file.name.replace(/\.(heic|heif)$/i, '.jpg') || `photo_${Date.now()}.jpg`;
            return new File([blob], newName, { type: 'image/jpeg' });
          })
        );
      } catch (err: any) {
        console.error('HEIC conversion failed:', err);
        setConverting(false);
        toast({
          title: "Conversion failed",
          description: "Could not convert HEIC photo. Please try a different photo.",
          variant: "destructive",
        });
        return;
      }
      setConverting(false);
    }

    setSelectedFiles(processed);
    const previewUrls = processed.map((f) => URL.createObjectURL(f));
    setPreviewImages(previewUrls);
  };


  const handleConfirmUpload = async () => {
    if (!selectedFiles || !eventId) {
      toast({
        title: "Error",
        description: "No event ID found. Please make sure you're accessing a valid event link.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const files = selectedFiles;
    const totalFiles = files.length;

    try {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const timestamp = Date.now();
        const baseName = (file.name.split('.').slice(0, -1).join('.') || 'photo')
          .replace(/[^a-zA-Z0-9_-]/g, '_');
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
        const fileName = `${timestamp}_${index}_${baseName}.${ext}`;
        const filePath = `${eventId}/${fileName}`;

        await uploadWithProgress(filePath, file, (pct) => {
          const overall = Math.round(((index + pct / 100) / totalFiles) * 100);
          setUploadProgress(overall);
        });

        const { data: { publicUrl } } = supabase.storage
          .from('event_photos')
          .getPublicUrl(filePath);

        const deviceInfo = navigator.userAgent.includes('Mobile')
          ? 'Mobile Device'
          : 'Desktop';

        const { error: dbError } = await supabase
          .from('event_photos')
          .insert({
            event_id: eventId,
            photo_url: publicUrl,
            thumbnail_url: publicUrl,
            device_info: deviceInfo,
          });

        if (dbError) {
          console.error('Database insert error:', dbError);
          throw dbError;
        }
      }

      setUploadProgress(100);
      setUploading(false);
      setUploaded(true);

      previewImages.forEach((url) => URL.revokeObjectURL(url));

      toast({
        title: "Success!",
        description: "Photo uploaded successfully!",
      });

      setTimeout(() => {
        onUpload();
        setUploaded(false);
        setPreviewImages([]);
        setSelectedFiles(null);
        setUploadProgress(0);
      }, 1500);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploading(false);
      setUploadProgress(0);

      const msg: string = error?.message || '';
      const status: number | undefined = error?.status;
      const isSizeIssue =
        status === 413 ||
        /payload too large|exceeded|maximum allowed size|too large/i.test(msg);

      toast({
        title: "Upload failed",
        description: isSizeIssue
          ? "Photo too large. Please contact the event organiser."
          : msg || "Upload failed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReupload = () => {
    previewImages.forEach(url => URL.revokeObjectURL(url));
    setPreviewImages([]);
    setSelectedFiles(null);
  };

  const handleCameraAccess = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.heic,.heif';
    input.capture = 'environment';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      handleFileUpload(files);
    };
    input.click();
  };

  const handleGalleryAccess = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      handleFileUpload(files);
    };
    input.click();
  };

  const handleClose = () => {
    previewImages.forEach(url => URL.revokeObjectURL(url));
    setPreviewImages([]);
    setSelectedFiles(null);
    setUploading(false);
    setUploaded(false);
    setUploadProgress(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl animate-slide-in-right">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Add Photos</h2>
            <button
              onClick={handleClose}
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
                <p className="text-gray-600 mb-4">Uploading your photos...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-500 mt-2">{uploadProgress}%</p>
              </div>
            ) : uploaded ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-800 font-medium">Photo uploaded successfully!</p>
                <p className="text-gray-600 text-sm">Thank you for sharing your memories</p>
              </div>
            ) : previewImages.length > 0 ? (
              <div className="space-y-4">
                <p className="text-gray-600 text-center mb-4">
                  Preview your photo{previewImages.length > 1 ? 's' : ''} ({previewImages.length})
                </p>
                
                {/* Image Carousel */}
                <div className="relative">
                  <Carousel className="w-full" setApi={setCarouselApi} opts={{ loop: false }}>
                    <CarouselContent>
                      {previewImages.map((imageUrl, index) => (
                        <CarouselItem key={index}>
                          <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
                            <img
                              src={imageUrl}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-64 object-cover"
                              draggable={false}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {previewImages.length > 1 && (
                      <>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                      </>
                    )}
                  </Carousel>
                  
                  {previewImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm pointer-events-none">
                      {currentSlide + 1} / {previewImages.length}
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleReupload}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl p-4 flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span className="font-medium">Reupload</span>
                  </button>
                  
                  <button
                    onClick={handleConfirmUpload}
                    className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl p-4 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
                  >
                    <Check className="w-5 h-5" />
                    <span className="font-medium">Confirm</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 text-center mb-6">
                  Choose how you'd like to add photos
                </p>

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
                  Photos upload at full quality. Max file size: 50MB
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
