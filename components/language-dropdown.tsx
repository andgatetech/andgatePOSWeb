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
        <div className={`dropdown ${className}`}>
            {i18n.language && (
                <Dropdown
                    offset={[0, 8]}
                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                    btnClassName={
                        variant === 'dark'
                            ? 'flex items-center gap-2 rounded-md bg-white/[0.08] px-3 py-2 text-white/75 transition-colors hover:bg-white/[0.15] hover:text-white'
                            : 'flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 transition-all hover:border-blue-600 hover:text-blue-600'
                    }
                    button={
                        <>
                            <Image src={`/assets/images/flags/${flagFor(i18n.language)}.svg`} alt={i18n.language} width={20} height={20} className="rounded-full object-cover" />
                            <span className="text-sm font-medium uppercase">{i18n.language}</span>
                            <IconCaretDown />
                        </>
                    }
                >
                    <ul className="grid w-[200px] grid-cols-1 gap-1 !px-2 py-2 font-medium">
                        {themeConfig.languageList.map((item: any) => (
                            <li key={item.code}>
                                <button
                                    type="button"
                                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-blue-50 hover:text-blue-600 ${
                                        i18n.language === item.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
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
