'use client';
import Dropdown from '@/components/dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { getTranslation } from '@/i18n';
import { RootState } from '@/store';
import Image from 'next/image';
import { useSelector } from 'react-redux';

interface LanguageDropdownProps {
    className?: string;
    variant?: 'light' | 'dark';
}

// Maps language code → flag SVG filename (language code ≠ country code)
const LANG_FLAG: Record<string, string> = {
    bn: 'BD', // Bengali → Bangladesh flag
    en: 'EN', // English → custom EN flag
};
const flagFor = (code: string) => LANG_FLAG[code] ?? code.toUpperCase();

const LanguageDropdown = ({ className = '', variant = 'light' }: LanguageDropdownProps) => {
    const { i18n } = getTranslation();

    const isRtl = useSelector((state: RootState) => state.themeConfig.rtlClass) === 'rtl';
    const themeConfig = useSelector((state: RootState) => state.themeConfig);

    return (
        <div className={`dropdown shrink-0 ${className}`}>
            {i18n.language && (
                <Dropdown
                    offset={[0, 8]}
                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                    btnClassName={
                        variant === 'dark'
                            ? 'flex h-[34px] w-[34px] items-center justify-center gap-1.5 rounded-md bg-white/[0.08] p-0 text-white transition-colors hover:bg-white/[0.15] md:w-auto md:px-2.5'
                            : 'flex h-[34px] w-[34px] items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white p-0 text-gray-700 transition-all hover:border-[#046ca9] hover:text-[#046ca9] md:w-auto md:px-2.5'
                    }
                    button={
                        <>
                            <Image src={`/assets/images/flags/${flagFor(i18n.language)}.svg`} alt={i18n.language} width={18} height={18} className="h-[18px] w-[18px] rounded-full object-cover" />
                            <span className="hidden text-sm font-medium uppercase md:inline">{i18n.language}</span>
                            <IconCaretDown className="hidden md:block" />
                        </>
                    }
                >
                    <ul className="grid w-[200px] grid-cols-1 gap-1 !px-2 py-2 font-medium">
                        {themeConfig.languageList.map((item: any) => (
                            <li key={item.code}>
                                <button
                                    type="button"
                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-[#046ca9]/5 hover:text-[#046ca9] ${
                                        i18n.language === item.code ? 'bg-[#046ca9]/5 text-[#046ca9]' : 'text-gray-700'
                                    }`}
                                    onClick={() => i18n.changeLanguage(item.code)}
                                >
                                    <Image src={`/assets/images/flags/${flagFor(item.code)}.svg`} alt={item.name} width={20} height={20} className="rounded-full object-cover" />
                                    <span className="text-sm">{item.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </Dropdown>
            )}
        </div>
    );
};

export default LanguageDropdown;
