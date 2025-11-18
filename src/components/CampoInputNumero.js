// src/components/CampoInput.jsx
import React from "react";
import { Box, Typography, TextField } from "@mui/material";

const CampoInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
  width = 170,
}) => {
  return (
    <Box display="flex" alignItems="center" gap={1.5} mb={1}>
      <Typography
        sx={{
          width: 150,
          color: "white",
          fontFamily: "Orbitron, sans-serif",
          letterSpacing: "0.05em",
        }}
        variant="h6"
      >
        {label}
      </Typography>

      <TextField
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        size="small"
        variant="outlined"
        placeholder={placeholder}
        sx={{
          width,
          "& .MuiInputBase-input": {
            color: "white",
            fontFamily: "Orbitron, sans-serif",
            letterSpacing: "0.05em",
          },
          "& .MuiOutlinedInput-root": {
            backgroundColor: "black",
            "& fieldset": {
              borderColor: "white",
            },
            "&:hover fieldset": {
              borderColor: "#90caf9",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#42af5f",
            },
          },
        }}
      />
    </Box>
  );
};

export default CampoInput;
