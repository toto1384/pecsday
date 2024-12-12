import React, { ReactNode, useState, useRef } from "react"
import { IconType } from "react-icons"
import Spinner from "react-spinner-material"
import { FormInputError } from "./formInputError"


export type ButtonType = 'btn-primary' | 'btn-secondary' | 'btn-primary-text' | 'btn-secondary-text' | 'btn-danger' | 'btn-base'

export function ButtonWError(
    {
        onClick, children, buttonType = 'btn-primary', className, error, type, disabled, loading, form, errors, id, icon, "data-cy": dataCy,
        ariaLabel, "data-company-saved": dataCompanySaved
    }:
        {
            onClick?: (event: any) => void, children: ReactNode, buttonType?: ButtonType, className?: string, error?: string, ariaLabel?: string
            type?: 'submit' | 'reset' | 'button', disabled?: boolean, loading?: boolean, form?: string, errors?: any, id?: string, icon?: IconType, "data-cy"?: string,
            'data-company-saved'?: string
        }
) {
    const [isLoading, setIsLoading] = useState(false)
    const isAsync = onClick?.constructor.name === 'AsyncFunction'
    const ref = useRef<any>()

    const errorT = error ?? (errors ? (Object.keys(errors).length !== 0 ? "Complete Form" : undefined) : undefined)

    const button = <button role="button" aria-label={ariaLabel} form={form} id={id} data-cy={dataCy} data-company-saved={dataCompanySaved} disabled={disabled} onClick={async (e) => {
        if (!onClick) return

        if (isAsync) {
            setIsLoading(true)
            await onClick(e)
            setIsLoading(false)
        } else onClick(e)
    }} ref={ref} type={type} className={`${buttonType} ${className} flex justify-center w-fit px-0 ${icon ? `pl-2` : 'pl-4'} pr-4`}>
        <div className='flex transition-all flex-row w-fit text-center items-center'>
            {icon && React.createElement(icon, { className: 'w-5 mr-1 h-5' })}
            <div className='line-clamp-1 pointer-events-none text-center'>{children}</div>
            {(isAsync || loading) && <Spinner visible={loading || isLoading} className='ml-2' stroke={3} radius={20} color={(typeof window !== 'undefined' && ref.current) ? window.getComputedStyle(ref.current).getPropertyValue('color') : '#fff'} />}
        </div>
    </button>

    if (!errorT) return button

    return <div className='flex w-fit flex-col items-center justify-center'>
        {button}
        <FormInputError error={errorT} />
    </div>
}