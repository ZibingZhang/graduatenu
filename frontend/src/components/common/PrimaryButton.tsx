import React from "react";
import { Button, Tooltip } from "@material-ui/core";
import {
  createStyles,
  withStyles,
  makeStyles,
  Theme,
} from "@material-ui/core/styles";

const ColorButton = withStyles((theme: Theme) => ({
  root: {
    color: "#ffffff",
    paddingVertical: "8px",
    paddingHorizontal: "16px",
    backgroundColor: "#EB5757",
    "&:hover": {
      backgroundColor: "#DB4747",
    },
    "&.Mui-disabled": {
      pointerEvents: "auto",
    },
  },
}))(Button);

export function PrimaryButton(props: any) {
  return (
    <ColorButton
      variant="contained"
      color="primary"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </ColorButton>
  );
}
