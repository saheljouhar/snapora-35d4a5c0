
import { useState, useEffect } from 'react';
import { Camera, Heart, Users, Image as ImageIcon, MessageCircle, Instagram, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PhotoUploadModal from '@/components/PhotoUploadModal';
import BusinessCard from '@/components/BusinessCard';
import PhotoGrid from '@/components/PhotoGrid';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCount, setUploadCount] = useState(127); // Demo count
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    // Get event ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const eventIdParam = urlParams.get('event');
    setEventId(eventIdParam);

    // Fetch poster URL from Supabase Events table with preloading
    const fetchEventPoster = async () => {
      if (eventIdParam) {
        try {
          const { data, error } = await supabase
            .rpc('get_event_poster', { event_id_param: eventIdParam });

          let imageUrl;
          if (data && !error) {
            imageUrl = data;
          } else {
            // Fallback to direct storage URLs based on event ID
            imageUrl = `https://dydzqautscblrrcvlreh.supabase.co/storage/v1/object/public/posters/${eventIdParam}.jpg`;
          }

          // Preload the image before setting it
          const img = new Image();
          img.onload = () => {
            setPosterUrl(imageUrl);
            setIsImageLoading(false);
          };
          img.onerror = () => {
            // If image fails to load, use default and stop loading
            setPosterUrl('https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');
            setIsImageLoading(false);
          };
          img.src = imageUrl;
        } catch (err) {
          console.warn('Error fetching event poster:', err);
          // Fallback to direct storage URLs based on event ID
          const storageUrl = `https://dydzqautscblrrcvlreh.supabase.co/storage/v1/object/public/posters/${eventIdParam}.jpg`;
          
          // Preload the fallback image
          const img = new Image();
          img.onload = () => {
            setPosterUrl(storageUrl);
            setIsImageLoading(false);
          };
          img.onerror = () => {
            setPosterUrl('https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');
            setIsImageLoading(false);
          };
          img.src = storageUrl;
        }
      } else {
        // No event ID, use default image
        setPosterUrl('https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');
        setIsImageLoading(false);
      }
    };

    fetchEventPoster();
  }, []);

  const handlePhotoUpload = () => {
    setUploadCount(prev => prev + 1);
    setShowUploadModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-sm px-4 py-3">
        <div className="max-w-6xl mx-auto">
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section hero-container relative min-h-screen flex flex-col items-center justify-center px-4 text-center overflow-hidden pt-2">
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
            {isImageLoading ? (
              <div 
                className="w-full rounded-2xl shadow-2xl bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center"
                style={{ width: '95%', maxWidth: '900px', height: '600px', margin: '0 auto' }}
              >
                <div className="text-center">
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                  <p className="text-gray-500 font-medium">Loading event poster...</p>
                </div>
              </div>
            ) : posterUrl ? (
              <img 
                id="event-poster"
                src={posterUrl} 
                alt={eventId ? `${eventId} Event Poster` : "Event Poster"} 
                className="event-poster w-full rounded-2xl shadow-2xl object-cover transition-opacity duration-300"
                style={{ width: '95%', maxWidth: '900px', height: 'auto', margin: '0 auto' }}
              />
            ) : null}
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
        <footer className="bg-gray-50 py-8 px-4 pb-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Camera className="w-6 h-6 text-rose-500" />
              <span className="text-lg font-semibold text-gray-800">Snapora™</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">Capturing your special moments</p>
            
            {/* Admin Link */}
            <div id="admin-btn">
              <Link to="/admin-login">
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
        eventId={eventId}
      />
    </div>
  );
};

export default Index;
