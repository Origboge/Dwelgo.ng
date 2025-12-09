
import React, { useEffect } from 'react';

export const TermsPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white pt-24 pb-12">
            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-zillow-600 dark:text-white">Terms and Conditions</h1>

                <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">1. Introduction</h2>
                        <p>Welcome to PropertyHub. By accessing our website and using our services, you agree to be bound by these Terms and Conditions. Please read them carefully.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">2. User Accounts</h2>
                        <p>To access certain features, you must create an account. You agree to provide accurate information and keep it updated. You are responsible for maintaining the confidentiality of your account credentials.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">3. Property Listings</h2>
                        <p>Agents are responsible for the accuracy of their property listings. PropertyHub does not guarantee the accuracy, completeness, or reliability of any listing information.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">4. Prohibited Conduct</h2>
                        <p>You may not use our services for any illegal purpose or to transmit any harmful or objectionable content. We reserve the right to suspend or terminate accounts that violate these terms.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">5. Limitation of Liability</h2>
                        <p>PropertyHub is not liable for any direct, indirect, incidental, or consequential damages arising from your use of our services or reliance on any information provided.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};
