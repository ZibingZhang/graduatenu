import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { GraduateGrey } from "../constants";
import { Button, Card } from "@material-ui/core";
import picture from "../assets/landingils.png";

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  height: 50px;
`;

const Body = styled.div`
  display: flex;
  height: 300px;
  background-color: ${GraduateGrey};
  flex-direction: row;
  justify-content: space-around;
`;

const BodyText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
`;

const TitleText = styled.h2`
  margin-bottom: 2px;
`;

const DescriptionText = styled.p`
  margin-bottom: 30px;
`;

const GraduateLogo = styled.img`
  height: 250px;
  width: 175px;
  align-self: center;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
`;

const ContentWall = styled.div`
  display: flex;
  flex: 1;
`;

const Content = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  flex: 6;
  margin-top: 40px;
`;

const InfoCard = styled(Card)`
  display: flex;
  flex-direction: column;
  height: 250px;
  width: 270px;
  border-radius: 0px !important;
`;

const PurpleHeader = styled.div`
  height: 10px;
  background-color: indigo;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 10px;
  margin-left: 15px;
  margin-right: 15px;
`;

const CardTitleText = styled.h2`
  margin-bottom: 2px;
`;

export class Onboarding extends React.Component {
  renderInfoCard(title: string, desc: string) {
    return (
      <InfoCard>
        <PurpleHeader></PurpleHeader>
        <CardBody>
          <CardTitleText>{title}</CardTitleText>
          <p>{desc}</p>
        </CardBody>
      </InfoCard>
    );
  }

  render() {
    return (
      <Container>
        <Header></Header>
        <Body>
          <BodyText>
            <TitleText>Graduate, on time.</TitleText>
            <DescriptionText>
              Navigate the depths of the Northeastern graduation requirements
              and build a personalized plan of study.
            </DescriptionText>
            <Link to="/home" style={{ textDecoration: "none" }}>
              <Button variant="contained" color="secondary">
                Get Started
              </Button>
            </Link>
          </BodyText>
          <GraduateLogo src={picture} alt="picture"></GraduateLogo>
        </Body>
        <ContentWrapper>
          <ContentWall></ContentWall>
          <Content>
            {this.renderInfoCard(
              "Start",
              "Just answer a couple questions and get started with a multi-year plan for your classes."
            )}
            {this.renderInfoCard(
              "Personalize",
              "Pick the classes you want. We’ll take care of the NUPaths, prereqs, and everything in between."
            )}
            {this.renderInfoCard(
              "Graduate",
              "Build a plan of study that lets you graduate faster, with better classes, and lot less headaches."
            )}
          </Content>
          <ContentWall></ContentWall>
        </ContentWrapper>
      </Container>
    );
  }
}
