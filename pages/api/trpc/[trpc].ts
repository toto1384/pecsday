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


export const createContext = ({ req, res }: { req?: NextApiRequest, res?: NextApiResponse }) => {
    const token = getCookie(tokenName, { req, res })
    return { token, req, res } as { token: string | undefined, req?: NextApiRequest, res?: NextApiResponse }
}

export type AppRouter = typeof appRouter;


export const appRouter = router({
    users: usersRouter,

    getWorkout: procedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
        console.log("🚀 ~ getWorkout:procedure.input ~ id:", input.id)

        const db = await dbConnect()
        const WorkoutModel = getWorkoutModel(db)

        const workout = await WorkoutModel.aggregate([
            { $match: { _id: input.id } },

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
        if (!workout) return { success: false, message: 'No workout found' }


        return { success: true, workout: workout[0] }

    }),

    add: procedure.mutation(async ({ ctx, input }) => {

        const db = await dbConnect()
        const WorkoutModel = getWorkoutModel(db)
        const ExerciseModel = getExerciseModel(db);

        await WorkoutModel.create({
            name: "Crow Pose Workout", public: true, _id: v4(),
            exercises: [
                { _id: "0ae9442a-f202-43e1-b627-1e805db3ad54", repsOrSecs: 12, rest: 60, },//leg raises
                { _id: "0ae9442a-f202-43e1-b627-1e805db3ad54", repsOrSecs: 12, rest: 60, },//leg raises
                { _id: "0ae9442a-f202-43e1-b627-1e805db3ad54", repsOrSecs: 12, rest: 60, },//leg raises

                { _id: "5b572d9b-d44c-47f6-8320-2da5482e893e", repsOrSecs: 14, rest: 60, },//tucked lsit
                { _id: "5b572d9b-d44c-47f6-8320-2da5482e893e", repsOrSecs: 14, rest: 60, },//tucked lsit
                { _id: "5b572d9b-d44c-47f6-8320-2da5482e893e", repsOrSecs: 14, rest: 60, },//tucked lsit

                { _id: "0ae9442a-f202-43e1-b627-1e805db3ad54", repsOrSecs: 12, rest: 60, },//leg raises
                { _id: "0ae9442a-f202-43e1-b627-1e805db3ad54", repsOrSecs: 12, rest: 60, },//leg raises
                { _id: "0ae9442a-f202-43e1-b627-1e805db3ad54", repsOrSecs: 12, rest: 60, },//leg raises

                { _id: "64a61bb8-5c80-409c-9314-8cdc815bd45a", repsOrSecs: 8, rest: 60, },//tucked lsit
                { _id: "64a61bb8-5c80-409c-9314-8cdc815bd45a", repsOrSecs: 8, rest: 60, },//tucked lsit
                { _id: "64a61bb8-5c80-409c-9314-8cdc815bd45a", repsOrSecs: 8, rest: 60, },//tucked lsit
            ]
        } as WorkoutObject)


        // await (await ExerciseModel.create({
        //     name: "Pistol Squat To Box",
        //     ytEmbedLink: 'https://www.youtube.com/watch?v=ctffzu0jWu0',
        //     public: true, type: 'reps', _id: v4()
        // } as ExerciseObject)).save();


        // await (await ExerciseModel.create({
        //     name: "Staggered Squat",
        //     ytEmbedLink: 'https://www.youtube.com/embed/UDG3vlZtOoQ?start=15&end=20',
        //     public: true, type: 'reps', _id: v4()
        // } as ExerciseObject)).save();


        // await (await ExerciseModel.create({
        //     name: "Pistol Squat Negative",
        //     ytEmbedLink: 'https://www.youtube.com/embed/UigjlJxCBhE?start=10&end=15',
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