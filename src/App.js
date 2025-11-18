// src/App.js
import React, { useEffect, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import MaterialForm from "./components/MaterialForm";
import AuthForm from "./components/AuthForm";
import MaterialList from "./components/MaterialList";
import QuoteForm from "./components/QuoteForm";
import Carrito from "./components/Carrito";
import PricePerWeight from "./components/PricePerWeight";
import PrecioPorPesoForm from "./components/PrecioPorPesoForm";
import PriceMaterialList from "./components/PriceMaterialList";
import { Button, Box, Typography, Icon } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { animate } from 'animejs';
import EstrellaMuerte3D from "./components/EstrellaMuerte3D";


const theme = createTheme({
  typography: {
    fontFamily: "Orbitron, sans-serif",
    allVariants: {
      color: "white", // Color text in all components
    },
  },
  components: {
    MuiAutocomplete: {
      styleOverrides: {
        paper:{
          backgroundColor: "black",
          border: "1px solid white",
        },
        option: {
          fontFamily: "Orbitron, sans-serif",
          color: "white",
          letterSpacing: "0.05em",
          "&.Mui-focused": {
            backgroundColor: "rgba(20, 117, 47, 1) !important",
          },
          '&[aria-selected="true"]': {
            backgroundColor: "rgba(255, 0, 0, 0.5)",
          },
        },
        clearIndicator: {
          color: "white", // Color del icono de limpiar
          "&:hover": {
            backgroundColor: "rgba(255, 0, 0, 0.7)", // Color de fondo al pasar el mouse
          },
        },
        popupIndicator: {
          color: "white", // Color del icono del popup
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "white",
            },
            "&:hover fieldset": {
              borderColor: "red",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#6aa84f",
            },
          },
          input: {
            color: "white",
          },
          label: {
            color: "white",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: "bold",
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          color: "white",
        },
        selectIcon: {
          color: "white",
        },
        select: {
          color: "white",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "black",
          border: "1px solid white",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: "white",
          fontFamily: "Orbitron, sans-serif",
          "&:hover": {
            backgroundColor: "rgba(0, 255, 0, 0.2)",
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(0, 255, 0, 0.3)",
            "&:hover": {
              backgroundColor: "rgba(0, 255, 0, 0.4)",
            },
          },
        },
      },
    },
  },
});


function App() {
  const [usuario, setUsuario] = useState(null);
  const [vista, setVista] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [modoEditar, setModoEditar] = useState(false);
  const [formData, setFormData] = useState({
    categoria: "",
    nombre: "",
    figura: "",
    espesorFraccion: "",
    espesorDecimal: "",
    diametroFraccion: "",
    diametroDecimal: "",
    anchoFraccion: "",
    anchoDecimal: "",
    largoFraccion: "",
    largoDecimal: "",
    cantidad: 0,
    min: 0,
    max: 0,
    costoPulgadaCuadrada: 0,
    costoPulgadaLineal: 0,
    ordenDeCompra: "",
  });

  const agregarAlCarrito = (material) => {
    setCarrito((prev) => [...prev, material]);
  }

  const [formDataPrecio, setFormDataPrecio] = useState({
      nombre: "",
      figura: "",
      medidareferencia: "",
      acabado: "",
      densidadlpi3: "",
      preciolibra: "",
      proveedor: ""
    });
    const [modoEditarPrecio, setModoEditarPrecio] = useState(false);

    const logoRef = useRef(null);
    const tituloRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuarioFirebase) => {
      setUsuario(usuarioFirebase);
    });
    return () => unsubscribe(); // limpia el listener al desmontar
  }, []);

  useEffect(() => {
  if (usuario && logoRef.current && tituloRef.current) {
    // Animación sutil del logo
    animate(logoRef.current, {
      scale: [0.8, 1],
      opacity: [0, 1],
      duration: 1000,
      ease: 'out(3)'
    });

    // Animación sutil del título
    animate(tituloRef.current, {
      x: [-30, 0],
      opacity: [0, 1],
      duration: 1200,
      ease: 'out(3)',
      delay: 200
    });
  }
}, [usuario]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ padding:3 }}>
          
        {usuario ? (
          <>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb:2,
              }}
            >
              <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                <img
                  ref={logoRef}
                  src="/logo.png"
                  alt="logo"
                  style={{height: 70, width: 70, opacity: 0}}
                />
              <Typography
                ref={tituloRef}
                variant="h4"
                sx={{
                  opacity:0,
                  fontWeight: "bold",
                  fontSize: "1.5rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "white",
                  backgroundColor: "secondary.main",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  transition: "background-color 0.3s ease",
                  "&:hover": {
                    backgroundColor: "secondary.dark",
                  },
                }}
              >
                Gestión de Inventario
              </Typography>
              </Box>
              <Box>
                <EstrellaMuerte3D/>
              </Box>
              <Box sx= {{ mr: -120 }}>
              </Box>
              <Button 
                variant="contained"
                color="error"
                size="small"            
                onClick={() => auth.signOut()}
                sx={{ 
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                  letterSpacing: "0.05em",
                }}
              >
                <LogoutIcon sx={{ mr: 1 }} />              
                Cerrar sesión              
              </Button>
            </Box>
              
            <Box sx={{ mb: 2, display: "flex", gap: 2 }}>

              <Button
                startIcon={
                  <img
                    src="/entradaMaterial.png"
                    alt="entrada de material"
                    style={{ height: 30, marginRight: 8 }}
                  />
                }
                variant={vista === "formulario" ? "contained" : "outlined"}
                color="primary"
                onClick={() => setVista("formulario")}
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                  letterSpacing: "0.05em",
                  borderRadius: 5,                
                  borderColor: "secondary.main",
                  color: "white",

                }}
              >
                Entrada de material
              </Button>

              <Button
                startIcon={
                  <img
                    src="/inventario.png"
                    alt="consulta de inventario"
                    style={{ height: 30, marginRight: 8 }}
                  />
                }
                variant={vista === "inventario" ? "contained" : "outlined"}
                color="primary"
                onClick={() => setVista("inventario")}
                sx={{ 
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                  letterSpacing: "0.05em",
                  borderRadius: 5,
                  borderColor: "secondary.main",
                  color: "white",

                }}
              >
                Consulta de Inventario
              </Button>

              <Button
                startIcon={
                  <img
                    src="/cotizacion.png"
                    alt="cotización de material"
                    style={{ height: 30, marginRight: 8 }}
                  />
                }
                variant={vista === "cotizacion" ? "contained" : "outlined"}
                color="primary"
                onClick={() => setVista("cotizacion")}
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                  letterSpacing: "0.05em",
                  borderRadius: 5,
                  borderColor: "secondary.main",
                  color: "white",

                }}
              >
                Cotización de Material
              </Button>

              <Button
                startIcon={
                  <img
                    src="/carrito.png"
                    alt="ver carrito"
                    style={{ height: 30, marginRight: 8 }}
                  />
                }
                variant={vista === "carrito" ? "contained" : "outlined"}
                color="primary"
                onClick={() => setVista("carrito")}
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                  letterSpacing: "0.05em",
                  borderRadius: 5,
                  borderColor: "secondary.main",
                  color: "white",

                }}
              >
                Ver Carrito
              </Button>

              <Button
                startIcon={
                  <img
                    src="/priceperweight.png"
                    alt="priceperweight"
                    style={{ height: 30, marginRight: 8 }}
                  />
                }
                variant={vista === "pricePerWeight" ? "contained" : "outlined"}
                color="primary"
                onClick={() => setVista("pricePerWeight")}
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                  letterSpacing: "0.05em",
                  borderRadius: 5,
                  borderColor: "secondary.main",
                  color: "white",

                }}
              >
                Precio por peso
              </Button>
            </Box>

            <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
              <Button
                startIcon={
                  <img
                    src="/priceperweight.png"
                    alt="formulario precio peso"
                    style={{ height: 30, marginRight: 8 }}
                  />
                }
                variant={vista === "formularioPrecioPeso" ? "contained" : "outlined"}
                color="primary"
                onClick={() => setVista("formularioPrecioPeso")}
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                  letterSpacing: "0.05em",
                  borderRadius: 5,
                  borderColor: "secondary.main",
                  color: "white",
                }}
              >
                Entrada Precio/Peso
              </Button>

              <Button
                startIcon={
                  <img
                    src="/list.png" 
                    alt="lista precios" 
                    style={{ height: 30, marginRight: 8 }}
                  />
                }
                variant={vista === "listaPreciosPeso" ? "contained" : "outlined"}
                color="primary"
                onClick={() => setVista("listaPreciosPeso")}
                sx={{
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                  letterSpacing: "0.05em",
                  borderRadius: 5,
                  borderColor: "secondary.main",
                  color: "white",
                }}
              >
                Lista Precios/Peso
              </Button>
            </Box>

            <Box>
              {vista === "formulario" && (
                <MaterialForm
                  formData={formData}
                  setFormData={setFormData}
                  modoEditar={modoEditar}
                  setModoEditar={setModoEditar}
                  setVista={setVista} // Esto nos permitira volver a la lista de materiales
                />
              )}
              {vista === "inventario" && (
                <MaterialList
                  setFormData={setFormData}
                  setModoEditar={setModoEditar}
                  setVista={setVista} // Esto nos permitira mostrar el formulario de edición
                />
              )}
              {vista === "cotizacion" && <QuoteForm agregarAlCarrito={agregarAlCarrito} />}
              {vista === "carrito" && (
                <Carrito
                  carrito={carrito}
                  actualizarCarrito={(id, campo, valor) => {
                    setCarrito((prev) =>
                      prev.map((item) =>
                        item.id === id ? { ...item, [campo]: valor } : item
                      )
                    );
                  }}
                  eliminarDelCarrito={(id) => {
                    setCarrito((prev) => prev.filter((item) => item.id !== id));
                  }}
                />
              )}
              {vista=== "pricePerWeight" && (
                <PricePerWeight
                  PricePerWeight={PricePerWeight}
                > </PricePerWeight> 
              )}
              {vista === "formularioPrecioPeso" && (
                <PrecioPorPesoForm
                  formData={formDataPrecio}
                  setFormData={setFormDataPrecio}
                  modoEditar={modoEditarPrecio}
                  setModoEditar={setModoEditarPrecio}
                  setVista={setVista} // Esto nos permitira volver a la lista de materiales
                />
              )}
              {vista === "listaPreciosPeso" && (
                <PriceMaterialList
                  setFormData={setFormDataPrecio}
                  setModoEditar={setModoEditarPrecio}
                  setVista={setVista}
                />
              )}
            </Box>
        </>
      ) : (
        <>
          <Typography
            variant="h4"
            sx={{
              color: "white",
              mb: 2,
              textAlign: "center",
              }}
            >
              Gestión de Inventario
          </Typography>
          <AuthForm />
        </>
      )}
    </Box>
  </ThemeProvider>
  );
}
  

export default App;
