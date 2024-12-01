import { z } from "zod"
import { passwordStrength } from "./passwordUtils"


export const PasswordSchema = z.custom((value) => {
    if (typeof value !== 'string') return false
    const { message, score } = passwordStrength(value)
    if (score != 100) {
        return false//helper.message({ custom: message })
    } else {
        return true
    }

},)

export function FrontEndRegisterSchema() {
    return z.object({
        email: z.string().email(),
        password: PasswordSchema.optional(),
        // password:Joi.string().required(),
        termsAndConditions: z.literal(true, {
            // invalid_type_error: (languageObject ?? languageEn).registerScreenStrings.errorMessages.termsAndConditions,
            // required_error: (languageObject ?? languageEn).registerScreenStrings.errorMessages.termsAndConditions,
            errorMap: (a, ctx) => {
                const message = 'Terms and Conditions are required'
                return ({ message: (a.code === 'invalid_literal' ? message : a.message ?? message) })
            }
        }),
        // location:Joi.array().items(LocationSchema).min(1).required()
    })
}

//backend validation for register. without the terms and conditions and with the type
export const BackendRegisterSchema = () => FrontEndRegisterSchema()


export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});