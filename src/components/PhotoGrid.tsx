
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

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
      url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      likes: 18,
      device: 'Canon EOS'
    },
    { 
      id: 7, 
      url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      likes: 25,
      device: 'iPhone 15'
    },
    { 
      id: 8, 
      url: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      likes: 14,
      device: 'Sony A7'
    },
    { 
      id: 9, 
      url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      likes: 31,
      device: 'Nikon D850'
    },
    { 
      id: 10, 
      url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      likes: 19,
      device: 'OnePlus 11'
    },
    { 
      id: 11, 
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      likes: 27,
      device: 'iPhone 14'
    },
    { 
      id: 12, 
      url: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      likes: 16,
      device: 'Google Pixel'
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

  // Ensure even number of images by adding placeholder if odd count
  const displayPhotos = [...photos];
  if (displayPhotos.length % 2 !== 0) {
    displayPhotos.push({
      id: -1, // Use -1 as placeholder ID to avoid type conflicts
      url: '',
      likes: 0,
      device: ''
    });
  }

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
      {displayPhotos.map((photo, index) => {
        // Render empty slot for placeholder
        if (photo.id === -1) {
          return (
            <div 
              key="empty-slot" 
              className="empty-slot aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400"
            >
              <span className="text-sm">More photos coming soon...</span>
            </div>
          );
        }

        return (
          <div 
            key={photo.id} 
            className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="aspect-square">
              <img
                src={photo.url}
                alt={`Event photo ${photo.id}`}
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
        );
      })}
    </div>
  );
};

export default PhotoGrid;
