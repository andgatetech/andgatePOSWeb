import Script from 'next/script';

const Footer = () => {
    return (
        <>
            <div className="mt-auto p-6 pt-0 text-center dark:text-white-dark ltr:sm:text-left rtl:sm:text-right">© {new Date().getFullYear()}. Andgate Technologies All rights reserved.</div>

            {/* Tawk.to Script */}
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
        </>
    );
};

export default Footer;
