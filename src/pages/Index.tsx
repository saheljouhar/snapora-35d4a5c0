
import { useState } from 'react';
import { Camera, Heart, Users, Image as ImageIcon, MessageCircle, Instagram, Phone } from 'lucide-react';
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
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm shadow-sm px-4 py-3">
        <div className="max-w-6xl mx-auto">
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section hero-container relative min-h-screen flex flex-col items-center justify-center px-4 text-center overflow-hidden pt-16">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-pink-100/30 to-white/50" />
        
        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in">
          {/* Event Poster Container */}
          <div className="poster-container poster-hero hero-poster mb-8 animate-scale-in">
            <img 
              src="https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
              alt="Event Poster" 
              className="event-poster w-full rounded-2xl shadow-2xl border-4 border-white object-cover"
              style={{ width: '90%', maxWidth: '800px', height: 'auto', margin: '30px auto' }}
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
      <div className="relative">
        <BusinessCard />
        
        {/* Footer with Wedflicks branding */}
        <footer className="bg-gray-50 py-8 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Camera className="w-6 h-6 text-rose-500" />
              <span className="text-lg font-semibold text-gray-800">Wedflicks™</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">Capturing your special moments</p>
            
            {/* Admin Link */}
            <div id="admin-btn">
              <Link to="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="mx-auto block"
                >
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Add Photos Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <Button 
          onClick={() => setShowUploadModal(true)}
          className="text-white flex items-center gap-2 shadow-lg"
          style={{ 
            backgroundColor: '#4CAF50 !important',
            padding: '12px 30px',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Camera className="h-5 w-5" />
          <span className="font-medium">Add Photos</span>
        </Button>
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
