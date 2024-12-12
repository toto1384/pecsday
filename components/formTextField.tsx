
import { FieldValues, UseControllerProps, Controller } from "react-hook-form"
import { format, isDate } from "date-fns";
import { KeyboardEventHandler, ReactNode, useState } from "react";
import { maxWFields, paddingTextField } from "./globals";
import { FormInputError } from "./formInputError";
import Link from "next/link";

export interface MainTextFieldProps {
    type?: string
    name?: string
    children: React.ReactNode
    small?: boolean
    id?: string;
    autoFocus?: boolean
    "data-cy"?: string
    disableAnimation?: boolean
    disableAutoCapitalization?: boolean
    disableSuggestions?: boolean
    iconProps?: {
        icon?: React.ReactNode
        onIconClick?: (e: any) => void
        iconHref?: string
        disableHoverEffect?: boolean
    }
    disableSpellcheckAutoCorrect?: boolean
    className?: string
    events?: {
        onFocusChange?: (state: boolean, event: any) => void
        onClick?: () => void
        onTextChange?: (text: string) => void
        onKeyDown?: KeyboardEventHandler<HTMLInputElement>
    }
}


type TextFieldProps = MainTextFieldProps & {
    value?: any
    defaultValue?: any
    textFieldRef?: React.MutableRefObject<any>
    required?: boolean
    error?: string
}


//TEXT INPUT
//set the error with the ref.setError
export function TextField(
    {
        children, name, defaultValue, disableAnimation, disableSuggestions, iconProps = {}, disableSpellcheckAutoCorrect,
        events = {}, required, small, textFieldRef, type, value, error, className, id, "data-cy": dataCy, autoFocus, disableAutoCapitalization,
    }: TextFieldProps) {

    const { icon, onIconClick, iconHref, disableHoverEffect } = iconProps
    const { onClick, onFocusChange, onTextChange, onKeyDown } = events

    const [isFocused, setIsFocused] = useState(false)

    const iconn: ReactNode = <div
        onClick={(e) => {
            if (onIconClick !== null && (onIconClick instanceof Function)) onIconClick(e)
        }}
        className={`${disableHoverEffect ? '' : 'icon-button'} select-none flex items-center transition px-4 cursor-pointer`}
    >
        {icon}
    </div>;

    function turnToFormatedDateIfOrReturn(v: any) {
        if (type === 'date') {
            if ((defaultValue instanceof Date && !isNaN(defaultValue as any))) {
                //true date
                return format(v, 'yyyy-MM-dd')
            }
            if (isDate(v)) {
                return format(new Date(v), 'yyyy-MM-dd')
            }
        }
        return v
    }
    return (
        <div className={`flex group flex-col w-full text-gray-500 focus-within:text-black ${className} ${maxWFields}`}>
            {!disableAnimation && <label htmlFor={id ?? name} id={(id ?? name) + "LABEL"} > {children} </label>}
            <div className="flex border border-gray-300 focus-within:border-black w-full cursor-text rounded">
                <input
                    className={[
                        `outline-none w-full text-black rounded bg-transparent transition-all duration-200 ease-in-out ${paddingTextField.x} ${paddingTextField.y}`
                    ].join(" ")}
                    data-cy={dataCy}
                    autoCapitalize={disableAutoCapitalization ? "none" : undefined}
                    autoFocus={autoFocus}
                    id={id ?? name}
                    ref={textFieldRef}
                    name={name}
                    defaultValue={turnToFormatedDateIfOrReturn(defaultValue)}
                    onClick={onClick}
                    value={turnToFormatedDateIfOrReturn(value)}
                    onKeyDown={onKeyDown}
                    type={type ?? 'text'}
                    autoCorrect={disableSpellcheckAutoCorrect ? "off" : undefined}
                    spellCheck={disableSpellcheckAutoCorrect ? "false" : undefined}
                    required={required ?? false}
                    placeholder={disableAnimation ? (children as string) : undefined}
                    autoComplete={(disableSuggestions ?? false) ? "off" : undefined}
                    onChange={(e) => {
                        if (onTextChange) onTextChange(e.target.value)
                    }
                    }
                    onFocus={(e) => {
                        setIsFocused(true)
                        if (onFocusChange != undefined) onFocusChange(true, e)
                    }}
                    onBlur={(e) => {
                        setIsFocused(false)
                        if (type === 'url') {
                            let string = e.target.value;
                            if (!~string.indexOf("http") && /.+\..+/.test(string)) {
                                string = "https://" + string;
                            }
                            e.target.value = string;
                        }
                        if (onFocusChange != undefined) onFocusChange(false, e)
                    }}
                />

                {icon !== undefined ? (iconHref !== undefined ? <Link href={iconHref ?? '/'}>{iconn}</Link> : iconn) : null}
            </div>
            <FormInputError error={error} />
        </div>

    );
}




// asvalue is used when in a popup
export function FormTextField<T extends FieldValues>(props: MainTextFieldProps & UseControllerProps<T> & { asValue?: boolean, id?: string, asString?: boolean, emptyNull?: boolean }) {
    return <Controller
        name={props.name}
        control={props.control}
        render={({ field: { onChange, value, name, ref }, fieldState: { error } }) => {
            return <TextField
                disableAutoCapitalization={props.disableAutoCapitalization}
                error={error?.message} textFieldRef={ref as any} disableSuggestions={props.disableSuggestions} type={props.type} small={props.small} name={name}
                defaultValue={props.asValue ? undefined : value ?? ''}
                value={props.asValue ? value ?? '' : undefined}
                data-cy={props['data-cy'] ?? `tf-${props.name}`}
                events={{
                    ...props.events,
                    onTextChange: (e) => {
                        if (props.events?.onTextChange) props.events.onTextChange(e)
                        const valueToChange = e === '' ? props.emptyNull ? null : undefined : ((props.type === 'number' && !props.asString) ? Number(e) : e)
                        onChange(valueToChange)
                    }
                }}
                id={props.id}
                iconProps={props.iconProps}
                className={props.className}
                disableAnimation={props.disableAnimation}
                autoFocus={props.autoFocus}
                disableSpellcheckAutoCorrect={props.disableSpellcheckAutoCorrect}
            >{props.children}</TextField>
        }}
    />
}