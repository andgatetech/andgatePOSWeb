import { ShoppingCart } from "lucide-react";


const Footer = () => {
    return (
        <div className="  ">
            <footer className="bg-gray-900 py-16 text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 grid gap-8 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <div className="mb-6 flex items-center">
                                <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-2">
                                    <ShoppingCart className="h-6 w-6 text-white" />
                                </div>
                                <span className="ml-3 text-2xl font-bold">AndgatePOS</span>
                            </div>
                            <p className="mb-6 max-w-md leading-relaxed text-gray-400">
                                Empowering businesses worldwide with cutting-edge point of sale technology. Transform your operations and accelerate growth with AndGatePOS.
                            </p>
                            <div className="flex space-x-4">
                                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-blue-600">
                                    <span className="text-sm font-bold">f</span>
                                </div>
                                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-blue-600">
                                    <span className="text-sm font-bold">t</span>
                                </div>
                                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-800 transition-colors hover:bg-blue-600">
                                    <span className="text-sm font-bold">in</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-6 text-lg font-semibold">Product</h3>
                            <ul className="space-y-4">
                                <li>
                                    <a href="#features" className="text-gray-400 transition-colors hover:text-white">
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a href="#pricing" className="text-gray-400 transition-colors hover:text-white">
                                        Pricing
                                    </a>
                                </li>
                                
                                
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-6 text-lg font-semibold">Support</h3>
                            <ul className="space-y-4">
                                <li>
                                    <a href="/contact" className="text-gray-400 transition-colors hover:text-white">
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a href="/contact" className="text-gray-400 transition-colors hover:text-white">
                                        Contact Us
                                    </a>
                                </li>

                                <li>
                                    <a href="/training" className="text-gray-400 transition-colors hover:text-white">
                                        Training
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-between border-t border-gray-800 pt-8 md:flex-row">
                        <p className="text-sm text-gray-400">© 2024 AndGate Technologies. All rights reserved. Empowering businesses worldwide.</p>
                        <div className="mt-4 flex space-x-6 md:mt-0">
                            <a href="/privacy-policy" className="text-sm text-gray-400 transition-colors hover:text-white">
                                Privacy Policy
                            </a>
                            <a href="/terms-of-service" className="text-sm text-gray-400 transition-colors hover:text-white">
                                Terms of Service
                            </a>
                            <a href="/cookie-policy" className="text-sm text-gray-400 transition-colors hover:text-white">
                                Cookie Policy
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Footer;