import { differenceInMinutes, isBefore, parseISO } from "date-fns";
import { dbConnect, getUserModel } from "./db";
import { UserObject } from "./types"
import { V3 } from "paseto";
import { createPasetoTokenRaw } from "./tokensEncryption";

export function createPasetoToken(obj: { _id: string | undefined }) {
    return createPasetoTokenRaw(obj)
}

function instanceOfUserObject(object: any): object is UserObject {
    if (typeof object === 'string') return false
    return 'login' in object;
}

const differenceInMinutesForUpdate = 5

export async function protectApi(token: string | UserObject | undefined, opts?: { allowNotCompleted?: boolean, userProjectionAdditional?: string[], mandatoryVerified?: boolean, withPassword?: boolean }) {
    if (token == undefined) return { status: 401, message: errorMessages[401], error: true } as const
    if (instanceOfUserObject(token)) {
        //already registered

        return { user: token, status: 200, error: false } as const
    }

    //use the pasetoFunction to login the user, if fail return 401
    const { success, user, completeRegister } = await pasetoFunction(token as string, true, opts?.userProjectionAdditional, opts?.withPassword)
    if (!success || !user) return { status: 401, error: true, message: errorMessages[401] } as const

    const db = await dbConnect()
    const UserModel = getUserModel(db)
    if (!user.lastLoginDate || (differenceInMinutes(new Date(Date.now()), new Date(user.lastLoginDate)) > differenceInMinutesForUpdate)) {
        await UserModel.updateOne({ _id: user._id }, { $set: { lastLoginDate: new Date(Date.now()) } })
    }

    // if (opts?.mandatoryVerified) {
    // 	if (!user?.verified) {
    // 		return { status: 437, message: errorMessages[437], error: true } as const
    // 	}
    // }
    if (!completeRegister) return opts?.allowNotCompleted ?
        { status: 200 as const, error: false as const, user } :
        { status: 433 as const, message: errorMessages[433], error: true as const, user }

    return { status: 200 as const, error: false as const, user }
}


export const errorMessages = {
    401: "You need to be authenticated first before accessing this endpoint",
    433: 'User did not completed the register setup',
    434: "User does not have access to this resource",
    437: 'User is not verified, please check your email',

}

export async function pasetoFunction(token: string | UserObject, queryUserObject?: boolean, userProjectionAdditional?: string[], withPassword?: boolean) {
    if (!token) {
        return { success: false }
    }

    try {
        if (typeof token === 'string') {
            const verified: any = await V3.decrypt(token as string, process.env.SECRET!)
            if (!verified) {
                return { success: false }
            }

            if (isBefore(parseISO(verified.exp), new Date(Date.now()))) {
                //token expired
                return { success: false }
            }

            /* initial projection, then filter them to include the $userProjectionAdditional */
            const projectionRaw = {
                favoriteCompanies: 0, favoriteCVs: 0, favoriteJobs: 0, options: 0, gender: 0, birthDate: 0, externalApplied: 0, ...(withPassword ? {} : { "login.password": 0 }), "login.googleId": 0, stripeCustomerId: 0
            } as const
            const projection = Object.keys(projectionRaw).filter(i => !(userProjectionAdditional ?? []).includes(i)).
                reduce((obj, key) => ({ ...obj, [key]: projectionRaw[key as keyof typeof projectionRaw] }), {})

            /* console.log(projection) */
            const db = await dbConnect()
            if (queryUserObject) {
                const UserModel = getUserModel(db)
                const user = await UserModel.findById(verified._id, projection).lean().exec()
                if (!user) return { success: false } as const
                return { user, success: true as const, }
            } else return { success: true as const, userId: verified._id, completeRegister: verified.c }
        } else return { success: true as const, user: token, userId: token._id, }
    } catch (err) {
        return { success: false as const, error: `${err}` }
    }
}