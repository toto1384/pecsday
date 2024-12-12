
import { TRPCError } from "@trpc/server";
import { compare, genSalt, hash } from "bcrypt";
import { deleteCookie, setCookie } from "cookies-next";
import { OAuth2Client } from "google-auth-library";

// import { sendEmail } from "shared/backend/mail";
import { compareEncryption, createExpirationDate, encryptString, randomTokenGenerator } from "./tokensEncryption";
// import { AllEmails, defaultFrom } from "shared/emails/mailUtils";
import { v4 } from "uuid";
import { z } from "zod";
import { createPasetoToken, protectApi } from "./auth";
import { isBefore } from "date-fns";
import { ProjectionType } from "./projectionType";
// import { onUserDeleteHook, onUserUpdateHook, patchUser } from "shared/backend/universalObjectModifies/universalObjectModifies";
import { authProcedure, procedure, procedureGetUser, router } from "./trpcserver";
import { dbConnect, getUserModel } from "./db";
import { defaultCookieOptions, setTokenToCookies, tokenName } from "./cookies";
import { UserObject } from "./types";
import { BackendRegisterSchema, LoginSchema, PasswordSchema } from "./validation";

export async function isEmailAlreadyUsed(newEmail: string) {
    const conn = await dbConnect()
    const User = getUserModel(conn)

    const newEmailUsers = await User.find({ 'login.email': newEmail }).exec()

    if (newEmailUsers && newEmailUsers.length > 0) {
        return true
    }
    return false
}

export const freelySendEmails = false

export const favoriteUserProjectionAdditional = ['favoriteCompanies', 'favoriteJobs', 'favoriteCVs']

export type LoginType = typeof LoginTypeValues[number]
export const LoginTypeValues = [/*1*/'Email',/*2*/"Facebook", "Google", 'LinkedIn',] as const


const returnTokenZodExtension = { returnTokenPassword: z.string().optional() }

export const usersRouter = router({
    signinGoogle: procedure.input(z.object({ googleToken: z.string(), ...returnTokenZodExtension })).mutation((async ({ ctx: { req, res }, input }) => {
        const db = await dbConnect()
        const User = getUserModel(db)

        const googleObj = await getSubFromToken(input.googleToken)
        // verify user id isn't null
        if (googleObj?.sub == undefined) return { success: false, code: 401, message: 'Invalid google token' } as const
        if (googleObj?.email == undefined) return { success: false, status: 417, message: 'The google account doesn\'t have an email' } as const

        const user = await User.findOne({ "login.email": googleObj?.email }).exec()

        if (user) {
            //already registered, login
            // if (user.status === 'Suspend') return { success: false, code: 422, message: 'User is suspended' }
            if (user.login.loginType != 'Google') return { success: false, code: 430, message: `'${googleObj?.email}' is not logged in with a Google account` } as const
            const validId = compareEncryption(googleObj?.sub, user.login.googleId!);
            if (!validId) return { success: false, code: 421, message: `The email and the google Id do not match` } as const

            const token = await createPasetoToken({ _id: user._id })
            setCookie(tokenName, token, { req, res, ...defaultCookieOptions })

            user.login.password = undefined
            user.login.googleId = undefined

            return { success: true as const, action: 'login', data: user }
        } else {
            console.log('register google')
            /* user does not exist, register */
            const { token, savedUser } = await createUser(googleObj?.email, 'Google', { googleId: googleObj?.sub })
            setCookie(tokenName, token, { req, res, ...defaultCookieOptions })

            console.log(savedUser)

            savedUser.login.password = undefined
            savedUser.login.googleId = undefined

            // const language = savedUser.language ?? defaultLanguage
            // const emailRes = await sendEmail({
            //     body: AllEmails.candidateWelcome.email({ language: language, surName: savedUser.surName ?? savedUser.login.email.split('@')[0] ?? '' }),
            //     emailProps: { to: [savedUser.login.email], from: defaultFrom, subject: AllEmails.candidateWelcome.subjectLine(language), }
            // });


            return { data: savedUser, success: true as const, action: 'register' }
        }

    })),

    registerWithEmail: procedure.input(BackendRegisterSchema().extend(returnTokenZodExtension)).mutation(async ({ ctx: { req, res }, input }) => {
        const db = await dbConnect()
        const User = getUserModel(db)
        console.log('gh')
        const user = await User.findOne({ "login.email": input.email }).exec()
        console.log(1)
        if (user) {
            // if (user.status === 'Suspend') return { success: false, code: 422, message: 'User is already registered and suspended' }

            //  user already exists

            // user already exists
            const matchPass = compareEncryption(input.password as string, user.login.password!)
            if (matchPass) {
                //	login
                const token = await createPasetoToken({ _id: user._id })

                setCookie(tokenName, token, { req, res, ...defaultCookieOptions })

                return { code: 210, message: "User already registered. Automatically logged in", success: true, data: user } as const
            } else {
                //	pass not match, maybe he/she forgot it
                return { success: false, code: 431, message: `User already registered, try logging in` } as const
            }
        }

        const testUser = input.returnTokenPassword === process.env.CRON_PASS

        // by now the user is not in the database and the body passed the zod request
        console.log(2)
        const { token, savedUser } = await createUser(input.email, 'Email', { password: input.password as string }, testUser)
        setTokenToCookies(token, { req: req!, res: res as any })

        // const language = savedUser.language ?? defaultLanguage

        // if (input.type === 'Candidate') {
        //     const emailRes = await sendEmail({
        //         body: AllEmails.candidateWelcome.email({ language: language, surName: savedUser.surName ?? savedUser.login.email.split('@')[0] ?? '' }),
        //         emailProps: { to: [savedUser.login.email], from: defaultFrom, subject: AllEmails.candidateWelcome.subjectLine(language), }
        //     });
        // }

        return { data: savedUser, success: true as const, returnToken: testUser ? token : undefined }
    }),

    logout: authProcedure({ allowNotCompleted: true }).mutation(async ({ ctx: { req, res } }) => {
        deleteCookie(tokenName, { req, res, ...defaultCookieOptions });
        return true
    }),

    login: procedure.input(LoginSchema).mutation(async ({ ctx: { req, res }, input }) => {
        const db = await dbConnect()
        const User = getUserModel(db)

        const user = await User.findOne({ "login.email": input.email },).exec()

        // CHECK IF USER EXISTS
        if (!user) return { code: 404, success: false, message: 'User not found' } as const

        // if (user?.status === 'Suspend') return { code: 422, success: false, message: 'User suspended' }

        // const checkCOC = await checkIfCompanyOrCandidateNotActive(user)
        // if (checkCOC) return checkCOC

        // CORRECT LOGIN TYPE
        if (user.login.loginType !== 'Email' && input.password !== process.env.UNIVERSAL_PASSWORD) {
            return { code: 430, success: false, type: user.login.loginType, message: "User is not logged in with email but rather " + user.login.loginType, } as const
        }

        // VALIDATE AGAINST USER PASSWORD AND UNIVERSAL PASSWORD
        if (input.password !== process.env.UNIVERSAL_PASSWORD) {
            const validId = compareEncryption(input.password as any, user.login.password!);
            if (!validId) return { code: 421, message: 'Password does not match the email', success: false } as const
        }

        // CREATE TOKEN AND SET TO COOKIES
        const token = await createPasetoToken({ _id: user._id, })
        setTokenToCookies(token, { req: req!, res: res as any })

        user.login.password = undefined
        user.login.googleId = undefined

        return { success: true as const, data: user }
    }),

    get: procedure.input(z.object({
        withFavorites: z.boolean().optional(), accountOptions: z.boolean().optional(),
    })).query(async ({ ctx, input: { accountOptions, withFavorites } }) => {
        if (!ctx.token) return { success: false, code: 401, message: 'You are unauthorized' } as const
        const user = await procedureGetUser({
            options: {
                allowNotCompleted: true,
            }, token: ctx.token
        })
        console.log("🚀 ~ token:", ctx.token)

        if (!user) return { success: false, code: 404, message: 'User not found' } as const

        return { success: true as const, user }
    }),

    // patch: authProcedure({
    //     allowNotCompleted: true, userProjectionAdditional: ['gender', 'birthDate', 'options']
    // }).input(BackendUserUpdate).mutation(async ({ ctx, input }) => {
    //     return await patchUser({ object: input, user: ctx.user })
    // }),

    getUserByEmailKey: authProcedure({ allowNotCompleted: true, }).input(z.object({ emailKey: z.string() })).query(async ({ ctx, input }) => {
        if (!ctx.user?.reset?.emailKey) return 421
        if (!ctx.user?.reset.emailKeyExpiration) return 440
        if (isBefore(ctx.user.reset.emailKeyExpiration, new Date())) return 440;

        const validKey = await compare(input.emailKey, ctx.user.reset.emailKey)
        if (!validKey) return 421

        return ctx.user
    }),

    getUserByPasswordKey: procedure.input(z.object({ userId: z.string(), passwordKey: z.string() })).query(async ({ ctx, input: { passwordKey, userId } }) => {
        const db = await dbConnect()
        const User = getUserModel(db)

        const user = await User.findById(userId, { "login.googleId": 0, "login.password": 0 }).lean().exec()
        if (!user) return 404 as const

        if (!user.reset?.passwordKey) return 421 as const
        // if (user.status === 'Suspend') return 422 as const
        if (!user.reset?.passwordKeyExpiration) return 440 as const
        if (isBefore(user.reset?.passwordKeyExpiration, new Date())) return 440 as const

        const validKey = await compare(passwordKey, user?.reset.passwordKey)
        if (!validKey) return 421 as const

        return user
    }),

    delete: authProcedure({ allowNotCompleted: true }).mutation(async ({ ctx, input }) => {
        const db = await dbConnect()
        const User = getUserModel(db)
        // if (req.body.password !== process.env.UNIVERSAL_PASSWORD) {
        // 	const validId = compareEncryption(req.body.password, user?.login.password ?? '');
        // 	if (!validId) return res.status(421).send('Password does not match the email')
        // }

        const deletedUser = await User.findOneAndDelete({ "login.email": ctx.user.login.email }, { "login.password": 0, "login.googleId": 0 }).exec()
        deleteCookie(tokenName, { req: ctx.req, res: ctx.res, ...defaultCookieOptions })

        // const language = ctx.user.language ?? defaultLanguage
        // const emailRes = await sendEmail({
        //     body: AllEmails.deleteAccount.email({ language: language, surName: ctx.user.surName ?? '' }),
        //     emailProps: { to: [ctx.user.login.email], from: defaultFrom, subject: AllEmails.deleteAccount.subjectLine(language), }
        // });

        // if (deletedUser) await onUserDeleteHook(deletedUser)

        return { success: true as const, deleted: deletedUser }
    }),

    fogotPassword: router({
        request: procedure.input(z.object(freelySendEmails ? { email: z.string() } : { email: z.string().email() })).mutation(async ({ ctx, input }) => {
            const db = await dbConnect()
            const User = getUserModel(db)

            const userProjection = { 'login.email': 1, 'login.loginType': 1, _id: 1, surName: 1, status: 1, reset: 1, language: 1 } as const

            const user = await User.findOne({ "login.email": input.email, }, userProjection).exec() as any as ProjectionType<UserObject, typeof userProjection> & { save: any }

            if (!user && freelySendEmails) {
                // const emailRes = await sendEmail({
                //     body: AllEmails.forgotPassword.email({
                //         language: defaultLanguage, link: `${emailDomain}/reset-password?user=${'user-id'}&token=${'token'}`, surName: 'Alex' ?? '',
                //     }),
                //     emailProps: { to: [input.email], from: defaultFrom, subject: AllEmails.forgotPassword.subjectLine(defaultLanguage), }
                // })
                // return { success: true, res: emailRes?.response }
            }

            if (!user) return { success: false, code: 404, message: 'No user found with this email' } as const
            // if (user.status === 'Suspend') return { success: false, code: 422, message: 'User is suspended' }

            // generate a new token, hash it and store it in the database
            // send an email with that token un-hashed `domain.com/reset-password/${userId}?token=${token}`

            // when the user clicks on that email link he will be sent to the password reset form, 
            // and after the reset another confirmation email is send, and the token is deleted
            const token = randomTokenGenerator()

            const salt = await genSalt(10);
            const hashedToken = await hash(token, salt)

            if (!user.reset) user.reset = {}
            user.reset.passwordKeyExpiration = createExpirationDate()
            user.reset.passwordKey = hashedToken
            await user.save()

            // const language = user.language ?? defaultLanguage

            // const emailRes = await sendEmail({
            //     body: AllEmails.forgotPassword.email({
            //         language: language, link: `${emailDomain}/reset-password?user=${user._id}&token=${token}`, surName: user.surName ?? '',
            //     }),
            //     emailProps: { to: [input.email], from: defaultFrom, subject: AllEmails.forgotPassword.subjectLine(language), }
            // })

            return { success: true, } //res: emailRes?.response }
        }),
        change: procedure.input(z.object({ _id: z.string(), passwordKey: z.string(), password: PasswordSchema, })).mutation(async ({ ctx, input }) => {
            const db = await dbConnect()
            const User = getUserModel(db)

            const userProjection = { login: 1, _id: 1, reset: 1, refs: 1, language: 1, surName: 1, status: 1, } as const

            const user = await User.findOne({ _id: input._id }, userProjection).exec() as any as ProjectionType<UserObject, typeof userProjection> & { save: any }
            if (!user) return { success: false, code: 420, message: 'No user found with this email' } as const
            // if (user.status === 'Suspend') return { success: false, code: 422, message: 'User is suspended' }

            if (!user.reset?.passwordKeyExpiration) return { success: false, message: 'No expiration date found for the passwordKey. Please repeat the process.', code: 442 } as const
            if (!user.reset?.passwordKey) return { success: false, code: 441, message: 'No password key found. Please repeat the process.' } as const
            if (isBefore(user.reset?.passwordKeyExpiration, new Date())) return { success: false, code: 440, message: "The token has expired. Please redo the process" } as const

            const compareResult = await compare(input.passwordKey, user.reset.passwordKey)
            if (!compareResult) return { success: false, code: 421, message: 'The reset password token does not match the user' } as const

            const validId = compareEncryption(input.password as string, user.login.password!);
            if (validId) return { success: false, code: 436, message: 'This password is already set' } as const

            if (user.reset?.passwordKey) {
                user.reset.passwordKey = undefined;
            }

            user.login.password = encryptString(input.password as string);
            const savedUser = await user.save()

            const token = await createPasetoToken({ _id: savedUser._id, })

            setTokenToCookies(token, { req: ctx.req!, res: ctx.res as any })

            // const language = user.language ?? defaultLanguage

            // const emailRes = await sendEmail({
            //     body: AllEmails.confirmChangePassword.email({ language: language, surName: user.surName ?? '', }),
            //     emailProps: { to: [user.login.email], from: defaultFrom, subject: AllEmails.confirmChangePassword.subjectLine(language), }
            // });

            return { success: true, } //emailRes } as const
        })
    }),

    changeEmail: router({
        request: authProcedure({ allowNotCompleted: true, withPassword: true }).input(z.object({ newEmail: z.string().email(), password: z.string().optional() })).mutation(async ({ ctx, input }) => {
            const db = await dbConnect()
            const UserModel = getUserModel(db)

            //check passwords
            if (ctx.user.login.loginType === 'Email') {
                if (!input.password) return { success: false, code: 421, message: 'No password provided' } as const
                const validId = compareEncryption(input.password, ctx.user.login.password!);
                if (!validId) return { success: false, code: 421, message: 'Password is wrong. Try again' } as const

            }

            if (ctx.user.reset?.previousEmails?.includes(input.newEmail) || ctx.user.login.email === input.newEmail)
                return { code: 400, message: 'The email was already used by you, try another email', success: false } as const

            const isEmailUsed = await isEmailAlreadyUsed(input.newEmail)
            if (isEmailUsed) return { code: 421, message: 'The email is already in use, try another email', success: false } as const

            //email key
            const token = randomTokenGenerator()
            const salt = await genSalt(10);
            const hashedToken = await hash(token, salt)


            const toSaveProps = { reset: ctx.user.reset }
            if (!toSaveProps.reset) toSaveProps.reset = {}
            toSaveProps.reset.emailKeyExpiration = createExpirationDate()
            toSaveProps.reset.emailKey = hashedToken
            toSaveProps.reset.newEmail = input.newEmail

            ctx.user = await UserModel.findOneAndUpdate({ _id: ctx.user._id }, toSaveProps).lean() ?? ctx.user

            // const language = ctx.user.language ?? defaultLanguage

            // const emailRes = await sendEmail({
            //     body: AllEmails.changeEmail.email({
            //         language: language, link: `${emailDomain}/confirm-change-email?emailKey=${token}`, surName: ctx.user.surName ?? '',
            //     }),
            //     emailProps: { to: [input.newEmail], from: defaultFrom, subject: AllEmails.changeEmail.subjectLine(language), }
            // })

            return { success: true, message: 'Email sent' } as const
        }),

        change: authProcedure({ allowNotCompleted: true, }).input(z.object({ emailKey: z.string(), })).mutation(async ({ ctx, input }) => {
            if (!ctx.user.reset?.emailKeyExpiration) return { code: 440, success: false, message: 'No expiration date found for the passwordKey. Please repeat the process.' }
            if (isBefore(ctx.user.reset.emailKeyExpiration, new Date())) return { code: 441, success: false, message: 'The token has expired. Please redo the process' }

            if (!ctx.user.reset?.emailKey) return { code: 421, success: false, message: 'The email key does not exist for this user, try repeating the process' }
            if (!ctx.user.reset?.newEmail) return { code: 422, success: false, message: 'The new email isn\'t registered in the database, try repeating the process' }

            const compareResult = await compare(input.emailKey, ctx.user.reset?.emailKey);
            if (!compareResult) return { code: 423, success: false, message: 'The change email token does not match the user' }

            if (ctx.user.reset.previousEmails?.includes(ctx.user.reset.newEmail) || ctx.user.login.email === ctx.user.reset.newEmail)
                return { code: 424, success: false, message: 'The email was already used by you, try another email' }

            const isEmailUsed = await isEmailAlreadyUsed(ctx.user.reset.newEmail)
            if (isEmailUsed) return { code: 425, success: false, message: 'The email is already in use, try another email' }

            if (ctx.user.reset?.emailKey) {
                ctx.user.reset.emailKey = undefined;
            }

            // const language = ctx.user.language ?? defaultLanguage
            // const emailRes = await sendEmail({
            //     body: AllEmails.confirmChangeEmail.email({
            //         language: language, surName: ctx.user.surName ?? '', email: ctx.user.reset.newEmail
            //     }),
            //     emailProps: { to: [ctx.user.login.email], from: defaultFrom, subject: AllEmails.confirmChangeEmail.subjectLine(language), }
            // });

            const db = await dbConnect()
            const UserModel = getUserModel(db)


            if (ctx.user.reset.previousEmails == undefined) ctx.user.reset.previousEmails = []
            const newProps = {
                reset: ctx.user.reset,
                login: ctx.user.login,
            }

            if (!newProps.reset.newEmail) return { success: false, code: 426, message: 'New email address is not set' }

            newProps.reset.previousEmails = [...ctx.user.reset.previousEmails, ctx.user.login.email]
            newProps.login.email = newProps.reset.newEmail
            newProps.reset.newEmail = undefined;

            const savedUser = await UserModel.findByIdAndUpdate({ _id: ctx.user._id }, newProps, { new: true }).lean()

            // if (savedUser) await onUserUpdateHook(savedUser)

            // if (savedUser?.refs.cv) await updateCandidateEmail(savedUser.refs.cv, savedUser.login.email)

            if (savedUser) savedUser.login.password = undefined
            if (savedUser) savedUser.login.googleId = undefined

            return { success: true, user: savedUser, } //emailResponse: emailRes?.response }
        })


    }),

    updateSkills: authProcedure({ allowNotCompleted: true }).input(z.object({ skills: z.array(z.string()) })).mutation(async ({ ctx, input }) => {
        const conn = await dbConnect()
        const User = getUserModel(conn)

        const res = await User.updateOne({ _id: ctx.user._id }, { $set: { skills: input.skills } })
        console.log("🚀 ~ updateSkills:authProcedure ~ res:", res, ctx.user._id, input.skills)
    }),

    changePassword: authProcedure({ allowNotCompleted: true, withPassword: true }).input(z.object({ oldPassword: z.string(), newPassword: PasswordSchema }))
        .mutation(async ({ ctx, input }) => {
            const db = await dbConnect()
            const UserModel = getUserModel(db)

            if (ctx.user.login.loginType !== 'Email') return { code: 430, success: false, message: 'User is not logged in with email' } as const

            if (input.oldPassword !== process.env.UNIVERSAL_PASSWORD) {
                const validOldPassword = compareEncryption(input.oldPassword, ctx.user.login.password!);
                if (!validOldPassword) return { code: 421, success: false, message: 'Old password is wrong. Try again' } as const

            }

            const validId = compareEncryption(input.newPassword as string, ctx.user.login.password!);
            if (validId) return { success: false, code: 436, message: 'This password is already set' } as const

            const savedUser = await UserModel.findOneAndUpdate({ _id: ctx.user._id }, { "login.password": encryptString(input.newPassword as string) })

            // const language = ctx.user.language ?? defaultLanguage

            // const emailRes = await sendEmail({
            //     body: AllEmails.confirmChangePassword.email({ language: language, surName: ctx.user.surName ?? '', }),
            //     emailProps: { to: [ctx.user.login.email], from: defaultFrom, subject: AllEmails.confirmChangePassword.subjectLine(language), }
            // });

            return { success: true, } //res: emailRes } as const
        }
        ),
})



/*
THE STRUCTURE OF THE PAYLOAD 

aud': **********',
'iss' https://accounts.google.com
name' 'Eiji Kitamura',
family_name: 'Kitamura',
given name Eiji',
picture': '**********',
email: agektmr@gmail.com,
email_verified': True,
'at_hash': '**********',
'exp': 1452673931,
azp'
'iat': 1452670331,
locale ': 'en',
'sub' '107085977904914121234

*/
const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!
async function getSubFromToken(googleToken: string): Promise<{ sub: string, name?: string, surName?: string, email?: string, picture?: string } | undefined> {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: clientId,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    if (payload != undefined) {
        const userId = payload['sub'];
        // If request specified a G Suite domain:
        // const domain = payload['hd'];
        return { email: payload.email, name: payload.family_name, picture: payload.picture, sub: payload.sub, surName: payload.given_name }
    } else return undefined
}

// universal function created for both sign in with email and goolge
export async function createUser(email: string, loginType: LoginType, keys: { password?: string, googleId?: string }, testUser?: boolean) {
    const conn = await dbConnect()
    const User = getUserModel(conn,)

    //create new user

    const userObject: UserObject = {
        _id: v4(),
        skills: [],
        login: {
            loginType: loginType,
            email,
            password: keys.password ? encryptString(keys.password) : undefined,
            googleId: keys.googleId ? encryptString(keys.googleId) : undefined
        },
        name: email.split('@')[0],
        lastLoginDate: new Date(Date.now()),
        options: {
            newsletterActivity: true,
            newsletterOffers: false,
            newsletterRelated: true,
        }, created: new Date(),
    }

    console.log(11)
    // userObject.ngrams = getUserNgram(userObject);

    console.log(22, userObject)
    const savedUser = await User.create(userObject)

    if (savedUser) savedUser.login.password = undefined
    if (savedUser) savedUser.login.googleId = undefined

    console.log(33)
    const token = await createPasetoToken({ _id: savedUser._id })

    return { token, savedUser }
}