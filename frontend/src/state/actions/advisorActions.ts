import { createAction } from "typesafe-actions";
import { Student } from "../reducers/advisorReducer";

export const setEmail = createAction("advisor/SET_EMAIL", (email: string) => ({
  email,
}))();

export const setName = createAction("advisor/SET_NAME", (name: string) => ({
  name,
}))();

export const setUserId = createAction(
  "advisor/SET_USER_ID",
  (userId: number) => ({
    userId,
  })
)();

export const setImage = createAction("advisor/SET_IMAGE", (image: string) => ({
  image,
}))();

export const setStudents = createAction(
  "advisor/SET_STUDENTS",
  (students: Array<Student>) => ({
    students,
  })
)();