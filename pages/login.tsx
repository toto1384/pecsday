import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { z } from 'zod'
import { useContext } from 'react'
import { GetServerSidePropsContext } from 'next'
import Head from 'next/head'
import { SnackBarContext, UserContext } from '../components/globals'
import { useRecaptcha } from '../utils/useRecaptcha'
import { LoginSchema } from '../utils/validation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CenteredCardPage } from '../components/centeredCardPage'
import { NavBar } from '../components/navBar'
import Link from 'next/link'
import { trpc } from '../utils/trpc'
import { FormTextField } from '../components/formTextField'
import { PasswordTextField } from '../components/passwordTextField'
import { ButtonWError } from '../components/buttonWError'
import SignInButton from '../components/signin_button'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'


function LoginPage() {
    const router = useRouter()

    const { createSnackbar } = useContext(SnackBarContext)

    const [handleRecaptchaVerify] = useRecaptcha()

    const { user, setUser } = useContext(UserContext)

    const { handleSubmit, control, formState: { errors } } = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
    })

    const [loading, setLoading] = useState(false)

    const [sendError, setSendError] = useState<string | undefined>()

    return (
        <CenteredCardPage
            appBar={<NavBar />}
        >
            <h1 className="text-3xl pb-2 font-semibold">Login</h1>
            <div className='flex flex-col md:flex-row'>
                <div className='w-full bg-white rounded-xl'>
                    <Link data-cy="register-btn" className='text-[color:var(--primary)] text-xl' href={`/register`}>
                        <div className='pb-3'>
                            <>No Account? </>
                            <span className='underline'>Register</span>

                        </div>
                    </Link>
                    <form id='login-form' onSubmit={handleSubmit(async (data) => {
                        setLoading(true)
                        await handleRecaptchaVerify!()


                        const res = await trpc().users.login.mutate(data)


                        setLoading(false)
                        if (!res) return setSendError("Request failed")
                        if (res.success) {
                            setUser(res.data)
                            await router.push((router.query.reddirect as string) ?? '/',)
                        } else {
                            switch (res.code) {
                                case 404: setSendError("User does not exist"); break;
                                case 421: setSendError("Password does not match"); break;
                                case 430: setSendError("User not logged with email"); break;
                            }
                        }

                    })}>
                        <div className="py-2 space-y-2">
                            <FormTextField control={control} type="email" name="email" >Email</FormTextField>
                            <PasswordTextField disableErrors control={control} name={'password'}>Password</PasswordTextField>
                        </div>
                    </form>
                    <div className="flex justify-center py-2 px-2">
                        {/* <ForgotPasswordButton csrfToken={csrfToken} /> */}
                    </div>
                    <div className="flex flex-col w-fit mx-auto justify-center pt-2">
                        <ButtonWError loading={loading} data-cy='login-button' error={sendError} errors={errors} form={`login-form`} type='submit' className='btn-primary bg-[color:var(--primary)]'>
                            Login
                        </ButtonWError>
                    </div>

                    <p className="divider pt-5">Or</p>
                    <div className="flex justify-center pt-5"><SignInButton /></div>

                </div>
            </div>
            {/* <div className="flex justify-center">
				<TrueLink data-cy="register-btn" href={`/register`}>
					<button className="btn-primary-text mt-10 line-clamp-1">
						{userType === "Candidate" ?
							languageObject.loginScreenStrings.createNewAccountCandidate :
							languageObject.loginScreenStrings.createNewAccountCompany}
					</button>
				</TrueLink>
			</div> */}
            {/* <hr className='my-5' /> */}
            {/* <div className='flex justify-center'><ChangeLanguageTile button className='' /></div> */}

        </CenteredCardPage>
    )
}



export async function getServerSideProps(context: GetServerSidePropsContext) {
    console.log('got here')
    return { props: {} }
}

export default function LoginWithRecaptcha() {
    return <GoogleReCaptchaProvider
        // container={{ parameters: { badge: "inline", }, element: 'ss' }}
        reCaptchaKey={process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY ?? ''}
    >
        <LoginPage />
    </GoogleReCaptchaProvider>
}
