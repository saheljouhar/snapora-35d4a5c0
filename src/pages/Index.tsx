
import { useState, useEffect } from 'react';
import { Camera, Heart, Users, Image as ImageIcon, MessageCircle, Instagram, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PhotoUploadModal from '@/components/PhotoUploadModal';
import BusinessCard from '@/components/BusinessCard';
import PhotoGrid from '@/components/PhotoGrid';
import LivePhotoFeed from '@/components/LivePhotoFeed';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCount, setUploadCount] = useState(127); // Demo count
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventNotFound, setEventNotFound] = useState(false);
  const [eventName, setEventName] = useState<string>('');
  const [hasLivePhotos, setHasLivePhotos] = useState(false);
  const [eventStatus, setEventStatus] = useState<string | null>(null);

  // Track if this event has any uploaded photos (for showing demo vs live gallery)
  useEffect(() => {
    if (!eventId) {
      setHasLivePhotos(false);
      return;
    }

    const checkPhotoCount = async () => {
      const { count } = await supabase
        .from('event_photos')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);
      setHasLivePhotos((count || 0) > 0);
    };

    checkPhotoCount();

    const channel = supabase
      .channel(`event-photos-count-${eventId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'event_photos', filter: `event_id=eq.${eventId}` },
        () => setHasLivePhotos(true)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  useEffect(() => {
    // Get event ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const eventIdParam = urlParams.get('event');
    setEventId(eventIdParam);

    // Fetch event details from Supabase Events table
    const fetchEventPoster = async () => {
      if (eventIdParam) {
        try {
          // Fetch event details including name
          const { data: eventData, error: eventError } = await supabase
            .from('Events')
            .select('name, poster_url, status')
            .eq('event_id', eventIdParam)
            .single();

          if (eventData && !eventError) {
            setEventStatus(eventData.status ?? null);
            // Set event name
            setEventName(eventData.name || eventIdParam);
            
            // Trim whitespace from URL
            const imageUrl = typeof eventData.poster_url === 'string' 
              ? eventData.poster_url.trim() 
              : eventData.poster_url;

          // Preload the image before setting it
          const img = new Image();
          img.onload = () => {
            setPosterUrl(imageUrl);
            setIsImageLoading(false);
            setEventNotFound(false);
          };
          img.onerror = () => {
            // If image fails to load, check if event exists in database
            console.warn(`Event poster not found for event ID: ${eventIdParam}`);
            setEventNotFound(true);
            setIsImageLoading(false);
            // Use default fallback
            setPosterUrl('https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');
          };
            img.src = imageUrl;
          } else {
            // Event not found in database or error
            console.warn(`Event not found: ${eventIdParam}`);
            setEventNotFound(true);
            setIsImageLoading(false);
            setPosterUrl('https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');
          }
        } catch (err) {
          console.warn('Error fetching event poster:', err);
          setEventName(eventIdParam);
          
          // Fallback to direct storage URLs based on event ID
          const storageUrl = `https://dydzqautscblrrcvlreh.supabase.co/storage/v1/object/public/posters/${eventIdParam}.jpg`;
          
          // Preload the fallback image
          const img = new Image();
          img.onload = () => {
            setPosterUrl(storageUrl);
            setIsImageLoading(false);
            setEventNotFound(false);
          };
          img.onerror = () => {
            console.warn(`Event poster not found for event ID: ${eventIdParam}`);
            setEventNotFound(true);
            setIsImageLoading(false);
            setPosterUrl('https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');
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
            ) : eventNotFound && eventId ? (
              <div 
                className="w-full rounded-2xl shadow-2xl bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-200 flex items-center justify-center p-8"
                style={{ width: '95%', maxWidth: '900px', height: '400px', margin: '0 auto' }}
              >
                <div className="text-center">
                  <ImageIcon className="w-16 h-16 text-rose-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Event Not Found</h3>
                  <p className="text-gray-600 mb-4">
                    The event "<span className="font-mono text-rose-600">{eventId}</span>" could not be found.
                  </p>
                  <p className="text-sm text-gray-500">
                    Please check the event ID or contact the event organizer.
                  </p>
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

      {/* Live Photo Feed Section */}
      <LivePhotoFeed eventId={eventId} eventName={eventName} />

      {/* Photo Grid Section - demo placeholders, only shown when no live photos exist */}
      {!hasLivePhotos && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Memories</h2>
              <p className="text-gray-600">Beautiful moments captured by our guests</p>
            </div>
            <PhotoGrid />
          </div>
        </section>
      )}

      {/* Business Card Section */}
      <div className="relative">
        <BusinessCard eventId={eventId} />
        
        {/* Footer with Snapora branding */}
        <footer className="bg-gray-50 py-8 px-4 pb-20">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Camera className="w-6 h-6 text-rose-500" />
              <span className="text-lg font-semibold text-gray-800">Snapora™</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">Capturing your special moments</p>
            
            {/* Legal Links */}
            <div className="flex items-center justify-center gap-4 mb-4 text-sm">
              <Link to="/privacy-policy" className="text-gray-500 hover:text-rose-500 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-300">•</span>
              <Link to="/terms-of-service" className="text-gray-500 hover:text-rose-500 transition-colors">
                Terms of Service
              </Link>
            </div>
            
          </div>
        </footer>
      </div>

      {/* Floating Add Photos Button — hidden when event is closed */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        {eventStatus === 'closed' ? (
          <div className="bg-white/95 backdrop-blur-sm border border-rose-200 text-gray-700 text-sm md:text-base text-center px-5 py-3 rounded-lg shadow-lg max-w-md">
            This event has ended. Thank you for sharing your memories!
          </div>
        ) : (
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
        )}
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
