declare module 'swiper' {
    export * from 'swiper/types';
}

declare module 'swiper/react' {
    import { SwiperOptions } from 'swiper/types';

    export interface SwiperProps extends SwiperOptions {
        children?: React.ReactNode;
        className?: string;
    }

    export const Swiper: React.FC<SwiperProps>;
    export const SwiperSlide: React.FC<{ children?: React.ReactNode; className?: string }>;
}

declare module 'swiper/modules' {
    export const Navigation: any;
    export const Pagination: any;
    export const Autoplay: any;
    export const Scrollbar: any;
    export const EffectFade: any;
}

declare module 'swiper/css' {
    const content: any;
    export default content;
}

declare module 'swiper/css/navigation' {
    const content: any;
    export default content;
}

declare module 'swiper/css/pagination' {
    const content: any;
    export default content;
}
