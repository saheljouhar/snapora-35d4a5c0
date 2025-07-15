import { useState } from 'react';
import { ArrowLeft, Download, Trash2, Users, Image as ImageIcon, BarChart3, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Admin = () => {
  const [photos] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', device: 'iOS' },
    { id: 2, url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', device: 'Android' },
    { id: 3, url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', device: 'iOS' },
    { id: 4, url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', device: 'Android' },
  ]);

  const [activeSection, setActiveSection] = useState('stats');
  const uploadCount = 127;

  const handleExportZip = () => {
    alert('Exporting photos as ZIP file... (This would download in a real app)');
  };

  const handleDeletePhoto = (id: number) => {
    alert(`Photo ${id} would be deleted in a real app`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="admin-header relative mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="back-btn flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="admin-nav bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setActiveSection('stats')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'stats' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveSection('photos')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'photos' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Photos
            </button>
            <button
              onClick={() => setActiveSection('exports')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'exports' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Exports
            </button>
          </div>
        </nav>

        {/* Stats Section */}
        {activeSection === 'stats' && (
          <div id="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Photos</p>
                      <p className="text-3xl font-bold">{uploadCount}</p>
                    </div>
                    <ImageIcon className="w-8 h-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Active Users</p>
                      <p className="text-3xl font-bold">48</p>
                    </div>
                    <Users className="w-8 h-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Storage Used</p>
                      <p className="text-3xl font-bold">2.1GB</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Device Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Device Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">iOS Devices</span>
                      <span className="font-semibold">65%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Android Devices</span>
                      <span className="font-semibold">35%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Photos Section */}
        {activeSection === 'photos' && (
          <div id="photos">
            <Card>
              <CardHeader>
                <CardTitle>Recent Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.url}
                        alt={`Photo ${photo.id}`}
                        className="w-full h-32 object-cover rounded-lg shadow-md"
                      />
                      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {photo.device}
                      </div>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ minWidth: '32px', minHeight: '32px' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Exports Section */}
        {activeSection === 'exports' && (
          <div id="exports">
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleExportZip}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 py-3 flex items-center gap-2 shadow-lg"
                  style={{ minHeight: '48px' }}
                >
                  <Download className="w-5 h-5" />
                  Export ZIP (Max 100MB)
                </Button>
                
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-6 py-3 flex items-center gap-2"
                  style={{ minHeight: '48px' }}
                >
                  <Eye className="w-5 h-5" />
                  View Analytics Report
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
