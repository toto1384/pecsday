import { NextApiRequest, NextApiResponse } from "next";
import { createNextApiHandler } from '@trpc/server/adapters/next';
import { getCookie } from 'cookies-next';
import { procedure, router } from "../../../utils/trpcserver";
import { tokenName } from "../../../utils/cookies";
import { usersRouter } from "../../../utils/userRouter";
import { dbConnect, getExerciseModel, getWorkoutModel } from "../../../utils/db";
import { ExerciseObject, WorkoutObject } from "../../../utils/types";
import { v4 } from "uuid";
import { z } from "zod";


export const createContext = async ({ req, res }: { req?: NextApiRequest, res?: NextApiResponse }) => {
    const token = await getCookie(tokenName, { req, res })
    return { token, req, res } as { token: string | undefined, req?: NextApiRequest, res?: NextApiResponse }
}

export type AppRouter = typeof appRouter;


export const appRouter = router({
    users: usersRouter,

    getWorkout: procedure.input(z.object({ ids: z.array(z.string()) })).query(async ({ ctx, input }) => {
        console.log("🚀 ~ getWorkout:procedure.input ~ id:", input.ids)

        const db = await dbConnect()
        const WorkoutModel = getWorkoutModel(db)

        const workout = await WorkoutModel.aggregate([
            { $match: { _id: { $in: input.ids } } },

            // Unwind the list of IDs to be populated
            { $unwind: "$exercises" },

            // Lookup to populate details from detailCollection
            {
                $lookup: {
                    from: "exercises",
                    localField: "exercises._id",
                    foreignField: "_id",
                    as: "exercises.details"
                }
            },

            // Unwind the details (if you want a single object instead of array)
            { $unwind: "$exercises.details" },

            // Group back to reconstruct the original document structure
            {
                $group: {
                    _id: "$_id",
                    otherFields: { $first: "$$ROOT" },
                    exercises: { $push: "$exercises" }
                }
            },

        ])

        console.log("🚀 ~ getWorkout:procedure.input ~ workout:", workout)
        if (!workout?.length) return { success: false, message: 'No workout found' }


        return { success: true, workout: workout }

    }),

    add: procedure.mutation(async ({ ctx, input }) => {

        const db = await dbConnect()
        const WorkoutModel = getWorkoutModel(db)
        const ExerciseModel = getExerciseModel(db);

        await WorkoutModel.create({
            name: "90 Degree Handstand Pushup Negative Progression", public: true, _id: v4(),
            exercises: [
                { _id: "e038682e-611c-414f-ad7e-02999802b682", repsOrSecs: 7, rest: 60, },//leg raises
                { _id: "e038682e-611c-414f-ad7e-02999802b682", repsOrSecs: 7, rest: 60, },//leg raises
                { _id: "e038682e-611c-414f-ad7e-02999802b682", repsOrSecs: 7, rest: 60, },//leg raises

                { _id: "3b2687c9-c455-4e02-9d3a-9b009bc61c04", repsOrSecs: 12, rest: 60, },//leg raises
                { _id: "3b2687c9-c455-4e02-9d3a-9b009bc61c04", repsOrSecs: 12, rest: 60, },//leg raises
                { _id: "3b2687c9-c455-4e02-9d3a-9b009bc61c04", repsOrSecs: 12, rest: 60, },//leg raises

                { _id: "e038682e-611c-414f-ad7e-02999802b682", repsOrSecs: 7, rest: 60, },//leg raises
                { _id: "e038682e-611c-414f-ad7e-02999802b682", repsOrSecs: 7, rest: 60, },//leg raises
                { _id: "e038682e-611c-414f-ad7e-02999802b682", repsOrSecs: 7, rest: 60, },//leg raises

                { _id: "3b2687c9-c455-4e02-9d3a-9b009bc61c04", repsOrSecs: 12, rest: 60, },//leg raises
                { _id: "3b2687c9-c455-4e02-9d3a-9b009bc61c04", repsOrSecs: 12, rest: 60, },//leg raises
                { _id: "3b2687c9-c455-4e02-9d3a-9b009bc61c04", repsOrSecs: 12, rest: 60, },//leg raises
            ]
        } as WorkoutObject)


        // await (await ExerciseModel.create({
        //     name: "90 Degree Handstand Pushup Negative",
        //     ytEmbedLink: 'https://www.youtube.com/embed/SUUsvlLqzOE?start=222&end=228',
        //     public: true, type: 'reps', _id: v4()
        // } as ExerciseObject)).save();


        // await (await ExerciseModel.create({
        //     name: "Handstand Pushup",
        //     ytEmbedLink: 'https://www.youtube.com/embed/FaRge9WFzWg?start=0&end=4',
        //     public: true, type: 'reps', _id: v4()
        // } as ExerciseObject)).save();


        // await (await ExerciseModel.create({
        //     name: "Straddle 90 Degree Handstand Pushup Negative",
        //     ytEmbedLink: 'https://www.youtube.com/embed/IDEVXW5bwQ0?start=410&end=416',
        //     public: true, type: 'reps', _id: v4()
        // } as ExerciseObject)).save()
    }),
})

export default createNextApiHandler({
    router: appRouter,
    createContext,
    onError({ error, type, path, input, ctx, req }: any) {
        console.error('Error:', error);
        if (error.code === 'INTERNAL_SERVER_ERROR') {
            // send to bug reporting
        }
    },
});