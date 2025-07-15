
import { useState } from 'react';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';

const Booking = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    eventType: '',
    location: '',
    eventDate: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking form submitted:', formData);
    alert('Thank you for your booking request! We will contact you soon.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <Link to="/" className="back-btn p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="booking-header flex-1">
            <h1 className="text-xl font-bold text-gray-800">Book Your Event</h1>
          </div>
        </div>
      </header>

      {/* Booking Form */}
      <div className="px-4 py-8">
        <div className="booking-form max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center mb-6">
              <Calendar className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Let's Plan Your Event</h2>
              <p className="text-gray-600">Fill out the details below and we'll get back to you within 24 hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                  style={{ fontSize: '16px' }}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                  style={{ fontSize: '16px' }}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1"
                  style={{ fontSize: '16px' }}
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <Label htmlFor="eventType" className="text-sm font-medium text-gray-700">
                  Event Type *
                </Label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full h-12 px-3 py-2 border border-input bg-background rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  style={{ fontSize: '16px' }}
                >
                  <option value="">Select event type</option>
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate</option>
                  <option value="birthday">Birthday</option>
                  <option value="engagement">Engagement</option>
                  <option value="graduation">Graduation</option>
                </select>
              </div>

              <div>
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                  Event Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1"
                  style={{ fontSize: '16px' }}
                  placeholder="Enter event location"
                />
              </div>

              <div>
                <Label htmlFor="eventDate" className="text-sm font-medium text-gray-700">
                  Event Date *
                </Label>
                <Input
                  id="eventDate"
                  name="eventDate"
                  type="date"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                  style={{ fontSize: '16px' }}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                style={{ minHeight: '48px', fontSize: '16px' }}
              >
                Submit Booking Request
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
