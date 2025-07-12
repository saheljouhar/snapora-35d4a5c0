
import { Instagram, MessageCircle, Phone, Mail, Heart, Star, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const BusinessCard = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-0">
            {/* Header with Logo */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 p-8 text-white text-center">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Moments Photography</h2>
              <p className="text-rose-100">Capturing your special moments</p>
            </div>

            <div className="p-8">
              {/* Services */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Services</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500" />
                      Wedding Photography
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-rose-500" />
                      Engagement Sessions
                    </li>
                    <li className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-rose-500" />
                      Event Photography
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Why Choose Us</h3>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li>• Professional equipment & editing</li>
                    <li>• Fast delivery (48-hour preview)</li>
                    <li>• Unlimited revisions</li>
                    <li>• Social media ready formats</li>
                  </ul>
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-gray-50 to-rose-50 rounded-2xl p-6 text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Love our work? 
                </h3>
                <p className="text-gray-600 mb-4">
                  Book us for your special event and get 20% off your first session!
                </p>
                
                <Button
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-full px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{ minHeight: '48px' }}
                >
                  Book Your Event!
                </Button>
              </div>

              {/* Contact Links */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-full px-6 py-3 transition-all duration-300 hover:scale-105 shadow-lg"
                  style={{ minHeight: '48px' }}
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>

                <a
                  href="https://instagram.com/momentsphotography"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-6 py-3 transition-all duration-300 hover:scale-105 shadow-lg"
                  style={{ minHeight: '48px' }}
                >
                  <Instagram className="w-5 h-5" />
                  Instagram
                </a>

                <a
                  href="tel:+1234567890"
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 py-3 transition-all duration-300 hover:scale-105 shadow-lg"
                  style={{ minHeight: '48px' }}
                >
                  <Phone className="w-5 h-5" />
                  Call Now
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default BusinessCard;
