
const mongooseSlugPlugin = require('mongoose-slug-plugin')
const slugify = require('slugify')
import zodToJsonSchema from "zod-to-json-schema";
import { createMongooseSchema } from 'convert-json-schema-to-mongoose';
import { z, ZodTypeAny } from 'zod'
import mongoose, { Document, Model, Schema, } from 'mongoose'
import { ExerciseObject, LoginTypeValues, UserObject, WorkoutObject } from "./types";


export const zDate = z.preprocess((arg) => {
    if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
    if (arg == undefined) return arg
}, z.date())


export const WorkoutSchema = z.object({
    _id: z.string().optional(),
    name: z.string().optional(),

    exercises: z.array(z.object({
        _id: z.string(),
        rest: z.number(),
        repsOrSecs: z.number(),
    })),

    public: z.boolean(),
    owner: z.string().optional()
})

export const ExerciseSchema = z.object({
    _id: z.string().optional(),
    name: z.string(),
    ytEmbedLink: z.string(),
    type: z.enum(["reps", "time"]),

    public: z.boolean(),
    owner: z.string().optional()

});


export const UserSchema = z.object({
    _id: z.string().optional(),
    login: z.object({
        email: z.string().email(),
        password: z.string().optional(),
        googleId: z.string().optional(),
        facebookId: z.string().optional(),
        loginType: z.enum(LoginTypeValues),
    }),

    slug: z.string().optional(),

    created: zDate,

    name: z.string().optional(),

    reset: z.object({
        newEmail: z.string().optional(),
        previousEmails: z.array(z.string()).default([]).optional(),
        emailKey: z.string().optional(),
        emailKeyExpiration: zDate.optional(),
        passwordKey: z.string().optional(),
        passwordKeyExpiration: zDate.optional()
    }).optional(),

    skills: z.array(z.string()),

    options: z.object({
        newsletterOffers: z.boolean(),
        newsletterActivity: z.boolean(),
        newsletterRelated: z.boolean(),
    }),

    lastLoginDate: zDate.default(new Date()).optional(),
})


export const defaultSlugifyConfiguration = {
    replacement: '-',  // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true,      // convert to lower case, defaults to `false`
    strict: true,     // strip special characters except replacement, defaults to `false`
    // locale: 'vi',       // language code of the locale to use
    trim: true         // trim leading and trailing replacement chars, defaults to `true`
}

export const defaultSlugPluginConfiguration = {
    tmpl: '<%=name%>',
    alwaysUpdateSlug: false,
    slug: slugify,
    slugOptions: defaultSlugifyConfiguration
}

export const getUserModel = (mong?: typeof mongoose) => {
    const mgse = mong ?? mongoose;

    if (mgse.models.User) return mgse.models.User as Model<UserObject & Document>

    const userSchema = convertToModel(UserSchema).plugin(mongooseSlugPlugin, defaultSlugPluginConfiguration)

    return mgse.model<UserObject & Document>('User', userSchema, 'users')
}


export const getExerciseModel = (mong?: typeof mongoose) => {
    const mgse = mong ?? mongoose;

    if (mgse.models.Exercise) return mgse.models.Exercise as Model<ExerciseObject & Document>

    const exerciseSchema = convertToModel(ExerciseSchema)

    return mgse.model<ExerciseObject & Document>('Exercise', exerciseSchema, 'exercises')
}


export const getWorkoutModel = (mong?: typeof mongoose) => {
    const mgse = mong ?? mongoose;

    if (mgse.models.Workout) return mgse.models.Workout as Model<WorkoutObject & Document>

    const workoutSchema = convertToModel(WorkoutSchema)

    return mgse.model<WorkoutObject & Document>('Workout', workoutSchema, 'workouts')
}


export function convertToModel<T extends ZodTypeAny>(zodSchema: T, collection?: string,) {
    const jsonSchema = zodToJsonSchema(zodSchema, { name: "Schema", $refStrategy: 'none', },);

    const mongooseSchema = createMongooseSchema({}, {
        ...(jsonSchema.definitions as any).Schema,
        '$schema': 'http://json-schema.org/draft-04/schema#',

    },);

    return new mongoose.Schema(mongooseSchema, { collection });
}


let cached = (global as any).mongoose ?? {}

export async function dbConnect(): Promise<typeof mongoose> {
    if (cached?.conn) {
        return cached.conn
    }

    if (!cached?.promise) {
        console.log('generating mongo instance')

        const connection = await mongoose.connect(process.env.MONGODB_CONNECTION!);
        cached.promise = connection

    }

    cached.conn = await cached.promise

    return cached.conn
}