import { CSSProperties, ReactNode } from "react";


export function CenteredCardPage(
    { children, bottom, fullOnMobile = true, appBar, maxSize, className, width, bgImageStyle: style, style: cardStyle, bgImageClassName, sameWidthBottom, bgImageTint }:
        { children: ReactNode, fullOnMobile?: boolean, bottom?: ReactNode, appBar: ReactNode, maxSize?: `max-w-${number}xl`, className?: string, width?: string, bgImageStyle?: CSSProperties, bgImageClassName?: string, sameWidthBottom?: boolean, style?: CSSProperties, bgImageTint?: boolean }
) {

    const widthClassName = `md:min-h-fit md:min-w-[36rem]  ${width ?? 'md:w-fit'} md:mb-10 ${maxSize ?? 'max-w-4xl'} transition mx-auto`
    return (<div className="flex flex-col max-w-[100vw] justify-center items-center">
        <div className={`absolute top-0 z-0 ${bgImageClassName}`} style={style}></div>
        <div className={`top-0 z-30 w-full mb-0 md:mb-16`}>{appBar}</div>
        <div className={`w-full bg-white z-[5] rounded-none md:rounded-lg ${widthClassName} ${className}`} style={cardStyle}>
            <div className="px-4 relative pt-14 max-w-[100vw] md:px-12 md:pb-10 rounded-none md:rounded-lg">
                {children}
                {bgImageTint && <div className="bg-image-black-tint rounded-none md:rounded-lg"></div>}
                <div className="flex md:hidden my-5 items-center justify-center">{bottom}</div>
            </div>
        </div>
        {bottom && <div className={`hidden self-center md:flex my-5 bottom-5 ${sameWidthBottom && widthClassName}`}>{bottom}</div>}
    </div>)
}