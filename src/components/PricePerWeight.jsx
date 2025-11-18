import React, { useState, useEffect, useMemo } from "react";
import { collection, doc, getDocs, } from "firebase/firestore";
import { db } from "../firebase";
import { Box, Typography, Autocomplete, TextField, Grid, Button, Stack, } from "@mui/material";
import RecordTable from "./RecordTable.jsx";
import {exportarPDF, exportarExcel, enviarPorEmail, compartirWhatsApp, copiarAlPortapapeles } from './exportFunctions.js';

const PricePerWeight = () => {
  const [precioporpeso, setPrecioporpeso] = useState ([]);
  const [nombre, setNombre] = useState(null);
  const [figura, setFigura] = useState(null);
  const [medidareferencia, setMedidaReferencia] = useState(null);
  const [acabado, setAcabado] = useState(null);
  const [cantidad, setCantidad] = useState(null);
  const [diametro, setDiametro] = useState(null);
  const [espesor, setEspesor] = useState(null);
  const [ancho, setAncho] = useState(null);
  const [largo, setLargo] = useState(null);
  const [densidadlpi3, setDensidadlpi3] = useState(null);
  const [volumen, setVolumen] = useState(null);
  const [peso, setPeso] = useState(null);
  const [costo, setCosto] = useState(null);
  const [porcentajeGanancia, setPorcentajeGanancia] = useState(null);
  const [precioVenta, setPrecioVenta] = useState(null);
  const [subtotal, setSubtotal] = useState(null);
  const [iva, setIva] = useState(null);
  const [totalConIva, setTotalConIva] = useState(null);
  const [materialSeleccionado, setMaterialSeleccionado] = useState(null)
  const [costoSeleccionado, setCostoSeleccionado] = useState(null);
  const [costoInputValue, setCostoInputValue] = useState("");
  const [proveedor, setProveedor] = useState(null);
  const [fecha, setFecha] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [mostrarTabla, setMostrarTabla] = useState(false);

  // Options of material uniques (strings) memoized
  const materialOptions = useMemo(
    () =>
      Array.from(
        new Set(precioporpeso.map((item) => item.nombre).filter(Boolean))
      ),
    [precioporpeso]
  );  

  // Options of figura based on selected material memoized
  const figuraOptions = useMemo(() => {
    if (!materialSeleccionado) return [];
    return Array.from(
      new Set(
        precioporpeso
          .filter((item) => item.nombre === materialSeleccionado)
          .map((item) => item.figura)
          .filter(Boolean)
      )
    );
  }, [precioporpeso, materialSeleccionado]);

  // Options of medidaReferencia based on selected figura memoized
  const medidarefOptions = useMemo(() => {
    if (!materialSeleccionado || !figura) return [];
    return Array.from(
      new Set(
        precioporpeso
          .filter((item) => item.nombre === materialSeleccionado && item.figura === figura)
          .map((item) => item.medidareferencia)
          .filter(Boolean)
      )
    );
  }, [precioporpeso, materialSeleccionado, figura]);

  // Options of acabado based on selected medidaReferencia memoized
  const acabadoOptions = useMemo(() => {
    if (!materialSeleccionado || !figura || !medidareferencia) return [];
    return Array.from(
      new Set(
        precioporpeso
          .filter((item) => item.nombre === materialSeleccionado && item.figura === figura && item.medidareferencia === medidareferencia)
          .map((item) => item.acabado)
          .filter(Boolean)
      )
    );
  }, [precioporpeso, materialSeleccionado, figura, medidareferencia]);

  // Options of preciolibra based on selected acabado memoized
  const precioOptions = useMemo(() => {
    if (!materialSeleccionado || !figura || !medidareferencia || !acabado) return [];
    return Array.from(
      new Set(
        precioporpeso
          .filter(
            (i) =>
              i.nombre === materialSeleccionado && i.figura === figura && i.medidareferencia === medidareferencia && i.acabado === acabado
          )
          .map((i) => i.preciolibra)
          .filter((v) => v !== undefined && v !== null)
      )
    );
  }, [precioporpeso, materialSeleccionado, figura, medidareferencia, acabado]);

  // Options of proveedor based on selected costoSeleccionado memoized
  const proveedorOptions = useMemo(() => {
    if (!materialSeleccionado || !figura || !medidareferencia || !acabado || (!costoSeleccionado === null)) return [];
    return Array.from(
      new Set(
        precioporpeso
          .filter(
            (i) =>
              i.nombre === materialSeleccionado && i.figura === figura && i.medidareferencia === medidareferencia && i.acabado === acabado && String(i.preciolibra) === String(costoSeleccionado)
          )
          .map((i) => i.proveedor)
          .filter(Boolean)
      )
    );
  }, [precioporpeso, materialSeleccionado, figura, medidareferencia, acabado, costoSeleccionado]);

  // Options of fecha based on selected proveedor memoized
  const fechaOptions = useMemo(() => {
    if (
      !materialSeleccionado ||
      !figura ||
      !medidareferencia ||
      !acabado ||
      (!costoSeleccionado === null) ||
      !proveedor
    ) return [];

    return Array.from(
      new Set(
        precioporpeso
          .filter(
            (i) =>
              i.nombre === materialSeleccionado &&
              i.figura === figura &&
              i.medidareferencia === medidareferencia &&
              i.acabado === acabado &&
              String(i.preciolibra) === String(costoSeleccionado) &&
              i.proveedor === proveedor
          )
          .map((i) => i.fecha)
          .filter(Boolean)
      )
    );
  }, [precioporpeso, materialSeleccionado, figura, medidareferencia, acabado, costoSeleccionado, proveedor]);

  // Function to clean all fields
  const limpiarFiltros = () => {
    setMaterialSeleccionado(null);
    setFigura(null);
    setMedidaReferencia(null);
    setAcabado(null);
    setCostoSeleccionado(null);
    setCostoInputValue("");
    setProveedor(null);
    setFecha(null);
    setCantidad("");
    setDiametro("");
    setEspesor("");
    setAncho("");
    setLargo("");
    setDensidadlpi3("");
    setPorcentajeGanancia("");
    setIva("");
    setTotalConIva("");
  };

  // Function to add register to the registros array
  const agregarRegistro = () => { 
    if (!materialSeleccionado || !figura || !medidareferencia || !acabado || !costoSeleccionado || !cantidad || !largo || !porcentajeGanancia) {
      alert("Por favor completa todos los campos necesarios antes de agregar a la tabla.");
      return;
    }
    const nuevoRegistro = {
    id: Date.now(),
    material: materialSeleccionado,
    figura: tipoFigura,
    medidareferencia: medidareferencia,
    acabado: acabado,
    cantidad: parseFloat(cantidad) || 0,
    espesor: parseFloat(espesor) || 0,
    diametro: parseFloat(diametro) || 0,
    ancho: parseFloat(ancho) || 0,
    largo: parseFloat(largo) || 0,
    volumen: parseFloat(volumen) || 0,
    densidad: parseFloat(densidadlpi3) || 0,
    peso: parseFloat(peso) || 0,  
    costo: parseFloat(costo) || 0,
    porcentajeGanancia: parseFloat(porcentajeGanancia) || 0,
    precioVenta: parseFloat(precioVenta) || 0,
    subtotal: parseFloat(subtotal) || 0,
    iva: parseFloat(iva) || 0,
    totalConIva: parseFloat(totalConIva) || 0,
    proveedor: proveedor || '-',
    fecha: fecha || '-'
  };

    setRegistros([...registros, nuevoRegistro]);
    setMostrarTabla(true);
  
    alert("✅ Registro agregado correctamente");

    limpiarFiltros();
  };


  useEffect(() => {
    const ppw = async () => {
      const querySnapshot = await getDocs(collection(db, "precioporpeso"));
      const precioporpesoData=querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPrecioporpeso(precioporpesoData);
    };
      ppw();
  }, []);

    useEffect(() => {
      
      let vol = 0;

      const tipoFigura = typeof figura === "string" ? figura : figura?.figura;

      if (tipoFigura) {
        const e = parseFloat(espesor) || 0;
        const a = parseFloat(ancho) || 0;
        const l = parseFloat(largo) || 0;
        const d = parseFloat(diametro) || 0;

        if(["Placa", "Hoja", "Solera"].includes(tipoFigura)) {
          
          vol = e * a * l;
        
        } else if (tipoFigura === "Redondo") {

          const r = d / 2;

          vol = Math.PI * Math.pow(r, 2) * l;
        }
      }

      setVolumen(vol ? vol.toFixed(3) : "");
    }, [espesor, ancho, largo, diametro, figura]);


    useEffect(() => {

      let pes = 0;

        const v = parseFloat(volumen) || 0;
        const d = parseFloat(densidadlpi3) || 0;
      
      pes = v * d;

      setPeso(pes ? pes.toFixed(3) : "");
    }, [volumen, densidadlpi3]);

    useEffect(() => {

      let cos = 0;

        const c = typeof costoSeleccionado === "object"
          ? parseFloat(costoSeleccionado?.preciolibra) || 0
          : parseFloat(costoSeleccionado) || 0;
        const ps = parseFloat(peso) || 0;

        cos = c * ps;
        
       setCosto(cos ? cos.toFixed(2) : "");      
      }, [costoSeleccionado, peso]);

    useEffect(() => {

      const cos = parseFloat(costo) || 0;
      const pg = parseFloat(porcentajeGanancia) || 0;

      const pv = cos * (1 + pg/100 );

      setPrecioVenta( pv ? pv.toFixed(2) : "");
    }, [costo, porcentajeGanancia])


    useEffect(() => {

        const pv = parseFloat(precioVenta) || 0;
        const can = parseFloat(cantidad) || 0;

        const sub =  pv * can;

        setSubtotal( sub ? sub.toFixed(2) : "");
      }, [precioVenta, cantidad]);
    
    
    useEffect(() => {

      const ivaRate = 0.08; // 8% IVA
      const sub = parseFloat(subtotal) || 0;
    
      const ivaValue = sub * ivaRate;
      const totalConIvaValue = sub + ivaValue;

      setIva( ivaValue ? ivaValue.toFixed(2) : "");
      setTotalConIva(totalConIvaValue ? totalConIvaValue.toFixed(2) : "");
    }, [subtotal]);
    
      const tipoFigura = typeof figura === "string" ? figura : figura?.figura;
      const isRectangular = ["Placa", "Hoja", "Solera"].includes(tipoFigura);
      const isRound = tipoFigura === "Redondo";

    

      // Function to eliminate a record
      const eliminarRegistro = (id) => {
        if (window.confirm('¿Estás seguro de eliminar este registro?')) {
          setRegistros(registros.filter(r => r.id !== id));
          if (registros.length === 1) {
            setMostrarTabla(false);
          }
        }
      };

    const manejarExportacion = (tipo) => {
      switch(tipo) {
        case 'pdf':
          exportarPDF(registros, 'HIKS');
          break;
        case 'excel':
          exportarExcel(registros, 'Cotización');
          break;
        case 'email':
          enviarPorEmail(registros);
          break;
        case 'whatsapp':
          compartirWhatsApp(registros);
          break;
        case 'copiar':
          copiarAlPortapapeles(registros);
          break;
        default:
          break;
      }
    };

  return (
    <Box sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
          backgroundColor: "white",
          padding: 1,
          borderRadius: 3,
        }}
      >
        <Box sx={{ mr: 2 }}>
          <img
            src="/priceperweight.png"
            alt="Lista"
            style={{
              width: 30,
              height: 30,
              marginRight: 3,
              marginLeft: 7,
              marginBottom: 3,
            }}
          />
        </Box>
        <Typography
          gutterBottom
          sx={{
            color: "black",
            fontSize: "1.5rem",
            fontWeight: "bold",
            letterSpacing: "0.05em",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexGrow: 1,
          }}
        >
          Calcular precio por peso
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 2, mt: 3, mb: 2, ml: 7 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={12} md={4}>
            <Stack spacing={2}>
              <Autocomplete
                autoSelect
                openOnFocus
                autoHighlight
                options={materialOptions}
                value={materialSeleccionado}
                onChange={(event, value) => {
                  setMaterialSeleccionado(value);
                  setFigura(null);
                  setMedidaReferencia(null);
                  setAcabado(null);
                  setCostoSeleccionado(null);
                  setCostoInputValue("");
                  setProveedor(null);
                  setFecha(null);
                  // densidadlpi3 based on selected material  
                  const materialData = precioporpeso.find((m) => m.nombre === value);
                  setDensidadlpi3(materialData?.densidadlpi3 || "");
                }}
                getOptionLabel={(option) => option || ""}
                sx={{ width: 270 }}
                renderInput={(params) => (
                  <TextField {...params} label="Material" variant="outlined" />
                )}
              />
              
              <Autocomplete
                autoSelect
                openOnFocus
                autoHighlight
                options={figuraOptions}
                getOptionLabel={(option) => option || ""}
                value={figura}
                onChange={(event, value) => {
                  setFigura(value);
                  setMedidaReferencia(null);
                  setAcabado(null);
                  setCostoSeleccionado(null);
                  setCostoInputValue("");
                  setProveedor(null);
                  setFecha(null);
                }}
                sx={{ width: 270 }}
                renderInput={(params) => (
                  <TextField {...params} label="Figura" variant="outlined"/>
                )}
              />
              
              <Autocomplete
                autoSelect
                openOnFocus
                autoHighlight
                options={medidarefOptions}
                getOptionLabel={(option) => option || ""}
                value={medidareferencia}
                onChange={(event, value) => {
                  setMedidaReferencia(value);
                  setAcabado(null);
                  setCostoSeleccionado(null);
                  setCostoInputValue("");
                  setProveedor(null);
                  setFecha(null);
                }}
                sx={{ width: 270 }}
                renderInput={(params) => (
                  <TextField {...params} label="Medida Referencia" variant="outlined" />
                )}
              />

              <Autocomplete
                autoSelect
                openOnFocus
                autoHighlight
                options={acabadoOptions}
                getOptionLabel={(option) => option || ""}
                value={acabado}
                onChange={(event, value) => {
                  setAcabado(value);
                  setCostoSeleccionado(null);
                  setCostoInputValue("");
                  setProveedor(null);
                  setFecha(null);
                }}
                sx={{ width: 270 }}
                renderInput={(params) => (
                  <TextField {...params} label="Acabado" variant="outlined"/>
                )}
              />

              <Autocomplete
                key={`${materialSeleccionado || ""}_${figura || ""}_${medidareferencia || ""}_${acabado || ""}`}
                freeSolo
                autoSelect
                openOnFocus
                autoHighlight
                options={precioOptions}
                value={costoSeleccionado}
                inputValue={costoInputValue}
                onChange={(event, value) => {
                  // The value can be an object from options or a string from freeSolo
                  setCostoSeleccionado(value);
                }}
                onInputChange={(event, newInput) => {
                  setCostoInputValue(newInput);
                }}
                getOptionLabel={(option) => (option == null ? "" : option.toString())}
                isOptionEqualToValue={(option, value) => String(option) === String(value)}
                sx={{ width: 270 }}
                renderInput={(params) => (
                  <TextField {...params} label="Precio peso" variant="outlined"/>
                )}
              />

              <Autocomplete
                autoSelect
                openOnFocus
                autoHighlight
                options={proveedorOptions}
                getOptionLabel={(option) => option || ""}
                value={proveedor}
                onChange={(event, value) => {
                  setProveedor(value);
                  setFecha(null);
                }}
                sx={{ width: 270 }}
                renderInput={(params) => (
                  <TextField {...params} label="Proveedor" variant="outlined"/>
                )}
              />

              <Autocomplete
                autoSelect
                openOnFocus
                autoHighlight
                options={fechaOptions}
                getOptionLabel={(option) => option || ""}
                value={fecha}
                onChange={(event, value) => setFecha(value)} 
                sx={{ width: 270 }}
                renderInput={(params) => (
                  <TextField {...params} label="Fecha" variant="outlined"/>
                )}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <Stack spacing={2}>
              <TextField
                type="number"
                label="Cantidad"
                variant="outlined"
                value={cantidad}
                onChange={(e) =>setCantidad(e.target.value)}
                sx={{ width: 270 }}
              />
              <TextField
                label="Espesor"
                type="number"
                value={espesor}
                onChange={(e) =>setEspesor(e.target.value)}
                disabled={!isRectangular}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                sx={{
                  width: 270,
                  "& .MuiInputBase-input": {
                    color: "white",
                  },
                  "& .Mui-disabled": {
                    opacity: 0.5,
                    WebkitTextFillColor: "rgba(255,255,255,0.5) !important",
                  },
                }}
              />
              <TextField
                label="Diametro"
                type="number"
                value={diametro}
                onChange={(e) => setDiametro(e.target.value)}
                disabled={!isRound}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                sx={{
                  width: 270,
                  "& .MuiInputBase-input": {
                    color: "white",
                  },
                  "& .Mui-disabled": {
                    opacity: 0.5,
                    WebkitTextFillColor: "rgba(255,255,255,0.5) !important",
                  },
                }}
              />
              <TextField
                label="Ancho"
                type="number"
                value={ancho}
                onChange={(e) => setAncho(e.target.value)}
                disabled={!isRectangular}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                sx={{
                  width: 270,
                  "& .MuiInputBase-input": {
                    color: "white",
                  },
                  "& .Mui-disabled": {
                    opacity: 0.5,
                    WebkitTextFillColor: "rgba(255,255,255,0.5) !important",
                  },
                }}
              />
              <TextField
                label="Largo"
                type="number"
                value={largo}
                onChange={(e) => setLargo(e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true },
                }}
                sx={{
                  width: 270,
                  "& .MuiInputBase-input": { color: "white" },
                }}
              />
              <TextField
                label="Volumen"
                variant="outlined"
                value={volumen}
                slotProps={{ input: { readOnly: true, }, 
                  inputLabel: { shrink: true, },
                }}
                sx={{ width: 270 }}
              />
              <TextField
                label="Densidad"
                variant="outlined"
                value={densidadlpi3}
                slotProps={{ input: { readOnly: true, }, 
                  inputLabel: { shrink: true, },
                }}
                sx={{ width: 270 }}
              />
              <TextField
                label="Peso"
                variant="outlined"
                value={peso}
                slotProps={{ input: { readOnly: true, },
                  inputLabel: { shrink: true, },
                }}
                onChange={(e) => setPeso(e.target.value)}
                sx={{ width: 270 }}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={12} md={4}>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  paddingTop: 1,
                  borderColor: "white",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderRadius: 1,
                  paddingLeft: 1,
                  backgroundColor: "#0dab76"
                }}
              >
                <Typography sx={{ color: "white", fontWeight: 700, mt: 1.9 }}>
                  $
                </Typography>

                <TextField
                  label="Costo"
                  variant="standard"
                  value={costo}
                  slotProps={{ 
                    input: { readOnly: true, }, 
                    inputLabel: { shrink: true, },
                  }}
                  sx={{ 
                    width: 270,
                    "& .MuiInput-root:before, & .MuiInput-root:after": {
                      borderBottom: "none",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "1.3rem",
                      fontWeight: "bold",
                      color: "white",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "white !important",
                    },
                    "& .MuiInputBase-input": {
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: "white",
                    }
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  paddingTop: 1,
                  borderColor: "white",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderRadius: 1,
                  paddingLeft: 1,
                  backgroundColor: "#139A43"
                }}
              >
                <Typography sx={{ color: "white", fontWeight: 700, mt: 1.9 }}>
                  %
                </Typography>

                <TextField
                  type="number"
                  label="Porcentaje Ganancia"
                  variant="standard"
                  value={porcentajeGanancia}
                  onChange={(e) => setPorcentajeGanancia(e.target.value)}
                  sx={{ 
                    width: 270,
                    "& .MuiInput-root:before, & .MuiInput-root:after": {
                      borderBottom: "none",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      color: "white",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "white !important",
                    },
                    "& .MuiInputBase-input": {
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: "white",
                    }
                  }}
                />
              </Box>
              <Box 
                sx={{ 
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  paddingTop: 1,
                  borderColor: "white",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderRadius: 1,
                  paddingLeft: 1,
                  backgroundColor: "#0b5d1e"
                }}
              >
                <Typography sx={{ color: "white", fontWeight: 700, mt: 1.9 }}>
                  $
                </Typography>

                <TextField
                  label="Precio Venta"
                  variant="standard"
                  value={precioVenta}
                  slotProps={{ 
                    input: { readOnly: true },
                    inputLabel: { shrink: true } 
                  }}
                  sx={{ 
                    width: 270,
                    "& .MuiInput-root:before, & .MuiInput-root:after": {
                      borderBottom: "none",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      color: "white",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "white !important",
                    },
                    "& .MuiInputBase-input": {
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: "white",
                    }
                  }}
                />
              </Box>
              <Box 
                sx={{ 
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  paddingTop: 1,
                  borderColor: "white",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderRadius: 1,
                  paddingLeft: 1,
                  backgroundColor: "#053b06"
                }}
              >
                <Typography sx={{ color: "white", fontWeight: 700, mt: 1.9 }}>
                  $
                </Typography>

                <TextField
                  label="Subtotal"
                  variant="standard"
                  value={subtotal}
                  onChange={(e) => setSubtotal(e.target.value)}
                  slotProps={{
                    input: { readOnly: true, },
                    inputLabel: {shrink: true, },
                  }}
                  sx={{ 
                    width: 270,
                    "& .MuiInput-root:before, & .MuiInput-root:after": {
                      borderBottom: "none",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      color: "white",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "white !important",
                    },
                    "& .MuiInputBase-input": {
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: "white",
                    }
                  }}
                />
              </Box>
              <Box 
                sx={{ 
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  paddingTop: 1,
                  borderColor: "white",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderRadius: 1,
                  paddingLeft: 1,
                  backgroundColor: "#053b06"
                }}
              >
                <Typography sx={{ color: "white", fontWeight: 700, mt: 1.9 }}>
                  $
                </Typography>
                
                <TextField
                  label="IVA"
                  variant="standard"
                  value={iva}
                  onChange={(e) => setIva(e.target.value)}
                  slotProps={{
                    input: { readOnly: true, },
                    inputLabel: {shrink: true, },
                  }}
                  sx={{ 
                    width: 270,
                    "& .MuiInput-root:before, & .MuiInput-root:after": {
                      borderBottom: "none",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "1.2rem",
                      fontWeight: "bold",
                      color: "white",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "white !important",
                    },
                    "& .MuiInputBase-input": {
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: "white",
                    }
                  }}
                />
              </Box>
              <Box 
                sx={{ 
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  paddingTop: 1,
                  borderColor: "white",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderRadius: 1,
                  paddingLeft: 1,
                  backgroundColor: "#059669"
                }}
              >
                <Typography sx={{ color: "white", fontWeight: 700, mt: 1.9 }}>
                  $
                </Typography>
              
                <TextField
                  label="Total"
                  variant="standard"
                  value={totalConIva}
                  slotProps={{
                    input: { readOnly: true },
                    inputLabel: { shrink: true }
                  }}
                  sx={{ 
                    width: 270,
                    "& .MuiInput-root:before, & .MuiInput-root:after": {
                      borderBottom: "none",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "1.3rem",
                      fontWeight: "bold",
                      color: "white",
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "white !important",
                    },
                    "& .MuiInputBase-input": {
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      color: "white",
                    }
                  }}
                />
              </Box>
              
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  variant= "contained"
                  sx={{ 
                    flex: 1,
                    backgroundColor: "#5a189a",
                    color: "white",
                    letterSpacing: "0.5px",
                    boxShadow: " 0 4 px 10px rgba(139, 92, 246, 0.3)",
                    transition: "all 0.3s cubic-beizer(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      backgroundColor: "#7c3aed",
                      boxShadow: "0 4px 15px rgba(139, 92, 246, 0.6)",
                      transform: "scale(1.02)",
                    }
                  }}
                  onClick={agregarRegistro}
                >
                  ➕ Agregar
                </Button>

                <Button
                  variant= "contained"
                  sx={{
                    flex: 1,
                    backgroundColor: "#f7eeed",
                    color: "black",
                    letterSpacing: "0.5px",
                    boxShadow: "0 4px 10px rgba(247, 86, 124, 0.3)",
                    transition: "all 0.3s cubic-bezier (0.4, 0, 0.2, 1)",
                    "&:hover": {
                      color: "black",
                      backgroundColor: "#fcfcfc",
                      boxShadow: "0 4px 10px rgba(255, 255, 255, 0.6)",
                      transform: "scale(1.02)",
                    }
                  }}
                  onClick={limpiarFiltros}
                >
                  🗑️ Limpiar
                </Button>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Box>
      {mostrarTabla && registros.length > 0 && (
        <RecordTable 
          registros={registros} 
          onEliminar={eliminarRegistro} 
          onExportar={manejarExportacion} 
        />
      )}
    </Box>
  );
};

export default PricePerWeight;
