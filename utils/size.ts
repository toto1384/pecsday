import { useEffect, useState } from "react";
export type Size = "sm" | "md" | "lg" | "xl" | 'xs'

export const useSize = <T extends boolean | undefined>(rich?: T): (T extends true ? {
    size: Size, lmd: boolean, llg: boolean, gmd: boolean, gsm: boolean,
} : Size) => {
    const [size, setWindowDimensions] = useState<Size>('sm');
    useEffect(() => {
        function handleResize(): void {
            if (window.innerWidth >= 1280) {
                setWindowDimensions('xl')
            } else if (window.innerWidth >= 1024) {
                setWindowDimensions('lg')
            } else if (window.innerWidth >= 768) {
                setWindowDimensions('md')
            } else if (window.innerWidth >= 600) {
                setWindowDimensions('sm')
            } else {
                setWindowDimensions('xs')
            }
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return (): void => window.removeEventListener('resize', handleResize);
    }, []); // Empty array ensures that effect is only run on mount

    return rich ? {
        size,
        lmd: size === 'xs' || size === 'sm',
        llg: size === 'xs' || size === 'sm' || size === 'md',
        gmd: size === 'lg' || size === 'xl',
        gsm: size !== 'xs' && size !== 'sm'
    } : size as any;
};