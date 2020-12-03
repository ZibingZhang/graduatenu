import React from "react";
import { useSelector } from "react-redux";
import { Redirect, Route, RouteComponentProps } from "react-router-dom";
import { RedirectScreen } from "../../Onboarding/RedirectScreen";
import { getUserId } from "../../state";
import { AppState } from "../../state/reducers/state";
import { isLoggedIn } from "../../utils/auth-helpers";

export function ProtectedRoute({
  component,
  path,
}: {
  component:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
  path: string;
}) {
  const { userId } = useSelector((state: AppState) => ({
    userId: getUserId(state),
  }));

  if (isLoggedIn()) {
    // if user exists in redux
    if (userId) {
      return <Route path={path} component={component} />;
    } else {
      return <RedirectScreen redirectUrl={path} />;
    }
  } else {
    return <Redirect to="/" />;
  }
}