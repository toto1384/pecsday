import { createContext, ReactNode, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { UserObject } from "../utils/types";

export const SnackBarContext = createContext<{ createSnackbar: (item: SnackBarItem) => void, items: SnackBarItem[] }>({ items: [], createSnackbar: () => { } })

export const UserContext = createContext<{
    user: UserObject | undefined, setUser: (user: UserObject | undefined) => void,
}>({ user: undefined, setUser: () => { }, })

export interface SnackBarItem {
    title: ReactNode,
    id?: string,
    duration?: number,
    onFinished?: () => void,
    closeButton?: (onClose: () => void) => ReactNode
}


export function SnackBar({ item, removeItem }: { item: SnackBarItem, removeItem: () => void }) {
    useEffect(() => {
        if (item.duration !== 0) {
            const timeout = setTimeout(() => {
                removeItem()
                if (item.onFinished) item.onFinished()
            }, item.duration);
            return () => clearTimeout(timeout)
        }
    }, [])
    const closeFunction = () => {
        removeItem()
        if (item.onFinished) item.onFinished()
    }

    return <div className={'flex flex-row bg-orange-100 rounded space-x-3 items-center w-fit m-1.5 px-3 pt-3 pb-3 max-w-screen'}>
        <div className="">{item.title}</div>
        {item.closeButton ? item.closeButton(closeFunction) : <MdClose className="w-5 h-5 icon-button" onClick={closeFunction} />}
    </div>
}


export const paddingTextField = { x: "px-3", y: 'py-2.5', ysm: "py-2" }

export const maxWFields = '' // 'max-w-sm'