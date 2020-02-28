import React from "react";
import styled from "styled-components";
import { Card } from "@material-ui/core";

const Block = styled(Card)<any>`
  height: 30px;
  border: 1px solid #eb5757;
  box-sizing: border-box;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  margin: 10px 8px 10px 8px;
  display: flex;
  flex-direction: row;
  width: 101px;
`;

const AddBlockBody = styled.div<any>`
  background-color: white;
  padding-left: 8px;
  flex: 1;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 100%;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Title = styled.div`
  font-weight: normal;
  font-size: 14px;
  margin-right: 4px;
  color: #eb5757;
`;

interface AddBlockProps {
  onClick?: () => void;
}

export class AddBlock extends React.Component<AddBlockProps> {
  handleMouseEnter() {
    this.setState({
      hovering: true,
    });
  }

  handleMouseLeave() {
    this.setState({
      hovering: false,
    });
  }

  render() {
    return (
      <div
        onMouseEnter={this.handleMouseEnter.bind(this)}
        onMouseLeave={this.handleMouseLeave.bind(this)}
        onClick={this.props.onClick}
      >
        <Block>
          <AddBlockBody>
            <Wrapper>
              <TitleWrapper>
                <Title>+ Add Class</Title>
              </TitleWrapper>
            </Wrapper>
          </AddBlockBody>
        </Block>
      </div>
    );
  }
}
