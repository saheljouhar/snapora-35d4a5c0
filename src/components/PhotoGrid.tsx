
import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

const PhotoGrid = () => {
  const [photos, setPhotos] = useState([
    { 
      id: 1, 
      url: '/lovable-uploads/d91c3a6c-97bd-4d1f-bdac-7c82b8f1dc7a.png',
      likes: 28,
      device: 'iPhone 14 Pro'
    },
    { 
      id: 2, 
      url: '/lovable-uploads/74541a4d-72de-4769-900f-32b0a6fc2527.png',
      likes: 35,
      device: 'Canon EOS R5'
    },
    { 
      id: 3, 
      url: '/lovable-uploads/22e7d23a-a45c-4b7d-ae0c-58e60a4702af.png',
      likes: 42,
      device: 'Sony A7 III'
    },
    { 
      id: 4, 
      url: '/lovable-uploads/520644f1-92ce-4a95-bcdd-25553dd8b2b9.png',
      likes: 31,
      device: 'Nikon D850'
    },
    { 
      id: 5, 
      url: '/lovable-uploads/bb83c547-51a1-47cf-b156-94a5b80ed1bd.png',
      likes: 26,
      device: 'iPhone 15 Pro'
    },
    { 
      id: 6, 
      url: '/lovable-uploads/3f38732c-c563-4252-9594-a389e743a0e7.png',
      likes: 38,
      device: 'Canon R6'
    },
    { 
      id: 7, 
      url: '/lovable-uploads/e4d0fa59-a3aa-4240-8d61-942f4fc53175.png',
      likes: 33,
      device: 'Sony A7R IV'
    },
    { 
      id: 8, 
      url: '/lovable-uploads/b4d0b97e-20cd-4a5d-ad97-3c6c15df42e8.png',
      likes: 29,
      device: 'Fuji X-T5'
    }
  ]);

  const [loading, setLoading] = useState(true);
  const [likedPhotos, setLikedPhotos] = useState<Set<number>>(() => {
    const saved = localStorage.getItem('likedPhotosStatic');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLike = (id: number) => {
    // Check if already liked
    if (likedPhotos.has(id)) {
      return;
    }

    // Add to liked photos
    const newLikedPhotos = new Set(likedPhotos);
    newLikedPhotos.add(id);
    setLikedPhotos(newLikedPhotos);
    localStorage.setItem('likedPhotosStatic', JSON.stringify([...newLikedPhotos]));

    // Update likes count
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
                    className={`flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm hover:bg-black/50 transition-colors ${
                      likedPhotos.has(photo.id) ? 'cursor-not-allowed opacity-60' : ''
                    }`}
                    style={{ minHeight: '32px' }}
                    disabled={likedPhotos.has(photo.id)}
                  >
                    <Heart 
                      className="w-4 h-4 text-red-500" 
                      fill={likedPhotos.has(photo.id) ? "currentColor" : "none"}
                    />
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
