import {
  DNDSchedule,
  IWarning,
  CourseWarning,
  DNDScheduleCourse,
} from "../../models/types";
import { mockData } from "../../data/mockData";
import produce from "immer";
import { getType } from "typesafe-actions";
import { ScheduleAction } from "../actions";
import {
  addClassesAction,
  removeClassAction,
  changeSemesterStatusAction,
  updateSemesterAction,
  setScheduleAction,
  setDNDScheduleAction,
  addCompletedCourses,
  removeCompletedCoursesAction,
  setCompletedCourses,
  setCompletedCoursesFromMap,
} from "../actions/scheduleActions";
import {
  convertTermIdToSeason,
  convertToDNDSchedule,
  convertToDNDCourses,
  produceWarnings,
} from "../../utils";
import { getNumberOfCompletedCourses } from "../../utils/completed-courses-helpers";

export interface ScheduleState {
  currentClassCounter: number;
  isScheduleLoading: boolean; // not used right now
  scheduleError: string; // not used right now
  schedule: DNDSchedule;
  warnings: IWarning[];
  courseWarnings: CourseWarning[];
  completedCourses: ICompletedCoursesMap;
}

export interface ICompletedCoursesMap {
  [idx: number]: DNDScheduleCourse[]; // 0 1 2 3
}

const initialState: ScheduleState = {
  currentClassCounter: 0,
  isScheduleLoading: false,
  scheduleError: "",
  schedule: mockData,
  warnings: [],
  courseWarnings: [],
  completedCourses: { 0: [], 1: [], 2: [], 3: [] },
};

export const scheduleReducer = (
  state: ScheduleState = initialState,
  action: ScheduleAction
) => {
  return produce(state, draft => {
    switch (action.type) {
      case getType(addClassesAction): {
        const { courses, semester } = action.payload;
        const season = convertTermIdToSeason(semester.termId);

        const [dndCourses, newCounter] = convertToDNDCourses(
          courses,
          draft.currentClassCounter
        );

        draft.currentClassCounter = newCounter;

        draft.schedule.yearMap[semester.year][season].classes.push(
          ...dndCourses
        );

        const container = produceWarnings(
          JSON.parse(JSON.stringify(draft.schedule)) // deep copy of schedule, because schedule is modified
        );

        draft.warnings = container.normalWarnings;
        draft.courseWarnings = container.courseWarnings;

        return draft;
      }
      case getType(removeClassAction): {
        const { course, semester } = action.payload;
        const season = convertTermIdToSeason(semester.termId);
        draft.schedule.yearMap[semester.year][
          season
        ].classes = draft.schedule.yearMap[semester.year][
          season
        ].classes.filter(c => c.dndId !== course.dndId);

        const container = produceWarnings(
          JSON.parse(JSON.stringify(draft.schedule)) // deep copy of schedule, because schedule is modified
        );

        draft.warnings = container.normalWarnings;
        draft.courseWarnings = container.courseWarnings;

        return draft;
      }
      case getType(changeSemesterStatusAction): {
        const { newStatus, year, season } = action.payload;
        draft.schedule.yearMap[year][season].status = newStatus;
        return draft;
      }
      case getType(updateSemesterAction): {
        const { year, season, newSemester } = action.payload;
        draft.schedule.yearMap[year][season] = newSemester;

        const container = produceWarnings(
          JSON.parse(JSON.stringify(draft.schedule)) // deep copy of schedule, because schedule is modified
        );

        draft.warnings = container.normalWarnings;
        draft.courseWarnings = container.courseWarnings;

        return draft;
      }
      case getType(setScheduleAction): {
        const { schedule } = action.payload;
        const [newSchedule, newCounter] = convertToDNDSchedule(
          schedule,
          draft.currentClassCounter
        );
        draft.schedule = newSchedule;
        draft.currentClassCounter = newCounter;

        const container = produceWarnings(
          JSON.parse(JSON.stringify(action.payload.schedule)) // deep copy of schedule, because schedule is modified
        );

        draft.warnings = container.normalWarnings;
        draft.courseWarnings = container.courseWarnings;

        return draft;
      }
      case getType(setDNDScheduleAction): {
        draft.schedule = action.payload.schedule;

        const container = produceWarnings(
          JSON.parse(JSON.stringify(action.payload.schedule)) // deep copy of schedule, because schedule is modified
        );

        draft.warnings = container.normalWarnings;
        draft.courseWarnings = container.courseWarnings;

        return draft;
      }
      case getType(addCompletedCourses): {
        const [dndCourses, newCounter] = convertToDNDCourses(
          action.payload.completedCourses,
          draft.currentClassCounter
        );

        draft.currentClassCounter = newCounter;

        const totalClasses =
          getNumberOfCompletedCourses(draft.completedCourses) +
          action.payload.completedCourses.length;
        const maxCoursesPerColumn =
          totalClasses < 20 ? 5 : totalClasses / 4 + 1;

        for (let i = 0; i < 4; i++) {
          while (draft.completedCourses[i].length < maxCoursesPerColumn) {
            if (dndCourses.length === 0) {
              return draft;
            }
            draft.completedCourses[i].push(dndCourses.shift()!);
          }
        }

        return draft;
      }
      case getType(setCompletedCourses): {
        const [dndCourses, newCounter] = convertToDNDCourses(
          action.payload.completedCourses,
          draft.currentClassCounter
        );
        draft.currentClassCounter = newCounter;

        const totalClasses = action.payload.completedCourses.length;
        const maxCoursesPerColumn =
          totalClasses < 20 ? 5 : totalClasses / 4 + 1;

        for (let i = 0; i < 4; i++) {
          // clear array
          draft.completedCourses[i] = [];
        }

        for (let i = 0; i < 4; i++) {
          while (draft.completedCourses[i].length < maxCoursesPerColumn) {
            if (dndCourses.length === 0) {
              return draft;
            }
            draft.completedCourses[i].push(dndCourses.shift()!);
          }
        }
        return draft;
      }
      case getType(setCompletedCoursesFromMap): {
        draft.completedCourses = action.payload.completedCourses;
        return draft;
      }
      case getType(removeCompletedCoursesAction): {
        for (let i = 0; i < 4; i++) {
          draft.completedCourses[i] = draft.completedCourses[i].filter(
            c => c.dndId !== action.payload.completedCourse.dndId
          );
        }
        return draft;
      }
    }
  });
};