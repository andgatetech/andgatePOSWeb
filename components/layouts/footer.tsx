const Footer = () => {
    return (
        <>
            <div className="mt-auto p-6 pt-0 text-center dark:text-white-dark ltr:sm:text-left rtl:sm:text-right">
                © {new Date().getFullYear()}{' '}
                <a href="https://andgatetech.net/" target="_blank" rel="noopener noreferrer" className="font-semibold transition-colors hover:text-primary">
                    Andgate Technologies
                </a>
                . All rights reserved.
            </div>
        </>
    );
};

export default Footer;
