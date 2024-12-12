import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import { GoogleLogin, useGoogleOneTapLogin } from '@react-oauth/google';
import { SnackBarContext } from './globals';
import { trpc } from '../utils/trpc';
import { FormInputError } from './formInputError';



function SignInButton() {
    const [error, setError] = useState<string | undefined>()

    const router = useRouter()
    const { createSnackbar } = useContext(SnackBarContext)

    const isWindow = typeof window !== "undefined"
    const isCypress = isWindow ? 'Cypress' in window : false

    return <div data-cy="signin-google" className='flex flex-col items-center'>
        <GoogleLogin useOneTap={!isCypress} onSuccess={async (crs) => {
            console.log('credentials', crs)
            if (!crs.credential) return setError('Error')

            const res = await trpc().users.signinGoogle.mutate({
                googleToken: crs.credential
            })
            if (!res) return
            if (res.success) {
                router.push('/')
            } else if (res.code === 430) {
                setError("User not logged in with google")
            } else setError(res.message)
        }} onError={() => {
            setError('Error')
        }} />
        <FormInputError error={error} />
    </div>

}


export function useOneTapGoogle(isUser: boolean) {
    const { createSnackbar } = useContext(SnackBarContext);
    const router = useRouter()

    const isWindow = typeof window !== "undefined"
    const isCypress = isWindow ? 'Cypress' in window : false

    const disabled = isUser || isCypress

    useGoogleOneTapLogin({
        onSuccess: async (crs) => {
            if (!crs.credential) return createSnackbar({ title: 'Error' })

            const res = await trpc().users.signinGoogle.mutate({
                googleToken: crs.credential
            })
            if (!res) return
            if (res.success) {
                router.reload()
            } else if (res.code === 430) {
                createSnackbar({ title: "User not logged in with Google" })
            } else createSnackbar({ title: res.message })
        },
        disabled,
        onError: () => {
            createSnackbar({ title: 'Error' })
        }
    })
}

export default SignInButton
