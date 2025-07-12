
import { useState, useEffect } from 'react';
import { Heart, MessageCircle } from 'lucide-react';

const PhotoGrid = () => {
  const [photos, setPhotos] = useState([
    { 
      id: 1, 
      url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      likes: 12,
      device: 'iPhone 13'
    },
    { 
      id: 2, 
      url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      likes: 8,
      device: 'Samsung Galaxy'
    },
    { 
      id: 3, 
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      likes: 15,
      device: 'iPhone 14 Pro'
    },
    { 
      id: 4, 
      url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      likes: 6,
      device: 'Pixel 7'
    },
    { 
      id: 5, 
      url: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      likes: 22,
      device: 'iPhone 13 Pro'
    },
    { 
      id: 6, 
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      likes: 11,
      device: 'OnePlus 10'
    }
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLike = (id: number) => {
    setPhotos(photos.map(photo => 
      photo.id === id 
        ? { ...photo, likes: photo.likes + 1 }
        : photo
    ));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {photos.map((photo, index) => (
        <div 
          key={photo.id} 
          className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="aspect-square">
            <img
              src={photo.url}
              alt={`Wedding photo ${photo.id}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                  {photo.device}
                </span>
                <button
                  onClick={() => handleLike(photo.id)}
                  className="flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm hover:bg-black/50 transition-colors"
                  style={{ minHeight: '32px' }}
                >
                  <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  <span className="text-sm">{photo.likes}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhotoGrid;
