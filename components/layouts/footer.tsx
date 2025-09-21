import Script from 'next/script';

const Footer = () => {
    return (
        <>
            <div className="mt-auto p-6 pt-0 text-center dark:text-white-dark ltr:sm:text-left rtl:sm:text-right">© {new Date().getFullYear()}. Andgate Technologies All rights reserved.</div>

            {/* Tawk.to Script */}
            <Script
                id="tawk-to-script"
                strategy="lazyOnload"
                src="https://embed.tawk.to/68cfdce564b9ae19220bde8f/1j5lvdo9a"
                onLoad={() => console.log('Tawk.to script loaded successfully!')}
                onError={(e) => console.error('Error loading Tawk.to script:', e)}
            />
        </>
    );
};

export default Footer;
