import { Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link to="/" className="flex items-center gap-2 text-rose-500 hover:text-rose-600 transition-colors">
            <Camera className="w-6 h-6" />
            <span className="text-lg font-semibold">Snapora™</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-600 mb-8">
            <strong>Last Updated:</strong> May 22, 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              Welcome to Snapora ("we," "our," "us"). We provide a QR code-based photo sharing service for events ("Service"). This Privacy Policy explains how we collect, use, and protect your information when you use our Service.
            </p>
            <p className="text-gray-600 leading-relaxed mt-4">
              By using our Service, you agree to the terms of this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              <strong>Information You Provide:</strong> When you create an event, we collect your name, email address, and event details. When guests upload photos, we collect those images and videos.
            </p>
            <p className="text-gray-600 leading-relaxed">
              <strong>Automatically Collected Information:</strong> We may collect IP addresses, device type, browser information, and usage data (e.g., time spent on the page) to help us improve the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Provide, operate, and maintain our Service.</li>
              <li>Create and manage your event galleries.</li>
              <li>Communicate with you about your account or event.</li>
              <li>Troubleshoot problems and improve our Service.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. How We Share Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              <strong>With Event Guests:</strong> Photos and videos uploaded by guests are shared with other guests and the event organizer within the private gallery.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              <strong>With Service Providers:</strong> We use third-party services like Supabase (for data storage) and Lovable.ai (for hosting). These providers are obligated to protect your data.
            </p>
            <p className="text-gray-600 leading-relaxed">
              <strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your event gallery and data for 90 days after the event date. After this period, data is automatically deleted from our servers. You may request earlier deletion by contacting us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed">
              You can request to access, correct, or delete your personal data by contacting us at snaporaoffic@gmail.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Children's Privacy</h2>
            <p className="text-gray-600 leading-relaxed">
              Our Service is not intended for children under 13. We do not knowingly collect their information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Changes to This Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this policy. We will notify you of any changes by posting the new policy on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4">
              <p className="text-gray-600 font-semibold">Snapora</p>
              <p className="text-gray-600">Email: snaporaoffic@gmail.com</p>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link 
            to="/" 
            className="inline-flex items-center text-rose-500 hover:text-rose-600 transition-colors font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;