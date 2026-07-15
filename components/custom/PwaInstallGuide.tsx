'use client';

import { Share2, X } from 'lucide-react';
import { getTranslation } from '@/i18n';

const PwaInstallGuide = ({ isIOS, onClose }: { isIOS: boolean; onClose: () => void }) => {
    const { t } = getTranslation();
    return (
        <div
        className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
        onClick={onClose}
    >
        <div
            className="w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">{t('pwa_install_title')}</h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label={t('pwa_close_install_guide')}
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <ol className="space-y-3">
                <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">1</span>
                    <div>
                        <p className="text-sm font-medium text-gray-800">
                            {isIOS ? t('pwa_tap_share_button') : t('pwa_open_browser_menu')}
                        </p>
                        <p className="text-xs text-gray-500">
                            {isIOS ? t('pwa_safari_share_hint') : t('pwa_browser_menu_hint')}
                        </p>
                    </div>
                    <Share2 className="ml-auto h-7 w-7 flex-shrink-0 text-[#046ca9]" />
                </li>
                <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">2</span>
                    <div>
                        <p className="text-sm font-medium text-gray-800">
                            {isIOS ? t('pwa_scroll_down_tap') : t('pwa_tap_install_option')}
                        </p>
                        <p className="text-xs font-semibold text-[#046ca9]">
                            {isIOS ? t('pwa_add_to_home_screen') : t('pwa_install_app_option')}
                        </p>
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#046ca9] text-xs font-bold text-white">3</span>
                    <div>
                        <p className="text-sm font-medium text-gray-800">{t('pwa_confirm_install')}</p>
                        <p className="text-xs text-gray-500">{t('pwa_icon_home_screen')}</p>
                    </div>
                </li>
            </ol>

            <button
                type="button"
                onClick={onClose}
                className="mt-5 w-full rounded-xl bg-[#046ca9] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#034d79]"
            >
                {t('btn_got_it')}
            </button>
        </div>
        </div>
    );
};

export default PwaInstallGuide;
