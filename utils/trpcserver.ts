
import { initTRPC, inferAsyncReturnType, TRPCError } from '@trpc/server';
import { createContext } from '../pages/api/trpc/[trpc]';


import superjson from 'superjson';

import { errorMessages, protectApi } from './auth';

export const transformer = superjson


// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
export const t = initTRPC.context<inferAsyncReturnType<typeof createContext>>().create({
    transformer, isDev: process.env.NODE_ENV !== 'production',
});



// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;


export interface TRPCHandlerOptionsAuth {
    allowNotCompleted?: boolean,
    userProjectionAdditional?: string[],
    mandatoryVerified?: boolean
    withPassword?: boolean
}


export const authProcedure = (options: TRPCHandlerOptionsAuth) => procedure.use(middleware(async ({ ctx, next, input }) => {
    const user = await procedureGetUser({ options, token: ctx.token })
    return next({ ctx: { user } })
}))

export async function procedureGetUser({ options, token }: { token: string | undefined, options: TRPCHandlerOptionsAuth }) {
    if (!token) throw new TRPCError({ code: 'UNAUTHORIZED', message: errorMessages[401] });

    const { status, error, message, user } = await protectApi(token, {
        allowNotCompleted: options.allowNotCompleted,
        userProjectionAdditional: options.userProjectionAdditional,
        mandatoryVerified: options.mandatoryVerified,
        withPassword: options.withPassword
    })
    if (error || !user) {
        switch (status) {
            case 433: throw new TRPCError({ code: 'PRECONDITION_FAILED', message: errorMessages[433] });
            default: throw new TRPCError({ code: 'UNAUTHORIZED', message: errorMessages[401] })
        }
    }

    return user
}