
import { z } from "zod";
import { ExerciseSchema, UserSchema, WorkoutSchema } from "./db";
import { ReactNode } from "react";


export type UserObject = z.infer<typeof UserSchema>;

export type ExerciseObject = z.infer<typeof ExerciseSchema>;

export type WorkoutObject = z.infer<typeof WorkoutSchema>;

export const LoginTypeValues = [/*1*/'Email',/*2*/"Facebook", "Google", 'LinkedIn',] as const


export type ExpandedDialogProps = {
	title?: string;
	buttons?: { name: string, onClick: (e: any, onClose: () => void) => void, error?: string }[]
}

export type DialogProps = {
	children: React.ReactNode | ((onClose: (b: boolean) => void) => ReactNode);
	open: boolean;
	onClose: () => void;
	bigWidth?: boolean;
	mediumWidth?: boolean;
	disablePadding?: string;
	closeIcon?: boolean;
	zIndex?: string;
	className?: string
}


export type WorkoutExtendedObject = { otherFields: WorkoutObject, _id: string, exercises: (WorkoutObject['exercises'][0] & { details: ExerciseObject })[] }