import React from "react";
import { SvgIcon } from "@mui/material";

const TriangleRatingIconDown = ({ color }) => (
  <SvgIcon>
    <polygon points="12,22 22,2 2,2" style={{ fill: color }} />
  </SvgIcon>
);

export default TriangleRatingIconDown;