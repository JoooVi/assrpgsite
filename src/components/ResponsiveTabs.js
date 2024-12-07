// ResponsiveTabs.js
import React, { useState } from "react";
import { Tabs, Tab, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const ResponsiveTabs = ({ tabs, value, onChange }) => {
  const handlePrevTab = () => {
    onChange(Math.max(value - 1, 0));
  };

  const handleNextTab = () => {
    onChange(Math.min(value + 1, tabs.length - 1));
  };

  return (
    <div>
      {/* Exibe as setinhas em telas pequenas */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
          display: { xs: "flex", sm: "none" }, // Só visível em telas pequenas
        }}
      >
        <IconButton onClick={handlePrevTab} disabled={value === 0}>
          <ChevronLeftIcon />
        </IconButton>
        <IconButton onClick={handleNextTab} disabled={value === tabs.length - 1}>
          <ChevronRightIcon />
        </IconButton>
      </div>

      {/* Exibe as tabs apenas em telas médias ou maiores */}
      <Tabs
        value={value}
        onChange={(event, newValue) => onChange(newValue)}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{
          display: { xs: "none", sm: "flex" }, // Oculta em telas pequenas
        }}
      >
        {tabs.map((label, index) => (
          <Tab key={index} label={label} sx={{ fontSize: { xs: "10px", sm: "14px" } }} />
        ))}
      </Tabs>
    </div>
  );
};

export default ResponsiveTabs;