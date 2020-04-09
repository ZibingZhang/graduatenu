import React, { Component } from "react";
import { connect } from "react-redux";
import { AppState } from "../state/reducers/state";
import { Dispatch } from "redux";
import {
  ScheduleCourse,
  Major,
  IRequiredCourse,
  Requirement,
} from "../models/types";
import { getMajorFromState } from "../state";
import { setCompletedCourses } from "../state/actions/scheduleActions";
import styled from "styled-components";
import Checkbox from "@material-ui/core/Checkbox";
import { fetchCourse } from "../api";
import { NextButton } from "../components/common/NextButton";
import { Link, withRouter, RouteComponentProps } from "react-router-dom";
import { GenericOnboardingTemplate } from "./GenericOnboarding";
import Paper from "@material-ui/core/Paper";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import Grid from "@material-ui/core/Grid";
import { Link as ButtonLink, Button } from "@material-ui/core";
import Collapse from "@material-ui/core/Collapse";

const MainTitleText = styled.div`
  font-size: 16px;
  margin-left: 4px;
  margin-top: 10px;
  margin-bottom: 10px;
  font-weight: 500;
`;

const TitleText = styled.div`
  font-size: 12px;
  margin-left: 4px;
  margin-top: 16px;
  margin-bottom: 8px;
  font-weight: 500;
`;

const CourseWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const CourseText = styled.p`
  font-size: 12px;
  margin: 1px;
  font-weight: 400;
`;

function flatten(reqs: Requirement[]): IRequiredCourse[][] {
  return reqs.map(flattenOne).reduce((array, cur) => array.concat(cur), []);
}

function flattenOne(req: Requirement): IRequiredCourse[][] {
  if (req.type === "COURSE") {
    return [[req as IRequiredCourse]];
  } else if (
    req.type === "AND" &&
    req.courses.filter(c => c.type === "COURSE").length
  ) {
    return [req.courses as IRequiredCourse[]];
  } else if (req.type === "AND" || req.type === "OR") {
    return flatten(req.courses);
  } else {
    return [];
  }
}

interface CompletedCoursesScreenProps {
  major: Major;
  setCompletedCourses: (completedCourses: ScheduleCourse[]) => void;
}

type Props = CompletedCoursesScreenProps & RouteComponentProps;

interface State {
  selectedCourses: ScheduleCourse[];
  expandedSections: Map<String, Boolean>;
}

class CompletedCoursesComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    let expanded = new Map<String, Boolean>();
    this.props.major.requirementGroups.forEach(reqGroups =>
      expanded.set(reqGroups, false)
    );

    this.state = {
      selectedCourses: [],
      expandedSections: expanded,
    };
  }

  onSubmit() {
    this.props.setCompletedCourses(this.state.selectedCourses);
  }

  async onChecked(e: any, course: IRequiredCourse) {
    const checked = e.target.checked;

    if (checked) {
      const scheduleCourse = await fetchCourse(
        course.subject,
        String(course.classId)
      );
      if (scheduleCourse) {
        this.setState({
          selectedCourses: [...this.state.selectedCourses, scheduleCourse],
        });
      }
    } else {
      let courses = this.state.selectedCourses.filter(
        c =>
          c.subject !== course.subject && c.classId !== String(course.classId)
      );
      this.setState({
        selectedCourses: courses,
      });
    }
  }

  onExpand(requirementGroup: string, change: Boolean) {
    this.state.expandedSections.set(requirementGroup, change);
    this.setState({
      expandedSections: this.state.expandedSections,
    });
  }

  renderShowLink(requirementGroup: string, more: boolean) {
    let variable = more ? "more" : "less";
    return (
      <ButtonLink
        component="button"
        underline="always"
        onClick={() => {
          this.onExpand(requirementGroup, more);
        }}
        style={{ color: "#EB5757" }}
      >
        <CourseText>{"See " + variable + "..."}</CourseText>
      </ButtonLink>
    );
  }

  renderCourse(courses: IRequiredCourse[]) {
    let allCourse = courses.map(course => course.subject + course.classId);
    return (
      <CourseWrapper key={allCourse[0]}>
        <Checkbox
          style={{ width: 2, height: 2 }}
          icon={<CheckBoxOutlineBlankIcon style={{ fontSize: 20 }} />}
          checkedIcon={
            <CheckBoxIcon style={{ fontSize: 20, color: "#EB5757" }} />
          }
          onChange={e => courses.forEach(course => this.onChecked(e, course))}
        />
        <CourseText>{allCourse.join(" and ")}</CourseText>
      </CourseWrapper>
    );
  }

  parseCourseRequirements(reqs: IRequiredCourse[][]) {
    return reqs.map((r: IRequiredCourse[], index: number) => (
      <div key={index}>{this.renderCourse(r)}</div>
    ));
  }

  renderSection(requirementGroup: string) {
    const reqs = this.props.major.requirementGroupMap[requirementGroup];
    if (!reqs) {
      return <div key={requirementGroup} />;
    }

    if (reqs.type === "RANGE") {
      return <div key={requirementGroup} />;
    }
    let allCourse = flatten(reqs.requirements);
    if (allCourse.length <= 4) {
      return (
        <div key={requirementGroup}>
          <TitleText>{requirementGroup}</TitleText>
          {this.parseCourseRequirements(allCourse)}
        </div>
      );
    } else {
      return (
        <div key={requirementGroup}>
          <TitleText>{requirementGroup}</TitleText>
          {this.parseCourseRequirements(allCourse.slice(0, 4))}
          <Collapse
            in={!this.state.expandedSections.get(requirementGroup)}
            unmountOnExit
          >
            {this.renderShowLink(requirementGroup, true)}
          </Collapse>
          <Collapse
            in={!!this.state.expandedSections.get(requirementGroup)}
            unmountOnExit
          >
            {this.parseCourseRequirements(allCourse.slice(4, allCourse.length))}
            {this.renderShowLink(requirementGroup, false)}
          </Collapse>
        </div>
      );
    }
  }

  render() {
    let reqLen = this.props.major.requirementGroups.length;
    let split = Math.floor(reqLen / 2) + 1;
    return (
      <GenericOnboardingTemplate screen={1}>
        <MainTitleText>Completed courses:</MainTitleText>
        <Paper
          elevation={0}
          style={{
            minWidth: 800,
            maxWidth: 800,
            minHeight: 300,
            maxHeight: 300,
            overflow: "auto",
          }}
        >
          <Grid container justify="space-evenly">
            <Grid key={0} item>
              <Paper elevation={0} style={{ minWidth: 300, maxWidth: 400 }}>
                {this.props.major.requirementGroups
                  .slice(0, split)
                  .map(r => this.renderSection(r))}
              </Paper>
            </Grid>
            <Grid key={1} item>
              <Paper elevation={0} style={{ minWidth: 300, maxWidth: 400 }}>
                {this.props.major.requirementGroups
                  .slice(split, reqLen)
                  .map(r => this.renderSection(r))}
              </Paper>
            </Grid>
          </Grid>
        </Paper>
        <Link
          to={"/home"}
          onClick={this.onSubmit.bind(this)}
          style={{ textDecoration: "none" }}
        >
          <NextButton />
        </Link>
      </GenericOnboardingTemplate>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  major: getMajorFromState(state)!,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  setCompletedCourses: (completedCourses: ScheduleCourse[]) =>
    dispatch(setCompletedCourses(completedCourses)),
});

export const CompletedCoursesScreen = withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(CompletedCoursesComponent)
);
