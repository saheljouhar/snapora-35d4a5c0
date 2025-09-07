import { Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
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
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Terms and Conditions</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-600 mb-8">
            <strong>Last Updated:</strong> May 22, 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using our Service, you agree to be bound by these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Accounts</h2>
            <p className="text-gray-600 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. User Content</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              <strong>Your Responsibility:</strong> You are solely responsible for the photos and videos ("Content") you upload. You must have all necessary rights to that Content.
            </p>
            <p className="text-gray-600 leading-relaxed">
              <strong>License to Us:</strong> By uploading Content, you grant us a worldwide, non-exclusive license to host, store, and display that Content solely for the purpose of providing the Service to you and your event guests.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Prohibited Uses</h2>
            <p className="text-gray-600 leading-relaxed mb-4">You may not use our Service to upload Content that is:</p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Illegal, offensive, or infringing on someone else's rights.</li>
              <li>Contains viruses or malicious code.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Our Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed">
              The Service itself, including its design, features, and functionality, is owned by us and is protected by copyright and other laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Disclaimer</h2>
            <p className="text-gray-600 leading-relaxed">
              Our Service is provided "as is" without any warranties. We do not guarantee that the Service will be uninterrupted or error-free.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              To the fullest extent permitted by law, we shall not be liable for any indirect or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms shall be governed by the laws of India.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              For any questions about these Terms, please contact us at snaporaoffic@gmail.com.
            </p>
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

export default TermsOfService;