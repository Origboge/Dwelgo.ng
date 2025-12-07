
import React from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Megaphone, Target, BarChart2, Users } from 'lucide-react';

export const AdvertisePage: React.FC = () => {
  return (
    <div className="min-h-screen pt-20 pb-20 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white">
      {/* Hero */}
      <div className="bg-zillow-600 py-20 text-white text-center">
          <div className="container mx-auto px-6">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">Advertise with PropertyHub</h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
                  Connect your brand with the largest and most engaged audience of movers and homeowners in Nigeria.
              </p>
          </div>
      </div>

      <div className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-16 items-start">
              
              {/* Features */}
              <div>
                  <h2 className="text-3xl font-bold mb-8">Why Advertise?</h2>
                  
                  <div className="space-y-8">
                      <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 text-zillow-600 flex items-center justify-center shrink-0">
                              <Target size={24} />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold mb-2">Targeted Reach</h3>
                              <p className="text-slate-600 dark:text-slate-400">
                                  Our platform allows you to target specific demographics, locations, and user behaviors to ensure your ads are seen by the right people.
                              </p>
                          </div>
                      </div>

                      <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                              <BarChart2 size={24} />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold mb-2">Measurable Results</h3>
                              <p className="text-slate-600 dark:text-slate-400">
                                  Track impressions, clicks, and conversions in real-time with our comprehensive advertiser dashboard.
                              </p>
                          </div>
                      </div>

                      <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                              <Users size={24} />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold mb-2">Premium Audience</h3>
                              <p className="text-slate-600 dark:text-slate-400">
                                  Engage with high-intent buyers and renters actively looking for their next home or investment.
                              </p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Form */}
              <div className="bg-gray-50 dark:bg-slate-900 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
                  <h3 className="text-2xl font-bold mb-6">Get Started Today</h3>
                  <form className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <Input label="First Name" placeholder="John" />
                          <Input label="Last Name" placeholder="Doe" />
                      </div>
                      <Input label="Business Email" type="email" placeholder="john@company.com" />
                      <Input label="Company Name" placeholder="Your Business" />
                      <Input label="Phone Number" type="tel" placeholder="+234..." />
                      
                      <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Goal</label>
                          <select className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-zillow-600">
                              <option>Brand Awareness</option>
                              <option>Lead Generation</option>
                              <option>Promote Listings</option>
                          </select>
                      </div>

                      <Button variant="primary" className="w-full py-4 text-lg mt-4">Submit Inquiry</Button>
                      <p className="text-xs text-center text-slate-500 mt-4">
                          A member of our sales team will contact you within 24 hours.
                      </p>
                  </form>
              </div>
          </div>
      </div>
    </div>
  );
};
