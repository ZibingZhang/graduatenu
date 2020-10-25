import { NamedSchedule } from "../../models/types";
import { mockData } from "../../data/mockData";
import produce from "immer";
import { getType } from "typesafe-actions";
import { SchedulesAction, UserAction } from "../actions";
import {
  setActiveScheduleAction,
  updateActiveSchedule,
  addNewSchedule,
  setSchedules,
  deletePlan,
} from "../actions/schedulesActions";
import { resetUserAction } from "../actions/userActions";

export interface SchedulesState {
  activeSchedule: number;
  schedules: NamedSchedule[];
}

const initialState: SchedulesState = {
  activeSchedule: 0,
  schedules: [],
};

export const schedulesReducer = (
  state: SchedulesState = initialState,
  action: SchedulesAction | UserAction
) => {
  return produce(state, draft => {
    switch (action.type) {
      case getType(setActiveScheduleAction): {
        const { activeSchedule } = action.payload;

        draft.activeSchedule = activeSchedule;

        return draft;
      }
      case getType(updateActiveSchedule): {
        const { updatedSchedule } = action.payload;

        draft.schedules[
          draft.activeSchedule
        ].schedule.present = updatedSchedule;

        return draft;
      }
      case getType(addNewSchedule): {
        const { name, newSchedule } = action.payload;

        const namedSchedule = {
          name: name,
          schedule: { present: newSchedule },
        };

        draft.schedules.push(namedSchedule);
        draft.activeSchedule = draft.schedules.length - 1;

        return draft;
      }
      case getType(setSchedules): {
        const { schedules } = action.payload;

        draft.schedules = schedules;
        draft.activeSchedule = 0;

        return draft;
      }
      case getType(resetUserAction): {
        draft = initialState;
        return draft;
      }
      case getType(deletePlan): {
        const name = action.payload.name;
        draft.schedules = draft.schedules.filter(
          (schedule: NamedSchedule) => schedule.name !== name
        );
        return draft;
      }
    }
  });
};
