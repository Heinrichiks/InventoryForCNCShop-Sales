import React, { useState } from "react";
import { db } from "../firebase";
import {opcionesFracciones} from "../datos/opcionesFracciones";
import { collection, addDoc, doc, updateDoc, Timestamp } from "firebase/firestore";
import { Paper, Button, TextField, Typography, Box, Autocomplete } from "@mui/material";

const PrecioPorPesoForm = ({ formData, setFormData, modoEditar, setModoEditar, setVista }) => {

  const nombrePorCategoria = {
    "Acero al Carbón": ["1018", "A36", "1045"],
    "Inoxidable": ["303", "304", "316", "416", "420", "420 ESR", "440C", "17-4"],
    "Aleado": ["4140T", "4140", "4340T", "8620"],
    "Grado Herramienta": ["A-2", "D-2", "S-7", "H-13", "O-1"],
    "Metal": ["Aluminio 6061", "Aluminio Rectificado", "Aluminio MIC-6", "Laton", "Cobre C-110", "Cobre C-2", "Cobre C-3", "Cobre C-3 LB", "Cobre C-11", "Bronce 660", "Bronce 844", "Bronce 954", "Bronce 841", "Molibdeno", "Titanio G-2", "Tungsteno"],
    "Plástico": ["Delrin Natural", "Delrin Negro", "Delrin ESD", "Policarbonato Claro", "Policarbonato Oscuro", "Policarbonato Negro", "Nylon Natural", "Nylon Negro", "Nylon Verde", "Nylon Azul", "Nylon MOS2", "Baquelita Natural", "Baquelita Negra XX", "G-10 FR-4", "HDPE Natural", "HDPE Negro", "UHMW Natural", "UHMW Negro", "UHMW Negro ESD", "ABS Blanco", "ABS Negro", "Teflon", "Ertalyte", "Hydlar"],
    "Tipo Molde": ["P-20"],
  };

  const [categoria, setCategoria] = useState("");
  const nombresdisponibles = nombrePorCategoria[categoria] || [];

  const figuras = [
    "Placa",
    "Solera",
    "Redondo",
    "Hoja",
  ];

  const acabados = ["CR", "HR", "DCF", "N/A", "GFS", "TPG"];


  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();

    // Validar campos requeridos
    if (!formData.nombre || !formData.figura || !formData.medidareferencia || 
        !formData.acabado || !formData.densidadlpi3 || !formData.preciolibra || 
        !formData.proveedor || !formData.fecha) {
      alert("⚠️ Por favor completa todos los campos requeridos");
      return;
    }

    try {
      const datos = {
        nombre: formData.nombre,
        figura: formData.figura,
        medidareferencia: formData.medidareferencia,
        acabado: formData.acabado,
        densidadlpi3: parseFloat(formData.densidadlpi3),
        preciolibra: parseFloat(formData.preciolibra), 
        proveedor: formData.proveedor,
        fecha: formData.fecha,
      };

      if (modoEditar && formData.id) {
        // Actualizar documento existente
        const ref = doc(db, "precioporpeso", formData.id);
        await updateDoc(ref, datos);
        alert("✅ Precio actualizado correctamente en Firebase");
      } else {
        // Agregar nuevo documento
        await addDoc(collection(db, "precioporpeso"), datos);
        alert("✅ Precio agregado correctamente a Firebase");
      }

      // Limpiar formulario
      limpiarFormulario();
      setModoEditar(false);
      if (setVista) setVista("listaPreciosPeso");

    } catch (error) {
      console.error("❌ Error al guardar en Firebase:", error);
      alert("Ocurrió un error al guardar en Firebase: " + error.message);
    }
  };

  const limpiarFormulario = () => {
    setFormData({
      nombre: "",
      figura: "",
      medidareferencia: "",
      acabado: "",
      densidadlpi3: "",
      preciolibra: "",
      proveedor: ""
    });
    setCategoria("");
  };

  const cancelarEdicion = () => {
    limpiarFormulario();
    setModoEditar(false);
    if (setVista) setVista("listaPreciosPeso");
  };

  const Orbitron = {
    fontFamily: "Orbitron, sans-serif",
    fontWeight: "bold",
    letterSpacing: "0.03em",
    color: "white",
    padding: 0,
    marginTop: 0,
    textAlign: "center"
  };

  return (
    <Box component="form" onSubmit={manejarEnvio}>
      <Paper
        elevation={6}
        sx={{
          fontFamily: "Orbitron, sans-serif",
          color: "white",
          textAlign: "left",
          boxShadow: "0px 0px 20px rgba(247, 86, 124, 0.5)",
          width: "34%",
          margin: "auto",
          mt: 5,
          p: 2,
          padding: 5,
          borderRadius: 2,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 5 }}>
          <img
            src="/priceperweight.png"
            alt="precio por peso"
            style={{
              height: 45,
              marginRight: 12,
            }}
          />
          <Typography sx={{ ...Orbitron }} variant="h4">
            {modoEditar ? "Editar Precio" : "Agregar Precio por Peso"}
          </Typography>
        </Box>

        {/* Categoría (solo para filtrar nombres) */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img 
            src="/imagenes/categoria.png" 
            alt="categoría" 
            style={{ width: 35, height: 35, objectFit: "contain", marginBottom: 7 }}
          />
          <Autocomplete
            autoSelect
            autoHighlight
            openOnFocus
            fullWidth
            options={Object.keys(nombrePorCategoria)}
            value={categoria}
            onChange={(event, newValue) => {
              setCategoria(newValue || "");
              setFormData({ ...formData, nombre: "" });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Categoría (auxiliar)"
                variant="outlined"
                sx={{ mb: 2 }}
              />
            )}
          />
        </Box>

        {/* Nombre */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img 
            src="/imagenes/nombre.png" 
            alt="nombre" 
            style={{ width: 35, height: 35, objectFit: "contain", marginBottom: 7 }}
          />
          <Autocomplete
            fullWidth
            freeSolo
            openOnFocus
            autoSelect
            autoHighlight
            options={nombresdisponibles}
            value={formData.nombre || ""}
            onChange={(event, newValue) => {
              setFormData({ ...formData, nombre: newValue || "" });
            }}
            onInputChange={(event, newInputValue) => {
              setFormData({ ...formData, nombre: newInputValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Nombre"
                name="nombre"
                variant="outlined"
                required
                sx={{ mb: 2 }}
              />
            )}
          />
        </Box>

        {/* Figura */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img 
            src="/imagenes/figura.png" 
            alt="figura" 
            style={{ width: 35, height: 35, objectFit: "contain", marginBottom: 7 }}
          />
          <Autocomplete
            fullWidth
            openOnFocus
            autoSelect
            autoHighlight
            options={figuras}
            value={formData.figura || ""}
            onChange={(event, newValue) => {
              setFormData({ ...formData, figura: newValue || "" });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Figura"
                name="figura"
                variant="outlined"
                required
                sx={{ mb: 2 }}
              />
            )}
          />
        </Box>

        {/* Medida Referencia */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img 
            src="/imagenes/largo.png" 
            alt="medida" 
            style={{ width: 35, height: 35, objectFit: "contain", marginBottom: 7 }}
          />
          <Autocomplete
            fullWidth
            freeSolo
            openOnFocus
            autoSelect
            autoHighlight
            options={opcionesFracciones}
            value={formData.medidareferencia || ""}
            onChange={(event, newValue) => {
              setFormData({ ...formData, medidareferencia: newValue || "" });
            }}
            onInputChange={(event, newInputValue) => {
              setFormData({ ...formData, medidareferencia: newInputValue });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Medida Referencia"
                name="medidareferencia"
                variant="outlined"
                required
                sx={{ mb: 2 }}
              />
            )}
          />
        </Box>

        {/* Acabado */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img 
            src="/imagenes/acabado.png" 
            alt="acabado" 
            style={{ width: 35, height: 35, objectFit: "contain", marginBottom: 7 }}
          />
          <Autocomplete
            fullWidth
            openOnFocus
            autoSelect
            autoHighlight
            options={acabados}
            value={formData.acabado || ""}
            onChange={(event, newValue) => {
              setFormData({ ...formData, acabado: newValue || "" });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Acabado"
                name="acabado"
                variant="outlined"
                required
                sx={{ mb: 2 }}
              />
            )}
          />
        </Box>

        <Box
          sx={{
            height: "8px",
            width: "100%",
            borderRadius: "10px",
            my: 3,
            background: "linear-gradient(to right, #f10b0bff, #dc3a3aff, #f1436cff)",
            boxShadow: "0 0 10px 1px rgba(247, 86, 124, 0.8)",
          }}
        />

        {/* Densidad */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img 
            src="/imagenes/volumen.png" 
            alt="densidad" 
            style={{ width: 35, height: 35, objectFit: "contain", marginBottom: 7 }}
          />
          <TextField
            fullWidth
            label="Densidad (lb/in³)"
            name="densidadlpi3"
            type="number"
            value={formData.densidadlpi3 || ""}
            onChange={manejarCambio}
            variant="outlined"
            required
            slotProps={{
              htmlInput: { step: "0.0001" }
            }}
            sx={{ mb: 2 }}
          />
        </Box>

        {/* Precio por Libra */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img 
            src="/imagenes/costo.png" 
            alt="precio" 
            style={{ width: 35, height: 35, objectFit: "contain", marginBottom: 7 }}
          />
          <TextField
            fullWidth
            label="Precio por Libra"
            name="preciolibra"
            type="number"
            value={formData.preciolibra || ""}
            onChange={manejarCambio}
            variant="outlined"
            required
            slotProps={{
              htmlInput: { step: "0.5"}
            }}
            sx={{ mb: 2 }}
          />
        </Box>

        {/* Proveedor */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img 
            src="/imagenes/partner.png" 
            alt="proveedor" 
            style={{ width: 35, height: 35, objectFit: "contain", marginBottom: 7 }}
          />
          <TextField
            fullWidth
            label="Proveedor"
            name="proveedor"
            type="text"
            value={formData.proveedor || ""}
            onChange={manejarCambio}
            variant="outlined"
            required
            sx={{ mb: 2 }}
          />
        </Box>
        {/* Fecha */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img 
            src="/imagenes/fecha.png" 
            alt="fecha" 
            style={{ width: 35, height: 35, objectFit: "contain", marginBottom: 7 }}
          />
          <TextField
            fullWidth
            label="Fecha"
            name="fecha"
            type="text"
            value={formData.fecha || ""}
            onChange={manejarCambio}
            variant="outlined"
            required
            sx={{ mb: 2 }}
          />
        </Box>
        <Box
          sx={{
            height: "8px",
            width: "100%",
            borderRadius: "10px",
            my: 3,
            background: "linear-gradient(to right, #00ccff, #66ffff, #00ccff)",
            boxShadow: "0 0 10px 1px rgba(0, 204, 255, 0.8)",
          }}
        />

        {/* Botones */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4, gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="medium"
            startIcon={
              <img src="/add.png" alt="Add" style={{ width: 25, height: 25 }} />
            }
            sx={{
              borderRadius: 3,
              px: 3,
              boxShadow: 2,
              fontFamily: "Orbitron, sans-serif",
              fontWeight: "bold",
              letterSpacing: "0.03em",
              color: "#fff",
              textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
              textTransform: "none",
            }}
          >
            {modoEditar ? "Actualizar" : "Agregar"}
          </Button>

          {modoEditar && (
            <Button
              variant="contained"
              color="secondary"
              size="medium"
              onClick={cancelarEdicion}
              sx={{
                borderRadius: 3,
                px: 3,
                fontFamily: "Orbitron, sans-serif",
                fontWeight: "bold",
                letterSpacing: "0.03em",
                boxShadow: 2,
                textTransform: "none",
              }}
            >
              Cancelar
            </Button>
          )}

          <Button
            variant="contained"
            color="inherit"
            size="medium"
            startIcon={
              <img src="/clean.png" alt="clean" style={{ width: 25, height: 25 }} />
            }
            sx={{
              borderRadius: 3,
              px: 3,
              fontFamily: "Orbitron, sans-serif",
              fontWeight: "bold",
              letterSpacing: "0.03em",
              textTransform: "none",
              color: "black",
              "&:hover": {
                backgroundColor: "rgba(223, 223, 223, 0.9)",
              },
            }}
            onClick={limpiarFormulario}
          >
            Limpiar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default PrecioPorPesoForm;