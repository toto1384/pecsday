import { ReactNode } from "react"
import { MdWarning } from "react-icons/md"


export function FormInputError(props: { error?: ReactNode, errors?: any, color?: string, className?: string, dataCy?: string }) {
    let translatedError = props.error
    // if (props.error?.toString().includes('maximum-years')) {
    //     translatedError = languageObject.skillsScreenString.maxYears(props.error.toString().split(' ')[1])
    // }


    // if (props.error?.toString().includes(periodDifferenceErrorMaxIdentifier)) {
    //     translatedError = languageObject.globalStrings.maxYearsPeriod(props.error.toString().split(' ')[1])
    // }

    // if (props.error?.toString().includes(periodDifferenceErrorNegativeString)) {
    //     translatedError = languageObject.globalStrings.negativePeriod
    // }
    // if (/Expected.+received null/.test(props.error?.toString() ?? '')) {
    //     translatedError = languageObject.globalStrings.requiredField;
    // }

    // switch (props.error) {
    //     case 'Required': translatedError = languageObject.globalStrings.requiredField; break;
    //     case 'nonempty': translatedError = languageObject.globalStrings.requiredField; break;
    //     case youMustBe18Text: translatedError = languageObject.globalStrings.youMustBe18; break;
    //     case youCantBeThisOld: translatedError = languageObject.globalStrings.youCantBeThisOld; break;
    // }



    return translatedError ?
        <div role='alert' data-cy={props.dataCy} className={`${props.color ?? 'text-red-800'} flex flex-row items-center w-fit ${props.className}`}>
            <div className="w-4 h-4 mr-2"> <MdWarning /> </div>
            {translatedError ? translatedError : (props.errors ? (Object.keys(props.errors).length !== 0 ? 'Complete form' : undefined) : undefined)}
        </div> :
        <></>
}