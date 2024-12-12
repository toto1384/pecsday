
import { ReactNode } from "react"
import { FieldValues, UseControllerProps, useWatch, Controller } from "react-hook-form"
import { MdCheckCircle, MdRadioButtonUnchecked } from "react-icons/md";
import { FormInputError } from "./formInputError";


export function FormCheckbox<T extends FieldValues>(props: UseControllerProps<T> & { children: ReactNode | string, className?: string, "data-cy"?: string }) {
    const val = useWatch({ control: props.control, name: props.name })
    return <Controller
        name={props.name}
        control={props.control}
        defaultValue={val as any ?? false}
        render={({ field: { onChange, value, ref }, fieldState: { error } }) =>
            <div>
                <Checkbox
                    data-cy={props['data-cy'] ?? `ch-${props.name}`}
                    className={props.className} checked={value}
                    onCheck={onChange} error={error?.message} inputRef={ref}
                >{props.children}</Checkbox>
            </div>
        }
    />
}


export function Checkbox(props: { checked: boolean, onCheck: (val: boolean, e: any) => void, children: React.ReactNode, error?: string, className?: string, "data-cy"?: string, inputRef?: any }) {
    return (
        <>
            <div className={`flex items-center select-none ${props.className}`} data-cy={props['data-cy']} role="checkbox" aria-checked={props.checked} onKeyPress={(e) => {
                if (e.key === "Enter") {
                    (e.target as any).click()
                }
            }} tabIndex={0} onClick={(e) => { e.stopPropagation(); props.onCheck(!props.checked, e) }}>
                <div ref={props.inputRef} data-cy={`checkbox-${props['data-cy']}`} className='w-7 flex items-center'>
                    {props.checked ?
                        <MdCheckCircle className="w-7 cursor-pointer icon-button h-7 text-[color:var(--primary)]" /> :
                        <MdRadioButtonUnchecked className="w-7 icon-button cursor-pointer h-7 text-gray-300" />}
                </div>
                <label className="px-2 cursor-pointer" htmlFor="">{props.children}</label>
            </div>
            <FormInputError error={props.error} />
        </>
    )
}