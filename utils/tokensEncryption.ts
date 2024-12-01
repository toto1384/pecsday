import CryptoJS from 'crypto-js'
import { V3 } from 'paseto'
import { addHours } from "date-fns";
// import { nanoid } from "nanoid";
import { v4 } from 'uuid';


// for passwords
export function encryptString(value: string) {
    return ("*" + CryptoJS.SHA1(CryptoJS.SHA1(value))).toUpperCase()
}

export function compareEncryption(decrypted: string, encrypted: string) {
    return encrypted === encryptString(decrypted)
}


export function createExpirationDate() {
    return addHours(new Date(), 12)
}

export async function createPasetoTokenRaw(object: any, expiresIn?: string): Promise<string> {
    return await V3.encrypt(object, process.env.SECRET!, { expiresIn: expiresIn ?? '30 days', })
}


// random token generator
export function randomTokenGenerator() {
    return v4()
}





// used only once
export async function createPasetoKey(): Promise<string> {
    return await V3.generateKey('local', { format: 'paserk' })
}




