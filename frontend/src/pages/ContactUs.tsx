import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="px-6 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-link hover:underline mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      {/* Hero */}
      <div className="bg-canvas border-2 border-ink border-b-0 px-6 py-3">
        <span className="font-bold uppercase text-xs tracking-wider">Contact Us</span>
      </div>
      <div className="bg-tint-peach border-2 border-ink px-6 py-12">
        <h1 className="font-display text-5xl font-bold uppercase mb-4 max-w-3xl">
          We're Here To Help
        </h1>
        <p className="text-lg max-w-2xl leading-relaxed">
          Questions about an order? Want to list your items? Just want to say hello? 
          We read every message. Drop us a line.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-0 mt-0">
        {/* Contact Form */}
        <div className="border-2 border-ink bg-canvas">
          <div className="bg-canvas border-b-2 border-ink px-6 py-3">
            <span className="font-bold uppercase text-xs tracking-wider flex items-center gap-2">
              <MessageSquare className="h-3 w-3" /> Send a Message
            </span>
          </div>

          {submitted ? (
            <div className="px-6 py-16 text-center">
              <div className="w-16 h-16 border-2 border-ink bg-tint-lime flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-bold uppercase text-lg mb-2">Message Sent</h3>
              <p className="text-sm mb-6">We'll get back to you within 24 hours.</p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                className="border-2 border-ink px-6 py-2 font-bold uppercase text-xs hover:bg-muted transition-colors"
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="divide-y-2 divide-ink">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-4">
                  <label className="block font-bold uppercase text-xs mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border-2 border-ink bg-canvas px-3 py-2 text-sm outline-none"
                    placeholder="Your name"
                  />
                </div>
                <div className="p-4 md:border-l-2 border-ink">
                  <label className="block font-bold uppercase text-xs mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border-2 border-ink bg-canvas px-3 py-2 text-sm outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="p-4">
                <label className="block font-bold uppercase text-xs mb-2">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full border-2 border-ink bg-canvas px-3 py-2 text-sm outline-none"
                  placeholder="What's this about?"
                />
              </div>
              <div className="p-4">
                <label className="block font-bold uppercase text-xs mb-2">Message</label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full border-2 border-ink bg-canvas px-3 py-2 text-sm outline-none resize-none"
                  placeholder="Tell us what you need..."
                />
              </div>
              <div className="p-4">
                <button
                  type="submit"
                  className="w-full border-2 border-ink bg-ink text-canvas px-6 py-3 font-bold uppercase text-sm hover:bg-ink/90 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Contact Info Sidebar */}
        <div className="border-2 border-l-0 border-ink bg-canvas">
          <div className="bg-tint-steel border-b-2 border-ink px-6 py-3">
            <span className="font-bold uppercase text-xs tracking-wider">Contact Info</span>
          </div>

          <div className="divide-y-2 divide-ink">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="border-2 border-ink p-2"><Mail className="h-4 w-4" /></div>
                <span className="font-heading font-bold uppercase text-sm">Email</span>
              </div>
              <p className="text-sm">support@vaultx.com</p>
              <p className="text-sm">press@vaultx.com</p>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="border-2 border-ink p-2"><MapPin className="h-4 w-4" /></div>
                <span className="font-heading font-bold uppercase text-sm">Location</span>
              </div>
              <p className="text-sm">San Francisco, CA</p>
              <p className="text-sm">United States</p>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="border-2 border-ink p-2"><Clock className="h-4 w-4" /></div>
                <span className="font-heading font-bold uppercase text-sm">Response Time</span>
              </div>
              <p className="text-sm">We typically respond within 24 hours.</p>
              <p className="text-sm">Urgent? Reach us on Twitter @vaultx</p>
            </div>
          </div>

          {/* FAQ Link */}
          <div className="p-6 border-t-2 border-ink">
            <div className="bg-tint-lime border-2 border-ink p-4">
              <h4 className="font-heading font-bold uppercase text-sm mb-2">Common Questions</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="font-bold">Selling:</span> Apply as a seller from your dashboard</li>
                <li><span className="font-bold">Payments:</span> We use secure escrow for all transactions</li>
                <li><span className="font-bold">Shipping:</span> Physical items ship within 3 business days</li>
                <li><span className="font-bold">Returns:</span> 14-day return policy on physical goods</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
