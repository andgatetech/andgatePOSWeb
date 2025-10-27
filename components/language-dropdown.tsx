// 'use client';
// import Dropdown from '@/components/dropdown';
// import IconCaretDown from '@/components/icon/icon-caret-down';
// import { getTranslation } from '@/i18n';
// import { IRootState } from '@/store';
// import { toggleRTL } from '@/store/themeConfigSlice';
// import { useRouter } from 'next/navigation';
// import { useDispatch, useSelector } from 'react-redux';

// interface LanguageDropdownProps {
//     className?: string;
// }

// const LanguageDropdown = ({ className = '' }: LanguageDropdownProps) => {
//     const dispatch = useDispatch();
//     const router = useRouter();
//     const { i18n } = getTranslation();

//     const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

//     const themeConfig = useSelector((state: IRootState) => state.themeConfig);
//     const setLocale = (flag: string) => {
//         if (flag.toLowerCase() === 'ae') {
//             dispatch(toggleRTL('rtl'));
//         } else {
//             dispatch(toggleRTL('ltr'));
//         }
//         router.refresh();
//     };

//     return (
//         <div className={`dropdown ${className}`}>
//             {i18n.language && (
//                 <Dropdown
//                     offset={[0, 8]}
//                     placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
//                     btnClassName="flex items-center gap-2.5 rounded-lg border border-white-dark/30 bg-white px-2 py-1.5 text-white-dark hover:border-primary hover:text-primary dark:bg-black"
//                     button={
//                         <>
//                             <div>
//                                 <img src={`/assets/images/flags/${i18n.language.toUpperCase()}.svg`} alt="image" className="h-5 w-5 rounded-full object-cover" />
//                             </div>
//                             <div className="text-base font-bold uppercase">{i18n.language}</div>
//                             <span className="shrink-0">
//                                 <IconCaretDown />
//                             </span>
//                         </>
//                     }
//                 >
//                     <ul className="grid w-[280px] grid-cols-2 gap-2 !px-2 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
//                         {themeConfig.languageList.map((item: any) => {
//                             return (
//                                 <li key={item.code}>
//                                     <button
//                                         type="button"
//                                         className={`flex w-full rounded-lg hover:text-primary ${i18n.language === item.code ? 'bg-primary/10 text-primary' : ''}`}
//                                         onClick={() => {
//                                             i18n.changeLanguage(item.code);
//                                             setLocale(item.code);
//                                         }}
//                                     >
//                                         <img src={`/assets/images/flags/${item.code.toUpperCase()}.svg`} alt="flag" className="h-5 w-5 rounded-full object-cover" />
//                                         <span className="ltr:ml-3 rtl:mr-3">{item.name}</span>
//                                     </button>
//                                 </li>
//                             );
//                         })}
//                     </ul>
//                 </Dropdown>
//             )}
//         </div>
//     );
// };

// export default LanguageDropdown;

'use client';
import Dropdown from '@/components/dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';
import { getTranslation } from '@/i18n';
import { IRootState } from '@/store';
import { toggleRTL } from '@/store/themeConfigSlice';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

interface LanguageDropdownProps {
    className?: string;
}

const LanguageDropdown = ({ className = '' }: LanguageDropdownProps) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { i18n } = getTranslation();

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);

    const setLocale = (flag: string) => {
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
        router.refresh();
    };

    return (
        <div className={`dropdown ${className}`}>
            {i18n.language && (
                <Dropdown
                    offset={[0, 8]}
                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                    btnClassName="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-700 transition-all hover:border-blue-600 hover:text-blue-600"
                    button={
                        <>
                            <img src={`/assets/images/flags/${i18n.language.toUpperCase()}.svg`} alt={i18n.language} className="h-5 w-5 rounded-full object-cover" />
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
                                    onClick={() => {
                                        i18n.changeLanguage(item.code);
                                        setLocale(item.code);
                                    }}
                                >
                                    <img src={`/assets/images/flags/${item.code.toUpperCase()}.svg`} alt={item.name} className="h-5 w-5 rounded-full object-cover" />
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
