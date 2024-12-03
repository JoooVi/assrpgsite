import React from "react";
import { SvgIcon } from "@mui/material";

const TriangleRatingIcon = ({ color }) => (
  <SvgIcon>
    <polygon points="12,2 22,22 2,22" style={{ fill: color }} />
  </SvgIcon>
);

export default TriangleRatingIcon;