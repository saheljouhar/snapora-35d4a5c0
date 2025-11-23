import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface Photo {
  id: string;
  photo_url: string;
  thumbnail_url: string | null;
  device_info: string | null;
  created_at: string;
}

interface LivePhotoFeedProps {
  eventId: string | null;
  eventName: string;
}

const LivePhotoFeed = ({ eventId, eventName }: LivePhotoFeedProps) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    // Fetch initial photos
    const fetchPhotos = async () => {
      try {
        const { data, error } = await supabase
          .from('event_photos')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error fetching photos:', error);
        } else {
          setPhotos(data || []);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('event-photos-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_photos',
          filter: `event_id=eq.${eventId}`
        },
        (payload) => {
          console.log('New photo uploaded:', payload);
          setPhotos((current) => [payload.new as Photo, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  if (!eventId || photos.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-12 px-4 bg-gradient-to-b from-white to-pink-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {eventName} Wedding Photos
            </h2>
            <p className="text-gray-600">Live feed from your guests</p>
          </div>
          <div className="grid grid-cols-3 gap-4 overflow-x-auto" style={{ gridTemplateRows: 'repeat(2, 1fr)' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-12 px-4 bg-gradient-to-b from-white to-pink-50/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {eventName} Wedding Photos
            </h2>
            <p className="text-gray-600">Live feed from your guests • {photos.length} photos shared</p>
          </div>
          
          {/* Fixed 2x3 grid with horizontal scroll */}
          <div className="relative">
            <div 
              className="grid gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
              style={{ 
                gridTemplateRows: 'repeat(2, minmax(150px, 250px))',
                gridAutoFlow: 'column',
                gridAutoColumns: 'minmax(150px, 250px)',
                scrollbarWidth: 'thin',
                scrollbarColor: '#ec4899 #fce7f3'
              }}
            >
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="snap-start group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="aspect-square">
                    <img
                      src={photo.thumbnail_url || photo.photo_url}
                      alt={`Event photo ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      {photo.device_info && (
                        <span className="text-xs bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm inline-block">
                          {photo.device_info}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: Show grid info */}
          <div className="text-center mt-4 text-sm text-gray-500">
            <p>← Scroll to see more photos →</p>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black/95 border-none">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          {selectedPhoto && (
            <div className="relative w-full h-[80vh] flex items-center justify-center">
              <img
                src={selectedPhoto.photo_url}
                alt="Full size photo"
                className="max-w-full max-h-full object-contain"
              />
              {selectedPhoto.device_info && (
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <span className="text-sm bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-sm inline-block">
                    {selectedPhoto.device_info}
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LivePhotoFeed;
