import ProviderComponent from '@/components/layouts/provider-component';
import 'react-perfect-scrollbar/dist/css/styles.css';
import '../styles/tailwind.css';
import { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import WhatsAppButton from '@/__components/WhatsAppButton';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Script from "next/script";

export const metadata: Metadata = {
    title: {
        template: '%s | AndgatePOS System',
        default: 'AndgatePOS - POS System',
    },
};

const nunito = Nunito({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-nunito',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={nunito.variable}>
                <Script id="tawk-to-script" strategy="lazyOnload">
                {`
                    var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                    (function(){
                    var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                    s1.async=true;
                    s1.src='https://embed.tawk.to/68cfdce564b9ae19220bde8f/1j5lvdo9a';
                    s1.charset='UTF-8';
                    s1.setAttribute('crossorigin','*');
                    s0.parentNode.insertBefore(s1,s0);
                    })();
                `}
            </Script>
                <ProviderComponent>
                    {children}
                    <WhatsAppButton />
                </ProviderComponent>
                 <ToastContainer position="top-right" autoClose={3000} />
            </body>
        </html>
    );
}
