import React from "react";
import { DNDSchedule, Major } from "../../models/types";
import styled from "styled-components";
import { GraduateGrey } from "../../constants";
import { RequirementSection } from ".";
import { produceRequirementGroupWarning } from "../../utils";
import { AppState } from "../../state/reducers/state";
import { getScheduleFromState, getMajorFromState } from "../../state";
import { connect } from "react-redux";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 200px;
  background-color: ${GraduateGrey};
  border-left: 1px solid black;
  padding: 12px;
`;

const MajorTitle = styled.p`
  font-size: 20px;
  font-weight: bold;
`;

interface Props {
  schedule: DNDSchedule;
  major?: Major;
}

const SidebarComponent: React.FC<Props> = ({ schedule, major }) => {
  if (!major) {
    return (
      <Container>
        <MajorTitle>No major selected</MajorTitle>
      </Container>
    );
  }

  const warnings = produceRequirementGroupWarning(
    JSON.parse(JSON.stringify(schedule)),
    major
  ); // deep copy of schedule

  return (
    <Container>
      <MajorTitle>{major.name}</MajorTitle>
      {major.requirementGroups.map((req, index) => {
        return (
          <RequirementSection
            title={req}
            contents={major.requirementGroupMap[req]}
            warning={warnings.find(w => w.requirementGroup === req)}
            key={index}
          ></RequirementSection>
        );
      })}
    </Container>
  );
};

const mapStateToProps = (state: AppState) => ({
  schedule: getScheduleFromState(state),
  major: getMajorFromState(state),
});

export const Sidebar = connect(mapStateToProps)(SidebarComponent);