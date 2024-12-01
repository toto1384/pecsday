import { httpBatchLink, createTRPCProxyClient, TRPCLink } from '@trpc/client';
import { NextRouter } from 'next/router';
import { observable } from '@trpc/server/observable';
import type { AppRouter } from '../pages/api/trpc/[trpc]';
import superjson from 'superjson';
export const transformer = superjson

// const {CandidateModel, CompanyModel} =  await get models

export const errorHandlingLink: () => TRPCLink<AppRouter> = () => () => {
    // here we just got initialized in the app - this happens once per app
    // useful for storing cache for instance
    return ({ next, op }) => {
        // this is when passing the result to the next link
        // each link needs to return an observable which propagates results
        return observable((observer) => {
            console.log('performing operation:', op);
            const unsubscribe = next(op).subscribe({
                next(value) {
                    console.log('we received value', value);
                    observer.next(value);
                },
                error(err,) {
                    console.log('we recieved error', err,);
                    observer.error(err);
                },
                complete() {
                    observer.complete();
                },
            });
            return unsubscribe;
        });
    };
};

export type TRPCType = ReturnType<typeof createTRPCProxyClient<AppRouter>>

export const trpc = () => createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({ url: `/api/trpc` }),
    ],
    transformer,
});

