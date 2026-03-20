import Image from 'next/image';
import Link from 'next/link';
import PromoButton from './promo-button';
import AndGate from '/public/images/andgatePOS.jpeg';

export default function Navbar() {
    return (
        <nav className="flex h-16 w-full items-center justify-between border-b bg-white px-6 shadow-sm">
            <div className="flex items-center">
                <Link href="/" className="flex items-center">
                    <Image src={AndGate} alt="AndgatePOS Logo" width={160} height={31} />
                </Link>
            </div>
            <div className="flex items-center gap-6">
               
                <PromoButton href="#register-section" />
            </div>
        </nav>
    );
}
