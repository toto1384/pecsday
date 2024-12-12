
import Link from "next/link"
import React, { ReactNode } from "react"
import { IconType } from "react-icons"


export const DropdownOption = (
    { icon, text, onClick, className, iconClassName, rightComponent, dataCy, alternativeIcon, href }:
        {
            icon?: IconType | string, text: string, className?: string, alternativeIcon?: ReactNode,
            onClick?: (e: any) => void, iconClassName?: string, rightComponent?: ReactNode, dataCy?: string, href?: string
        }
) => {
    const props = {
        onClick: onClick, "data-cy": dataCy, className: "flex cursor-pointer flex-row items-center rounded px-3 py-3 justify-between hover:bg-gray-200 " + className, href
    }

    return React.createElement(href ? Link : 'div', {
        ...props as any,
    }, <>
        <div className="flex flex-row items-center space-x-3">
            {alternativeIcon ?? (icon && ((typeof icon === 'string') ? <p className="p-1 text-2xl">{icon}</p> : React.createElement(icon, { className: `w-5 h-5 ${iconClassName}` })))}
            <p>{text}</p>
        </div>
        {rightComponent && rightComponent}
    </>)

}