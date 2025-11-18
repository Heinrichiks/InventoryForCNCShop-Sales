import React from "react";
import { opcionesFracciones } from "../datos/opcionesFracciones"; // Asegúrate de que este archivo exista y exporte las opciones
import {Box, Typography, TextField, MenuItem, Autocomplete } from "@mui/material"
import { validatePassword } from "firebase/auth";
// Asegúrate de que las dependencias estén instaladas: npm install @mui/material
// Asegúrate de que las dependencias estén instaladas: npm install react

const CampoConSelectYTexto = React.memo(
  ({ label, nameFraccion, nameDecimal, valueFraccion, valueDecimal, onChange, inputRef }) => {
    return (
      <Box
        display="flex"
        alignItems="center"
        gap={5}
        mb={1}
      >
        <Typography
          sx={{
            width:100, 
            color:"white",
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
          options={opcionesFracciones}
          value={valueFraccion || ""}
          onChange={(event, newValue) => {
            onChange({ target: { name: nameFraccion, value: newValue || "" } });
          }}
          onInputChange={(event, newInputValue) => {
            if (typeof newInputValue === "string") {
              onChange({ target: {name: nameFraccion, value: newInputValue } });
            }
          }}      
          renderInput={(params) => (
            <TextField        
              {...params}
              name={nameFraccion}
              size="small"
              variant="outlined"
              required
              inputRef={inputRef}
              sx={{ 
                width: 200, 
                "& .MuiInputBase-input": {
                  color: "white",
                  fontFamily: "Orbitron, sans-serif",
                  letterSpacing: "0.05em",
                },
                "& .MuiInputBase-root": { color: "white"},
                "& .MuiOutlinedInput-root": {
                  color: "white",
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
          )}
        />
        <TextField
          type="number"
          name={nameDecimal}
          value={valueDecimal || ""}
          onChange={onChange}
          size="small"
          variant="outlined"
          required
          sx={{ 
            width: 190,
            "& .MuiInputBase-input": {
              color: "white",
              fontFamily: "Orbitron, sans-serif",
              letterSpacing: "0.05em",
            },
            "& .MuiInputLabel-root": {color: "white"},
            "& .MuiOutlinedInput-root": {
              color: "white",
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
          inputProps={{ step: "0.125" }}
        />        
      </Box>   
    );  
  }
);

export default CampoConSelectYTexto;