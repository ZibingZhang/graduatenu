import React from "react";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import {
  DNDSchedule,
  Major,
  Schedule,
  Status,
  SeasonWord,
  IWarning,
  DNDScheduleYear,
  DNDScheduleTerm,
  DNDScheduleCourse,
} from "../models/types";
import styled from "styled-components";
import { Year } from "../components/Year";
import {
  convertTermIdToYear,
  convertTermIdToSeason,
  isCoopOrVacation,
  moveCourse,
  planToString,
  COMPLETED_COURSES_AREA_DROPPABLE_ID,
  moveCourseInCompletedCourses,
  moveCourseFromCompletedCourses,
  moveCourseToCompletedCourses,
  moveCourseInSameCompletedCoursesSection,
} from "../utils";
import { TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { majors } from "../majors";
import { CLASS_BLOCK_WIDTH } from "../constants";
import { DropDownModal } from "../components";
import { Sidebar } from "../components/Sidebar";
import { withToast } from "./toastHook";
import { AppearanceTypes } from "react-toast-notifications";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { plans } from "../plans";
import { connect } from "react-redux";
import { AppState } from "../state/reducers/state";
import { Dispatch } from "redux";
import {
  getScheduleFromState,
  getPlanStrFromState,
  getMajorFromState,
  getWarningsFromState,
  getCompletedCoursesFromState,
} from "../state";
import {
  updateSemesterAction,
  setScheduleAction,
  setDNDScheduleAction,
  setCompletedCourses,
  setCompletedCoursesFromMap,
} from "../state/actions/scheduleActions";
import { setPlanStrAction, setMajorAction } from "../state/actions/userActions";
import { ICompletedCoursesMap } from "../state/reducers/scheduleReducer";

const OuterContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: space-between;
`;

const CompletedCoursesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  width: ${CLASS_BLOCK_WIDTH * 4 + 25}px;
  margin-bottom: 12px;
`;

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  margin: 30px;
  background-color: "#ff76ff";
`;

const DropDownWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

interface ToastHomeProps {
  addToast: (message: string, options: any) => void;
  removeToast: (id: string) => void;
  toastStack: {
    content: React.ReactNode;
    id: string;
    appearance: AppearanceTypes;
  }[];
}

interface ReduxStoreHomeProps {
  schedule: DNDSchedule;
  major?: Major;
  planStr?: string;
  warnings: IWarning[];
  completedCourses: ICompletedCoursesMap;
}

interface ReduxDispatchHomeProps {
  updateSemester: (
    year: number,
    season: SeasonWord,
    newSemester: DNDScheduleTerm
  ) => void;
  setPlanStr: (planStr?: string) => void;
  setSchedule: (schedule: Schedule) => void;
  setDNDSchedule: (schedule: DNDSchedule) => void;
  setMajor: (major?: Major) => void;
  setCompletedCoursesFromMap: (courses: ICompletedCoursesMap) => void;
}

type Props = ToastHomeProps &
  ReduxStoreHomeProps &
  ReduxDispatchHomeProps &
  RouteComponentProps;

class HomeComponent extends React.Component<Props> {
  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.warnings !== this.props.warnings) {
      this.updateWarnings();
    }
  }

  updateWarnings() {
    // remove existing toasts
    this.props.toastStack.forEach(t => this.props.removeToast(t.id));

    // add new toasts
    this.props.warnings.forEach(w => {
      this.props.addToast(w.message, {
        appearance: "warning",
        autoDismiss: true,
      });
    });
  }

  onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (
      destination &&
      destination.droppableId.includes(COMPLETED_COURSES_AREA_DROPPABLE_ID) &&
      destination.droppableId === source.droppableId
    ) {
      // to and from completed courses section
      moveCourseInSameCompletedCoursesSection(
        this.props.completedCourses,
        destination,
        source,
        this.props.setCompletedCoursesFromMap
      );
      return;
    }

    if (
      destination &&
      destination.droppableId.includes(COMPLETED_COURSES_AREA_DROPPABLE_ID) &&
      source.droppableId.includes(COMPLETED_COURSES_AREA_DROPPABLE_ID)
    ) {
      // to and from completed courses section
      moveCourseInCompletedCourses(
        this.props.completedCourses,
        destination,
        source,
        this.props.setCompletedCoursesFromMap
      );
      return;
    }

    if (
      destination &&
      destination.droppableId.includes(COMPLETED_COURSES_AREA_DROPPABLE_ID)
    ) {
      // from schedule to completed courses section
      moveCourseToCompletedCourses(
        this.props.completedCourses,
        destination,
        source,
        this.props.schedule,
        this.props.setDNDSchedule,
        this.props.setCompletedCoursesFromMap
      );
      return;
    }

    if (
      destination &&
      source.droppableId.includes(COMPLETED_COURSES_AREA_DROPPABLE_ID)
    ) {
      // from completed courses section to schedule
      moveCourseFromCompletedCourses(
        this.props.completedCourses,
        destination,
        source,
        this.props.schedule,
        this.props.setDNDSchedule,
        this.props.setCompletedCoursesFromMap
      );
      return;
    }

    moveCourse(
      this.props.schedule,
      destination,
      source,
      this.props.setDNDSchedule
    );
  };

  onDragUpdate = (update: any) => {
    const { destination } = update;
    if (
      !destination ||
      !destination.droppableId ||
      destination.droppableId.includes(COMPLETED_COURSES_AREA_DROPPABLE_ID)
    )
      return;

    const destSemesterSeason = convertTermIdToSeason(destination.droppableId);
    const destSemesterYear = convertTermIdToYear(destination.droppableId);
    const destYear: DNDScheduleYear = this.props.schedule.yearMap[
      destSemesterYear
    ];
    const destSemester: DNDScheduleTerm = JSON.parse(
      JSON.stringify((destYear as any)[destSemesterSeason])
    ); // deep copy

    this.removeHovers(destSemester);

    if (
      destSemester.status === "INACTIVE" ||
      destSemester.status === "COOP" ||
      destSemester.status === "HOVERINACTIVE" ||
      destSemester.status === "HOVERCOOP"
    ) {
      if (destSemester.status === "INACTIVE") {
        destSemester.status = "HOVERINACTIVE";
      } else if (destSemester.status === "COOP") {
        destSemester.status = "HOVERCOOP";
      } else if (destSemester.status === "HOVERINACTIVE") {
        destSemester.status = "INACTIVE";
      } else if (destSemester.status === "HOVERCOOP") {
        destSemester.status = "COOP";
      }

      this.props.updateSemester(
        destSemesterYear,
        destSemesterSeason,
        destSemester
      );
    }
  };

  removeHovers(currSemester: DNDScheduleTerm) {
    for (const yearnum of this.props.schedule.years) {
      const year = JSON.parse(
        JSON.stringify(this.props.schedule.yearMap[yearnum])
      ); // deep copy
      // console.log(year.summer1.status.toString());
      if (isCoopOrVacation(year.fall) && year.fall !== currSemester) {
        year.fall.status = year.fall.status.replace("HOVER", "") as Status;
        this.props.updateSemester(yearnum, "fall", year.fall);
      }
      if (isCoopOrVacation(year.spring) && year.spring !== currSemester) {
        year.spring.status = year.spring.status.replace("HOVER", "") as Status;
        this.props.updateSemester(yearnum, "spring", year.spring);
      }
      if (isCoopOrVacation(year.summer1) && year.summer1 !== currSemester) {
        year.summer1.status = year.summer1.status.replace(
          "HOVER",
          ""
        ) as Status;
        this.props.updateSemester(yearnum, "summer1", year.summer1);
      }
      if (isCoopOrVacation(year.summer2) && year.summer2 !== currSemester) {
        year.summer2.status = year.summer2.status.replace(
          "HOVER",
          ""
        ) as Status;
        this.props.updateSemester(yearnum, "summer2", year.summer2);
      }
    }
  }

  onChooseMajor(event: React.SyntheticEvent<{}>, value: any) {
    const maj = majors.find((m: any) => m.name === value);
    this.props.setMajor(maj);
  }

  onChoosePlan(event: React.SyntheticEvent<{}>, value: any) {
    if (value === "None") {
      this.props.setPlanStr(undefined);
      return;
    }

    const plan = plans[this.props.major!.name].find(
      (p: Schedule) => planToString(p) === value
    );

    if (plan) {
      this.props.setPlanStr(value);
      this.props.setSchedule(plan);
    }
  }

  renderMajorDropDown() {
    return (
      <Autocomplete
        style={{ width: 300, marginRight: 18 }}
        disableListWrap
        options={majors.map(maj => maj.name)}
        renderInput={params => (
          <TextField
            {...params}
            variant="outlined"
            label="Select A Major"
            fullWidth
          />
        )}
        value={!!this.props.major ? this.props.major.name + " " : ""}
        onChange={this.onChooseMajor.bind(this)}
      />
    );
  }

  renderPlansDropDown() {
    return (
      <Autocomplete
        style={{ width: 300 }}
        disableListWrap
        options={[
          "None",
          ...plans[this.props.major!.name].map(p => planToString(p)),
        ]}
        renderInput={params => (
          <TextField
            {...params}
            variant="outlined"
            label="Select A Plan"
            fullWidth
          />
        )}
        value={this.props.planStr || "None"}
        onChange={this.onChoosePlan.bind(this)}
      />
    );
  }

  renderYears() {
    return this.props.schedule.years.map((year: number, index: number) => (
      <Year key={index} index={index} schedule={this.props.schedule} />
    ));
  }

  render() {
    const { schedule, major } = this.props;
    return (
      <OuterContainer>
        <DragDropContext
          onDragEnd={this.onDragEnd}
          onDragUpdate={this.onDragUpdate}
        >
          <Container>
            <div /* onClick={() => console.log(this.state)} */>
              <h2>Plan Of Study</h2>
            </div>
            <DropDownWrapper>
              {this.renderMajorDropDown()}
              {!!major && this.renderPlansDropDown()}
            </DropDownWrapper>
            <CompletedCoursesWrapper>
              <h3>Completed Courses</h3>
              <DropDownModal />
            </CompletedCoursesWrapper>
            {this.renderYears()}
          </Container>
        </DragDropContext>
        <Sidebar />
      </OuterContainer>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  schedule: getScheduleFromState(state),
  planStr: getPlanStrFromState(state),
  major: getMajorFromState(state),
  warnings: getWarningsFromState(state),
  completedCourses: getCompletedCoursesFromState(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  updateSemester: (
    year: number,
    season: SeasonWord,
    newSemester: DNDScheduleTerm
  ) => dispatch(updateSemesterAction(year, season, newSemester)),
  setPlanStr: (planStr?: string) => dispatch(setPlanStrAction(planStr)),
  setSchedule: (schedule: Schedule) => dispatch(setScheduleAction(schedule)),
  setDNDSchedule: (schedule: DNDSchedule) =>
    dispatch(setDNDScheduleAction(schedule)),
  setMajor: (major?: Major) => dispatch(setMajorAction(major)),
  setCompletedCoursesFromMap: (courses: ICompletedCoursesMap) =>
    dispatch(setCompletedCoursesFromMap(courses)),
});

export const Home = connect<
  ReduxStoreHomeProps,
  ReduxDispatchHomeProps,
  {},
  AppState
>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(withToast(HomeComponent)));