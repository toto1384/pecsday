import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { CSSTransition, TransitionGroup } from "react-transition-group"
import { SnackBar, SnackBarContext, SnackBarItem, UserContext } from '../components/globals'
import { ReactNode, useState } from 'react'
import { NextPage } from 'next'
import { v4 } from 'uuid'
import { UserObject } from '../utils/types'
import { GoogleOAuthProvider } from '@react-oauth/google'

function MyApp({ Component, pageProps }: AppProps) {

  const [snackBars, setSnackBars] = useState<SnackBarItem[]>([])

  const [user, setUser] = useState<UserObject | undefined>(undefined)

  return <>
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''}>

      <UserContext.Provider value={{
        setUser: (newUser) => {
          console.log('set user', newUser)
          setUser(newUser ? { ...user, ...newUser } : undefined)
        }, user
      }}>
        <SnackBarContext.Provider value={{
          items: snackBars, createSnackbar: (i) => {
            if (!i.id) i.id = v4()
            if (i.duration == undefined) i.duration = 8000
            let previous = snackBars
            if (snackBars.length > 3) previous = previous.slice(0, 3)
            setSnackBars(prev => [...previous, i])
          }
        }}>
          <AppNested Component={Component} pageProps={pageProps} setSnackBars={setSnackBars} snackBars={snackBars} />

        </SnackBarContext.Provider>
      </UserContext.Provider>
    </GoogleOAuthProvider>
  </>



}




function AppNested({ Component, snackBars, setSnackBars, pageProps }: { Component: NextPage, snackBars: SnackBarItem[], setSnackBars: (s: any) => void, pageProps: any }) {



  return <>
    <Component {...pageProps} />
    <TransitionGroup className="fixed left-0 bottom-0 m-3 z-[99]">
      {snackBars.map(i => <CSSTransition
        key={i.id}
        timeout={150}
        classNames="snackbar"
      >
        <SnackBar key={i.id} item={i} removeItem={() => {
          setSnackBars((prev: any) => prev.filter((item: any) => i != item))
        }} /></CSSTransition>)}
    </TransitionGroup>
  </>
}

export default MyApp

