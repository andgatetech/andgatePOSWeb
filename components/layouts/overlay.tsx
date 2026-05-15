'use client';
import { RootState } from '@/store';
import { toggleSidebar } from '@/store/themeConfigSlice';
import { useDispatch, useSelector } from 'react-redux';

const Overlay = () => {
    const themeConfig = useSelector((state: RootState) => state.themeConfig);
    const dispatch = useDispatch();
    const isOpen = themeConfig.sidebar;

    return (
        <div
            className={`fixed inset-0 z-[55] bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
                isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
            }`}
            onClick={() => dispatch(toggleSidebar())}
        />
    );
};

export default Overlay;
