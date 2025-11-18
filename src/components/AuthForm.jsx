import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Paper, TextField, Button, Box, Typography, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modoRegistro, setModoRegistro] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modoRegistro) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("✅ Usuario registrado correctamente");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        alert("✅ Bienvenido mi rey");
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      alert("Error: " + error.message);
    }
  };

  const inputStyles = {
    "& .MuiInputBase-root": {
      backgroundColor: "rgb(0, 0, 0)",
      color: "white",
      input: {
        height: 13,
        color: "white",
        backgroundColor: "transparent",
      },
      fieldset: { "borderColor": "red" },
      "&:hover fieldset": { "borderColor": "blue" },
      "&.Mui-focused fieldset": { "borderColor": "green" },
    },
    "& label": {
      color: "white",
      transform: "translate(14px, 20px) scale(1)",
    },
    "& .Mui-focused label": {
      color: "white",
      transform: "translate(14px, -6px) scale(0.75)",
    },
  };

  return (
    <Paper 
      elevation={6}
      sx={{
        boxShadow: " 0px 0px 20px rgba(19, 73, 143, 0.5)",
        width:"19%",
        margin:"auto",
        mt:6,
        p:4,
        padding: 4,
        borderRadius: 2,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(10px)",  
      }}
    >
      <Box 
        component="form"
        onSubmit={manejarSubmit}
        sx={{
          width:"100%",
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          mt: 4,
        }}
      >
        <Typography variant="h5" color="primary" textAlign="center" gap={1} mb={4} fontWeight="bold">
          {modoRegistro ? "Crear Cuenta" : "Iniciar sesión"}
        </Typography>  

        <Typography variant="subtile2" color="white" fontWeight="bold" letterSpacing={1} mb={0.1}>
          Correo electrónico
        </Typography>
        <TextField
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          sx={inputStyles}
        />

        <Typography variant="subtile2" color="white" fontWeight="bold" letterSpacing={1} mb={0.1}>
          Contraseña
        </Typography>
        <TextField
          type={showPassword ? "text" : "password"}
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          sx={inputStyles}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge= "end" sx={{ backgroundColor: "black", color:"white", height: 40, borderRadius: 10, "&:hover": { backgroundColor: "blue",}, }}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
            
        <Button type="submit" variant="contained" color="primary">
          {modoRegistro ? "Registrarse" : "Entrar"}
        </Button>
        <Button onClick={() => setModoRegistro(!modoRegistro)} color="secondary">
         {modoRegistro ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
        </Button>
      </Box>
    </Paper>
  );
};

export default AuthForm;
