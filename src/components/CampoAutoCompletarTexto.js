// src/components/CampoAutocompletarTexto.jsx
import React from "react";
import { Box, Typography, Autocomplete, TextField } from "@mui/material";

const CampoAutocompleteText = ({
  label,
  name,
  value,
  onChange,
  opciones = [],
  width = 240,
}) => {
  return (
    <Box display="flex" alignItems="center" gap={1} mb={1}>
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

      <Autocomplete
        freeSolo
        autoSelect
        openOnFocus
        autoHighlight
        options={opciones}
        value={value || ""}
        onChange={(e, newValue) => {
          onChange({ target: { name, value: newValue || "" } });
        }}
        onInputChange={(e, newInputValue) => {
          onChange({ target: { name, value: newInputValue || "" } });
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}
            size="small"
            variant="outlined"
            required
            sx={{
              width,
              "& .MuiInputBase-input": {
                color: "white",
                letterSpacing: "0.05em",
              },
              "& .MuiOutlinedInput-root": {
                backgroundColor: "black",
                "& fieldset": { borderColor: "white" },
                "&:hover fieldset": { borderColor: "#90caf9" },
                "&.Mui-focused fieldset": { borderColor: "#42af5f" },
              },
            }}
          />
        )}
      />
    </Box>
  );
};

export default CampoAutocompleteText;
