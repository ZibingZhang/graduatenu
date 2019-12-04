import React from "react";
import { Droppable } from "react-beautiful-dnd";
import { ClassBlock } from "./ClassBlocks";
import { AddClassModal, ClassList, EmptyBlock } from ".";
import { DNDScheduleTerm, ScheduleCourse } from "../models/types";
import { AddButton } from "./Year";
import styled from "styled-components";

const Container = styled.div`
  border: 1px solid black;
  position: relative;
  height: 100%;
`;

const AddButtonContainer = styled.div`
	position: absolute;
	right: 6px
	bottom: 6px
	zIndex: 1
`;

const NoClassBlock = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: grey;
  height: 100%;
`;

interface SemesterBlockProps {
  semester: DNDScheduleTerm;
  handleAddClasses: (courses: ScheduleCourse[]) => void;
}

interface SemesterBlockState {
  modalVisible: boolean;
}

export class SemesterBlock extends React.Component<
  SemesterBlockProps,
  SemesterBlockState
> {
  constructor(props: SemesterBlockProps) {
    super(props);
    this.state = {
      modalVisible: false,
    };
  }

  showModal() {
    this.setState({ modalVisible: true });
  }

  hideModal() {
    this.setState({ modalVisible: false });
  }

  renderBody() {
    const status = this.props.semester.status;
    if (status === "CLASSES" || status === "HOVERINACTIVE") {
      return this.props.semester.classes.map((scheduleCourse, index) => {
        if (!!scheduleCourse) {
          return (
            <ClassBlock key={index} class={scheduleCourse} index={index} />
          );
        }
        return <EmptyBlock key={index} />;
      });
    }

    if (status === "COOP") {
      return (
        <NoClassBlock>
          <p>CO-OP</p>
        </NoClassBlock>
      );
    }

    if (status === "INACTIVE") {
      return (
        <NoClassBlock>
          <p>VACATION</p>
        </NoClassBlock>
      );
    }
  }

  render() {
    return (
      <div>
        <AddClassModal
          visible={this.state.modalVisible}
          handleClose={this.hideModal.bind(this)}
          handleSubmit={this.props.handleAddClasses}
        ></AddClassModal>

        <Container>
          <Droppable droppableId={this.props.semester.termId.toString()}>
            {provided => (
              <ClassList
                innerRef={provided.innerRef as any}
                {...provided.droppableProps}
              >
                {this.renderBody()}
                {provided.placeholder}
              </ClassList>
            )}
          </Droppable>
          <AddButtonContainer>
            <AddButton onClick={this.showModal.bind(this)}></AddButton>
          </AddButtonContainer>
        </Container>
      </div>
    );
  }
}
