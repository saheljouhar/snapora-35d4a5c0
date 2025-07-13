
import { useState } from 'react';
import { Camera, Heart, Users, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PhotoUploadModal from '@/components/PhotoUploadModal';
import BusinessCard from '@/components/BusinessCard';
import PhotoGrid from '@/components/PhotoGrid';
import { Link } from 'react-router-dom';

const Index = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCount, setUploadCount] = useState(127); // Demo count

  const handlePhotoUpload = () => {
    setUploadCount(prev => prev + 1);
    setShowUploadModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header */}
      <header className="relative h-screen flex flex-col items-center justify-center px-4 text-center overflow-hidden">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-pink-100/30 to-white/50" />
        
        <div className="relative z-10 max-w-md mx-auto animate-fade-in">
          <div className="mb-8 animate-scale-in event-portrait-container">
            <img 
              src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
              alt="Event Portrait" 
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg border-4 border-white"
            />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
            Help us capture every moment!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 font-medium">
            Share your photos from our special day
          </p>

          <div className="flex items-center justify-center gap-4 mb-8 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{uploadCount} photos shared</span>
            </div>
            <div className="w-1 h-1 bg-gray-300 rounded-full" />
            <div className="flex items-center gap-1">
              <ImageIcon className="w-4 h-4" />
              <span>Live updates</span>
            </div>
          </div>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="action-button fab fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 z-50 flex items-center gap-3"
          style={{ 
            width: '120px', 
            height: '40px', 
            fontSize: '14px', 
            padding: '8px 12px'
          }}
        >
          <Camera className="w-4 h-4" />
          <span className="hidden sm:inline">Add Photos</span>
        </button>
      </header>

      {/* Photo Grid Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Memories</h2>
            <p className="text-gray-600">Beautiful moments captured by our guests</p>
          </div>
          <PhotoGrid />
        </div>
      </section>

      {/* Business Card Section */}
      <BusinessCard />

      {/* Admin Link - Fixed bottom-right */}
      <div className="fixed bottom-5 right-5 z-[100]" id="admin-btn">
        <Link to="/admin">
          <Button
            variant="ghost"
            size="sm"
            className="action-button text-gray-400 hover:text-gray-600 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
            style={{ 
              width: '120px', 
              height: '40px', 
              fontSize: '14px', 
              padding: '8px 12px'
            }}
          >
            Admin
          </Button>
        </Link>
      </div>

      {/* Modals */}
      <PhotoUploadModal 
        isOpen={showUploadModal} 
        onClose={() => setShowUploadModal(false)}
        onUpload={handlePhotoUpload}
      />
    </div>
  );
};

export default Index;
