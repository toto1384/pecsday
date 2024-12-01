import { useState } from 'react';
import { MdChevronLeft, MdClose } from 'react-icons/md';
import React from 'react';
import { DialogProps, ExpandedDialogProps } from '../utils/types';
import { useSize } from '../utils/size';
const DialogRadix = require('@radix-ui/react-dialog');

export const contentClassName = 'card shadow-2xl px-8 py-10 min-w-[350px] relative'
export const overlayClassName = 'fixed inset-0 overflow-y-scroll max-height-[85vh] grid place-items-center bg-gray-800 bg-opacity-25'

export function Dialog(props: DialogProps & ExpandedDialogProps) {
    const { open, onClose: setOpen, bigWidth = false } = props;

    return <DialogRadix.Root open={open} onOpenChange={setOpen}>
        <DialogRadix.Portal >
            <DialogRadix.Overlay className={`${overlayClassName} ${props.zIndex ?? 'z-50'} max-w-full`}>
                <DialogRadix.Content className={`${contentClassName} ${props.className} ${props.zIndex ?? 'z-50'} ${props.bigWidth ? 'max-w-4xl' : props.mediumWidth ? 'max-w-2xl' : `max-w-md`}`}>
                    {props.title && <DialogRadix.Title className="text-2xl">{props.title}</DialogRadix.Title>}
                    {(props.children instanceof Function) ? props.children(setOpen) : props.children}
                    {props.closeIcon &&
                        <button onClick={(e) => { e.stopPropagation(); setOpen() }} className="">
                            <MdClose data-cy="close-dialog" className="w-6 h-6 icon-button absolute m-4 right-0 top-0" />
                        </button>
                    }
                    {props.buttons && <div className="flex space-x-3 flex-row justify-end">
                        {props.buttons.map((i, n) => {
                            const button = <button
                                className={`${(n % 2 == 0) ? 'btn-secondary-text' : 'btn-primary'}`}
                                onClick={(e) => { if (i.onClick) i.onClick(e, () => setOpen()) }}
                            >{i.name}</button>
                            return i.error ? <div className="flex w-fit justify-center items-center flex-col">
                                {button}
                                {/* <FormInputError error={i.error} /> */}
                            </div> : button
                        })}
                    </div>}



                </DialogRadix.Content>

            </DialogRadix.Overlay>
        </DialogRadix.Portal>
    </DialogRadix.Root>
}


//dropdown on desktop, bototm sheet on mobile
export function DialogOrBottomSheet(props: (DialogProps & ExpandedDialogProps) & { ariaLabel?: string }) {
    const size = useSize(true)

    if (size.llg) {
        return <div className="relative">
            {/* <div className={`cursor-pointer left-0 ${props.className}`} aria-label={props.ariaLabel} data-cy={`dropdown-${props.dataCy ?? props.id}`} onClick={(event) => {
                event.stopPropagation();
                // console.log('got andiak')
                if (React.isValidElement(props.dropdown) && !(props.disableShowOnClick ?? false)) setToggled(!toggled)
            }}>{(props.dropdown instanceof Function) ? props.dropdown(setToggled) : props.dropdown}</div> */}

            {props.open && <div className={`backdrop fixed inset-0 ${'z-40'} h-screen w-screen`} onClick={(e) => { e.stopPropagation(); props.onClose() }}></div>}
            <div className={`fixed left-0 right-0 transition-all overflow-scroll bg-white mt-36 ${props.zIndex ?? 'z-50'} max-h-[85vh] rounded-md ${props.open ? "bottom-0" : "bottom-[-400vh]"}`}>
                <div className='flex px-3 flex-row items-center'>
                    <MdChevronLeft onClick={(e) => { e.stopPropagation(); props.onClose() }} className='h-10 w-10 icon-button p-1' />
                </div>
                <div className='px-6 pb-10'>
                    {(props.children instanceof Function) ? props.children((b) => { props.onClose() }) : props.children}
                </div>
            </div>
        </div>
    }

    return <Dialog {...props} />
}



