import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Onboarding } from "./Onboarding/Onboarding";
import { HomeWrapper } from "./home/HomeWrapper";
import { OnboardingInfoScreen } from "./Onboarding/OnboardingInfoScreen";
import { Provider } from "react-redux";
import { Store } from "redux";
import { PersistGate } from "redux-persist/integration/react";
import { Persistor } from "redux-persist";
import { SignupScreen } from "./Onboarding/SignupScreen";
import { LoginScreen } from "./Onboarding/LoginScreen";

export const App = ({
  store,
  persistor,
}: {
  store: Store;
  persistor: Persistor;
}) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <Switch>
            <Route path="/home" component={HomeWrapper} />
            <Route path="/onboarding" component={OnboardingInfoScreen} />
            <Route path="/" exact component={Onboarding} />
            <Route path="/signup" component={SignupScreen} />
            <Route path="/login" component={LoginScreen} />
          </Switch>
        </Router>
      </PersistGate>
    </Provider>
  );
};
