import Navbar from './components/navbar';
import PromoHero from './components/promo-hero';
import PromoPricing from './components/promo-pricing';
import PromoRegisterForm from './components/promo-register-form';

export default function PromotionPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Navbar />

            {/* Main content area */}
            <main className="flex flex-1 flex-col justify-center">
                {/* Stunning Video Hero Section */}
                <PromoHero />

                <div className="pt-10"></div>

                {/* Pricing Section styled with Promo Button */}
                <PromoPricing />

                <div className="pt-10"></div>

                {/* Beautiful split side-by-side Form Section */}
                <PromoRegisterForm />
            </main>
        </div>
    );
}
