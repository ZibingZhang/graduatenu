import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import styled from "styled-components";
import { AddClass } from ".";
import { ScheduleCourse } from "../../../common/types";
import {
  addTransferClassAction,
  removeTransferClassAction,
} from "../state/actions/scheduleActions";
import { AppState } from "../state/reducers/state";
import { AddBlock } from "./ClassBlocks/AddBlock";
import { NonDraggableClassBlock } from "./ClassBlocks/NonDraggableClassBlock";

interface TransferCreditsProps {
  transferCredits: ScheduleCourse[];
}

interface TransferCreditsState {
  modalVisible: boolean;
}

interface ReduxDispatchTransferCreditsProps {
  handleAddClasses: (courses: ScheduleCourse[]) => void;
  onDeleteClass: (course: ScheduleCourse) => void;
}

type Props = TransferCreditsProps & ReduxDispatchTransferCreditsProps;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 36px;
  background-color: #eb5757;
  width: 100%;
  padding: 0px;
`;

const Text = styled.p`
  font-weight: 600;
  font-size: 16px;
  color: white;
`;

const HolderBody = styled.div<any>`
  border: 1px solid rgba(235, 87, 87, 0.5);
  box-sizing: border-box;
  position: relative;
  height: 100%;
  background-color: "rgb(255, 255, 255, 0)";
`;

const ClassWrapper = styled.div`
  width: 25%;
  height: 100%;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
`;

class TransferCreditsComponent extends React.Component<
  Props,
  TransferCreditsState
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  hideModal() {
    this.setState({ modalVisible: false });
  }

  showModal() {
    this.setState({ modalVisible: true });
  }

  onDeleteClass = (course: ScheduleCourse) => {
    this.props.onDeleteClass(course);
  };

  // individual courses
  renderTransferCourses() {
    return this.props.transferCredits.map((scheduleCourse, index) => {
      if (!!scheduleCourse) {
        return (
          <ClassWrapper>
            <NonDraggableClassBlock
              course={scheduleCourse}
              onDelete={this.onDeleteClass.bind(this, scheduleCourse)}
            />
          </ClassWrapper>
        );
      }
    });
  }

  renderContainer() {
    return <Wrapper>{this.renderTransferCourses()}</Wrapper>;
  }

  render() {
    const { modalVisible } = this.state;

    return (
      <div style={{ width: "100%", marginBottom: 28 }}>
        <Container>
          <div>
            <Text>Transfer Credits</Text>
          </div>
        </Container>
        <HolderBody>
          {this.renderContainer()}
          <AddBlock onClick={this.showModal.bind(this)} />
          <AddClass
            visible={modalVisible}
            handleClose={this.hideModal.bind(this)}
            handleSubmit={(courses: ScheduleCourse[]) => {
              // Add the given courses through redux
              this.props.handleAddClasses(courses);
            }}
          ></AddClass>
        </HolderBody>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  handleAddClasses: (courses: ScheduleCourse[]) =>
    dispatch(addTransferClassAction(courses)),
  onDeleteClass: (course: ScheduleCourse) =>
    dispatch(removeTransferClassAction(course)),
});

export const TransferCredits = connect<
  null,
  ReduxDispatchTransferCreditsProps,
  TransferCreditsProps,
  AppState
>(
  null,
  mapDispatchToProps
)(TransferCreditsComponent);