
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react'
// import ChangeLanguageTile from '../../components/login/change_language'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { z } from 'zod'
import { MdAttribution, MdBusiness, MdPerson } from 'react-icons/md'
import Head from 'next/head'
import { useRecaptcha } from '../utils/useRecaptcha'
import { SnackBarContext, UserContext } from '../components/globals'
import { FrontEndRegisterSchema } from '../utils/validation'
import { CenteredCardPage } from '../components/centeredCardPage'
import { NavBar } from '../components/navBar'
import Link from 'next/link'
import SignInButton from '../components/signin_button'
import { FormTextField } from '../components/formTextField'
import { PasswordTextField } from '../components/passwordTextField'
import { ButtonWError } from '../components/buttonWError'
import { FormCheckbox } from '../components/formCheckbox'
import { trpc } from '../utils/trpc'

function RegisterPage() {

    const router = useRouter()

    const [handleRecaptchaVerify] = useRecaptcha()

    const { user, setUser } = useContext(UserContext)

    const [sendError, setSendError] = useState<string | undefined>()
    const [loading, setLoading] = useState(false)

    const validation = FrontEndRegisterSchema()
    const { handleSubmit, control, formState: { errors } } = useForm<z.infer<typeof validation>>({ resolver: zodResolver(validation) })

    const { createSnackbar } = useContext(SnackBarContext)


    return (
        <CenteredCardPage
            appBar={<NavBar />}
        >
            <h1 className="text-3xl font-semibold">Register</h1>
            <Link className='text-[color:var(--primary)] text-xl' href={`/login`}>
                <div className='py-3'>
                    <>Already have account? </>
                    <span className='underline'>Login</span>

                </div>
            </Link>


            <form onSubmit={handleSubmit(async (data) => {
                setLoading(true)
                await handleRecaptchaVerify!()

                const res = await trpc().users.registerWithEmail.mutate({ ...data })

                console.log('pp')
                setLoading(false)

                if (!res) return

                if (res.success) {
                    setUser(res.data)

                    if (res.code === 210) {
                        //user already exists and logged in
                        return createSnackbar({
                            title: "Already have account", onFinished: () => {
                                router.push(`/`)
                            }, duration: 2500
                        })
                    }

                    await router.push(`/`)

                } else {
                    switch (res.code) {
                        case 431: setSendError("Already Registered"); break
                    }
                }
            })} noValidate>
                <div className="py-2 space-y-2">
                    <FormTextField control={control} type="email" name="email">Email</FormTextField>
                    <PasswordTextField control={control} name={'password'}>Password</PasswordTextField>
                </div>
                <div className="py-2 px-2">
                    <FormCheckbox control={control} name='termsAndConditions'>
                        {"Accept" + " "}
                        <span className="a">
                            <Link href="/terms-and-conditions">Terms And Conditions</Link>
                        </span>
                    </FormCheckbox>
                </div>

                <div className="flex justify-center pt-2">
                    <ButtonWError error={sendError} errors={errors} type="submit" data-cy="register-button" className='btn-primary bg-[color:var(--primary)]'>
                        Register
                    </ButtonWError>
                </div>
            </form>
            <div className="py-4">
                <p className="divider">Or</p>
                <div className="flex justify-center pt-2"><SignInButton /></div>
            </div>
        </CenteredCardPage>
    )
}


export default function RegisterWithRecaptcha() {

    return <GoogleReCaptchaProvider
        reCaptchaKey={process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY ?? ''}
    >
        <RegisterPage />
    </GoogleReCaptchaProvider>
}
