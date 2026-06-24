const Footer = () => {
    return (
        <footer className="mt-auto p-6 pt-0 text-center text-xs text-gray-500 dark:text-white-dark ltr:sm:text-left rtl:sm:text-right">
            <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-5 dark:border-white/10 sm:flex-row">
                <div>
                    © {new Date().getFullYear()}{' '}
                    <a href="https://andgatetech.net/" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-700 transition-colors hover:text-primary dark:text-white">
                        Andgate Technologies
                    </a>
                    . All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
