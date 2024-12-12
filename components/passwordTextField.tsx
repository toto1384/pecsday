import { useState } from "react"
import { FieldValues, UseControllerProps, Controller } from "react-hook-form"
import { IoMdEyeOff, IoMdEye } from "react-icons/io"
import { passwordStrength } from "../utils/passwordUtils";
import { TextField } from "./formTextField";
import { ProgressBar } from "./progressBar";


export function PasswordTextField<T extends FieldValues>(props: UseControllerProps<T> & { disableErrors?: boolean, children: JSX.Element | string, defaultValue?: string, small?: boolean }) {
    const [password, setPassword] = useState(props.defaultValue ?? '')

    const [seePassword, setSeePassword] = useState(false)

    return <Controller
        name={props.name}
        control={props.control}
        defaultValue={props.defaultValue}
        render={({ field: { onChange, value, name, ref }, fieldState: { error } }) =>
            <div className={'space-y-2'}>
                <TextField
                    // error={props.disableErrors === true ? "" : error?.message} 
                    disableSuggestions type={seePassword ? 'text' : 'password'} small={props.small} name={name} value={value ?? ''} textFieldRef={ref as any}
                    data-cy={`tf-${props.name}`}
                    events={{
                        onTextChange: (e) => {
                            // console.log(`pass ${value}`)
                            onChange(e)
                            setPassword(e)
                        }
                    }}
                    iconProps={{
                        icon: seePassword ? <IoMdEyeOff className={'w-5 h-5'} /> : <IoMdEye className={'w-5 h-5'} />,
                        onIconClick: () => {
                            setSeePassword(!seePassword)
                        }
                    }}
                >{props.children}</TextField>
                {!props.disableErrors && <PasswordStrengthMeter showMessage={error?.message != undefined} password={password} />}
            </div>
        }
    />
}


export function PasswordStrengthMeter({ password, showMessage = false }: { password: string, showMessage?: boolean }) {
    const { message, score } = passwordStrength(password)
    let color
    switch (score) {
        case 0:
        case 20:
            color = 'var(--red)';
            break
        case 40:
            color = 'var(--orange)';
            break
        case 60:
        case 80:
            color = 'var(--yellow)';
            break
        default:
            color = 'var(--green)';
            break
    }

    return <div className="w-full">
        <div className="flex items-center">
            <ProgressBar percent={score} color={color} />
        </div>
        {(showMessage && score !== 100) && <p className={`text-ellipsis text-[color:${color}] text-red-800`}>
            {message}
        </p>
        }
    </div>
}


