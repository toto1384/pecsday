import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { MdLogin, MdLogout, MdPerson } from "react-icons/md";
import { Dialog } from "./overflows";
import { Switch } from "./switch";
import { UserObject } from "../utils/types";
import { UserContext } from "./globals";
import { trpc } from "../utils/trpc";
import { DropdownOption } from "./dropdownOption";
import { useRouter } from "next/router";
import { googleLogout } from '@react-oauth/google'

export const NavBar = ({ mode, setMode, userForContext }: { mode?: "list" | "flow", setMode?: (b: "list" | "flow") => void, userForContext?: UserObject }) => {

    const { setUser, user } = useContext(UserContext)
    const router = useRouter()

    async function exec() {
        let givenUser: UserObject | undefined = undefined
        if (userForContext) {
            givenUser = userForContext
            setUser(userForContext)
        } else if (!user) {
            const res = await trpc().users.get.query({}).catch(i => console.log(i.toString()))
            console.log("🚀 ~ exec ~ res:", res)

            if (res && res.success) {
                givenUser = res.user
                setUser(givenUser)
                // login(user)
            } else {
                console.log('Not logged in')
            }
            // console.log('usserrr', user)

        }
    }

    useEffect(() => { exec() }, [])

    const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)

    return <nav className=' bg-white w-full px-2 md:px-10 shadow flex flex-row items-center justify-between'>
        <Link className='cursor-pointer' href={'/'}><Image src={'/logo.png'} alt='Pecsday Logo' width={100} height={100} /></Link>
        <div className='flex flex-row items-center space-x-10'>
            <Link href={'https://pecsday.com/equipment'} className='font-semibold hover:underline'>Shop</Link>
            <Link href={'https://pecsday.com/about'} className='font-semibold hover:underline'>Our Story</Link>

            {user == null ?
                <Link className="flex rounded hover:bg-gray-200 px-1 md:px-3 py-2 items-center space-x-1 md:space-x-3 cursor-pointer" data-cy="login" href={'/login'}>
                    <MdLogin className="w-6 h-6" />
                    <p className={'line-clamp-1'}>Sign in</p>
                </Link> :
                <MdPerson className='w-7 h-7 cursor-pointer' onClick={() => setSettingsDialogOpen(true)} />
            }

            <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)}>
                <h2 className='text-xl mb-5'>Settings - {user?.login?.email}</h2>
                {(mode != undefined && setMode != undefined) && <Switch isOn={mode == 'list'} name='List mode' setIsOn={(b) => setMode(b ? 'list' : 'flow')} />}
                <DropdownOption className="mt-5" text={"Log Out"} dataCy='abm-logout' icon={MdLogout} onClick={async () => {
                    //handle signing out
                    await trpc().users.logout.mutate()
                    googleLogout()
                    setUser(undefined)

                    router.push('/login')
                }} />
            </Dialog>
        </div>
    </nav>

} 