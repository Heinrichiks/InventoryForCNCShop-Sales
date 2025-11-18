import React, {useState, useRef, useEffect} from "react";
import CampoConSelectYTexto from "../components/CampoConSelectYTexto";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore";
import { Paper, Button, TextField, Typography, Box } from "@mui/material";
import CampoInput from "./CampoInputNumero";
import CampoAutocompleteText from "./CampoAutoCompletarTexto";
import { animate } from 'animejs';


const MaterialForm = ({ formData, setFormData, modoEditar, setModoEditar, setVista }) => {

const refEspesor = useRef(null);
const refDiametro = useRef(null);
const refFormulario = useRef(null);
const refBotonSubmit = useRef(null);
const refCampoEspesor = useRef(null);
const refCampoDiametro = useRef(null);
const refCampoAncho = useRef(null);
const refCampoLargo = useRef(null);
const refGif = useRef(null);
const refTitulo = useRef(null);

useEffect(() => {
  if (formData.figura === "Redondo" && refDiametro.current) {
    refDiametro.current.focus();
  } else if (formData.figura && refEspesor.current) {
    refEspesor.current.focus();
  }
}, [formData.figura]);

useEffect(() => {
  if (refFormulario.current) {
    animate(refFormulario.current, {
      opacity: [0, 1],
      y: [30, 0],
      duration: 800,
      ease: 'out(3)'
    });
  }
}, []);

// Animación del encabezado (GIF + Título)
useEffect(() => {
  if (refGif.current && refTitulo.current) {
    // Animar el GIF
    animate(refGif.current, {
      scale: [0, 1.2, 1],
      rotate: [0, 360],
      duration: 800,
      ease: 'out(3)',
      delay: 300
    });

    // Animar el título
    animate(refTitulo.current, {
      opacity: [0, 1],
      x: [50, 0],
      duration: 600,
      ease: 'out(3)',
      delay: 500
    });
  }
}, []);

// Animación de campos dinámicos según la figura
useEffect(() => {
  const animarCampo = (ref) => {
    if (ref && ref.current) {
      animate(ref.current, {
        opacity: [0, 1],
        x: [-20, 0],
        duration: 400,
        ease: 'out(3)'
      });
    }
  };

  if (formData.figura) {
    if (camposVisibles.mostrarEspesor) animarCampo(refCampoEspesor);
    if (camposVisibles.mostrarDiametro) animarCampo(refCampoDiametro);
    if (camposVisibles.mostrarAncho) animarCampo(refCampoAncho);
    if (camposVisibles.mostrarLargo) animarCampo(refCampoLargo);
  }
}, [formData.figura]); // Se ejecuta cada vez que cambia la figura

const nombrePorCategoria = {
    "Acero al Carbón":["1018", "A36", "1045"],
    "Inoxidable":["303", "304", "316", "416", "420", "420 ESR", "440C", "17-4"],
    "Aleado":["4140T", "4140", "4340T", "8620"],
    "Grado Herramienta":["A-2", "D-2", "S-7", "H-13", "O-1"],
    "Metal":["Aluminio 6061", "Aluminio Rectificado", "Aluminio MIC-6", "Laton", "Cobre C-110", "Cobre C-2", "Cobre C-3", "Cobre C-3 LB", "Cobre C-11", "Bronce 660", "Bronce 844", "Bronce 954", "Bronce 841", "Molibdeno", "Titanio G-2", "Tungsteno"],
    "Plástico":["Delrin Natural", "Delrin Negro", "Delrin ESD", "Policarbonato Claro", "Policarbonato Oscuro", "Policarbonato Negro", "Nylon Natural", "Nylon Negro", "Nylon Verde", "Nylon Azul", "Nylon MOS2", "Baquelita Natural", "Baquelita Negra XX", "G-10 FR-4", "HDPE Natural", "HDPE Negro", "UHMW Natural", "UHMW Negro", "UHMW Negro ESD", "ABS Blanco", "ABS Negro", "Teflon", "Ertalyte", "Hydlar"],
    "Tipo Molde":["P-20"],

};

const nombresdisponibles = nombrePorCategoria[formData.categoria] || [];

const categorias = [
    "Acero al Carbón",
    "Inoxidable",
    "Aleado",
    "Grado Herramienta",
    "Metal",
    "Plástico",
    "Tipo Molde",
];

const figuras = [
    "Placa",
    "Solera",
    "Redondo",
    "Cuadrado",
    "Hoja",
    "Ángulo",
    "PTR",
    "Tubo",
    "Hexagono"
];

const figurasPulgadaCuadra = ["Placa", "Solera", "Hoja"];

const figurasLineales = ["Redondo", "Cuadrado", "Ángulo", "PTR", "Tubo", "Hexagono"];

const acabados = ["CR", "HR", "DCF", "N/A", "GFS", "TPG"];

const manejarCambio = (e) => {
    const {name, value } = e.target;

    if (name === "categoria") {
        setFormData({ ...formData, categoria: value, nombre: "" });
    }

    else if (name === "figura") {
        setFormData({
            ...formData,
            figura:value,
            espesorFraccion:"",
            espesorDecimal:"",
            diametroFraccion:"",
            diametroDecimal:"",
            anchoFraccion:"",
            anchoDecimal:"",
            largoFraccion:"",
            largoDecimal:"",
        });
    }
    else {
        setFormData({...formData, [name]: value });
    }
};

const manejarEnvio = async (e) => {
    e.preventDefault();

    const datos = { ...formData };
    delete datos.id; // Firebase no necesita el ID dentro del documento
    

    try {
      if (modoEditar && formData.id) {
        // Aquí podrías actualizar el material en lugar de agregar uno nuevo
        const ref = doc(db, "materiales", formData.id);
        await updateDoc(ref, datos);

        if (refBotonSubmit.current) {
          await animate(refBotonSubmit.current, {
            scale: [1, 1.15, 1],
            duration: 400, 
            ease: 'out(3)'
          });

          await animate(refBotonSubmit.current, {
            scale: [1, 1.08, 1],
            duration: 300,
            ease: 'inOut(2)'
          });
        }

        alert("✅ Material actualizado correctamente en Firebase");
        console.log("Material actualizado:", datos);
      } else {
        // Agregar un nuevo material
        await addDoc(collection(db, "materiales"), datos);
        
         if (refBotonSubmit.current) {
          await animate(refBotonSubmit.current, {
            scale: [1, 1.15, 1],
            duration: 400, 
            ease: 'out(3)'
          });

        await animate(refBotonSubmit.current, {
          scale: [1, 1.08, 1],
          duration: 300,
          ease: 'inOut(2)'
        });
      }

        alert("✅ Material agregado correctamente a Firebase");
        console.log("Material ingresado:", datos);
      }

      // Limpia el formulario después de agregar o editar
      setFormData({
        categoria: "",
        nombre: "",
        acabado: "",
        figura: "",
        espesorFraccion: "",
        espesorDecimal: "",
        diametroFraccion: "",
        diametroDecimal: "",
        anchoFraccion: "",
        anchoDecimal: "",
        largoFraccion: "",
        largoDecimal: "",
        cantidad: "",
        min: "",
        max: "",
        costo: "",
        costoPulgadaCuadrada: "",
        costoPulgadaLineal: "",
        ordenDeCompra: ""
      });

      // Si estás en modo edición, cambia a modo vista
      setModoEditar(false);
      setVista("inventario"); // Cambia a la vista de inventario
      // Limpia el estado de edición
    } catch (error) {
      console.error("❌ Error al agregar o actualizar el material:", error);
      alert("Ocurrió un error al guardar en Firebase.");
    }
  };

  const cancelarEdicion = () => {
    setFormData({
      categoria: "",
      nombre: "",
      acabado: "",
      figura: "",
      espesorFraccion: "",
      espesorDecimal: "",
      diametroFraccion: "",
      diametroDecimal: "",
      anchoFraccion: "",
      anchoDecimal: "",
      largoFraccion: "",
      largoDecimal: "",
      cantidad: "",
      min: "",
      max: "",
      costo: "",
      costoPulgadaCuadrada: "",
      costoPulgadaLineal: "",
      ordenDeCompra: ""
    });
    setModoEditar(false);
    setVista("inventario"); // Cambia a la vista de inventario
  };

const obtenerCamposVisibles = (figura) => {
  if(!figura) return camposPorDefecto;

    switch (figura.toLowerCase()) {
        case "redondo":
            return { mostrarEspesor: false, mostrarDiametro: true, mostrarAncho: false, mostrarLargo: true};
        case "placa":
        case "solera":
        case "hoja":
        case "ángulo":
        case "ptr":
            return { mostrarEspesor: true, mostrarDiametro: false, mostrarAncho: true, mostrarLargo: true};
        case "cuadrado":
        case "hexagono":
            return {mostrarEspesor: true, mostrarDiametro: false, mostrarAncho: false, mostrarLargo: true};
        case "tubo":
            return {mostrarEspesor: true, mostrarDiametro: true, mostrarAncho: false, mostrarLargo: true};
        default:
          return camposPorDefecto;
    }
};

const camposPorDefecto = {
  mostrarEspesor: false,
  mostrarDiametro: false,
  mostrarAncho: false,
  mostrarLargo: false
};

const camposVisibles = obtenerCamposVisibles(formData?.figura);

const {
  mostrarEspesor,
  mostrarDiametro,
  mostrarAncho,
  mostrarLargo,
} = camposVisibles

const Orbitron= {
  fontFamily: "Orbitron, sans-serif",
  fontWeight: "bold",
  letterSpacing: "0.03em",
  color: "white",
  padding: 0,
  marginTop: 0,
  textAlign: "center"
}

return (
  <Box component="form" onSubmit={manejarEnvio}>

    <Paper
      ref={refFormulario}
      elevation={6}
      sx={{
        opacity: 0,
        fontFamily: "Orbitron, sans-serif",
        color: "white",
        textAlign: "left",
        boxShadow: " 0px 0px 20px rgba(19, 73, 143, 0.5)",
        width:"34%",
        margin:"auto",
        mt:5,
        p:2,
        padding: 5,
        borderRadius: 2,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(10px)",  
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 5}}>
        <img
          ref={refGif}
          src="addMaterial.gif"
          alt="addMaterial"
          style={{
            height: 34,
            marginRight: 12,
            opacity: 1
          }}
        />
        <Typography
          ref={refTitulo}
          sx={{ ...Orbitron, opacity: 0 }}
          variant="h4"
        >
          Entrada de Material
        </Typography>     
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <img src="/imagenes/categoria.png" alt="categoría" style={{ width: 17, height: 17, objectFit: "contain", marginBottom: 7 }}/>
        <CampoAutocompleteText
          label="Categoria"
          name="categoria" 
          value={formData.categoria} 
          onChange={manejarCambio}
          opciones={categorias}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <img src="/imagenes/nombre.png" alt="nombre" style={{ width: 17, height: 17, objectFit: "contain", marginBottom: 7 }}/>
        <CampoAutocompleteText      
          label="Nombre"
          name="nombre"
          value={formData.nombre}
          onChange={manejarCambio}
          opciones={nombresdisponibles}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1}}>
        <img src="/imagenes/acabado.png" alt="acabado" style={{ width: 17, height: 17, objectFit: "contain", marginBottom: 7 }}/>
        <CampoAutocompleteText
          label="Acabado"    
          name="acabado"
          value={formData.acabado}
          onChange={manejarCambio}
          opciones={acabados}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems:"center", gap:1 }}>
        <img src="/imagenes/figura.png" alt="figura" style={{ width: 17, height: 17, objectFit: "contain", marginBottom: 7 }}/>
        <CampoAutocompleteText
          label="Figura"    
          name="figura"
          value={formData.figura}
          onChange={manejarCambio}
          opciones={figuras}
        />
      </Box>

      <Box
        sx={{
          height: "8px",
          width: "100%",
          borderRadius: "10px",
          my: 3,
          background: "linear-gradient(to right, #ff0000, #ff3333, #ff0000)",
          boxShadow: "0 0 10px 1px rgba(255, 0, 0, 0.8)",
        }}
      />

            
          {camposVisibles.mostrarEspesor && (
            <Box ref={refCampoEspesor} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <img src="/imagenes/espesor.png" alt="espesor" style={{ width: 17, height: 17, objectFit: "contain", marginBottom: 7 }}/>        
              <CampoConSelectYTexto 
                label="Espesor" 
                nameFraccion="espesorFraccion" 
                nameDecimal="espesorDecimal" 
                valueFraccion={formData?.espesorFraccion || ""} 
                valueDecimal={formData?.espesorDecimal || ""}
                onChange={manejarCambio}
                inputRef={formData.figura !== "Redondo" ? refEspesor : null} 
              />
            </Box>
  
          )}
          {camposVisibles.mostrarDiametro && (
            <Box ref={refCampoDiametro} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <img src="/imagenes/diametro.png" alt="diametro" style={{ width: 17, height: 17, objectFit: "contain", marginBottom: 7 }}/>
              <CampoConSelectYTexto 
                label="Diámetro" 
                nameFraccion="diametroFraccion" 
                nameDecimal="diametroDecimal" 
                valueFraccion={formData?.diametroFraccion || ""} 
                valueDecimal={formData?.diametroDecimal || ""}
                onChange={manejarCambio}
                inputRef={formData.figura === "Redondo" ? refDiametro : null}
              />
            </Box>
          )}
          {camposVisibles.mostrarAncho && (
            <Box ref={refCampoAncho} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <img src="/imagenes/ancho.png" alt="ancho" style={{ width: 17, height: 17, objectFit: "contain", marginBottom: 7 }}/>
              <CampoConSelectYTexto 
                label="Ancho" 
                nameFraccion="anchoFraccion" 
                nameDecimal="anchoDecimal" 
                valueFraccion={formData?.anchoFraccion || ""}
                valueDecimal={formData?.anchoDecimal || ""}
                onChange={manejarCambio}
              />
            </Box>
          )}
          {camposVisibles.mostrarLargo && (
            <Box ref={refCampoLargo} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <img src="/imagenes/largo.png" alt="largo" style={{ width: 17, height: 17, objectFit: "contain", marginBottom: 7 }}/>
              <CampoConSelectYTexto 
                label="Largo" 
                nameFraccion="largoFraccion" 
                nameDecimal="largoDecimal" 
                valueFraccion={formData?.largoFraccion || ""}
                valueDecimal={formData?.largoDecimal || ""}
                onChange={manejarCambio}
              />
            </Box>
          )}

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
                
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img src="/imagenes/cantidad.png" alt="cantidad" style={{ width: 17, height: 17, objectFit: "contain", marginBottom: 7 }}/>  
          <CampoInput
            label="Cantidad"
            name="cantidad"
            type="number"  
            value={formData.cantidad}
            onChange={manejarCambio}
            required
          />
        </Box>
            
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img src="/imagenes/minimo.png" alt="minimo" style={{ width: 17, height: 17, objectFit: "contain", marginBottom: 7 }}/>
          <CampoInput
            label= "Mínimo"
            name= "min"
            type= "number"
            value={formData.min}
            onChange={manejarCambio}
            required
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img src="/imagenes/maximo.png" alt="maximo" style={{ width: 17, height: 17, objectFit: "contain", marginBottom: 7 }}/>
          <CampoInput
            label="Máximo"
            name="max"
            type="number"
            value={formData.max}
            onChange={manejarCambio}
            required
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img src="/imagenes/costo.png" alt="costo" style={{ width: 17, height: 17, objectFit: "contain", marginBottom: 7 }}/>
          <CampoInput
            label="Costo"
            name="costo"
            type="number"
            value={formData.costo}
            onChange={manejarCambio}
            required
          />
        </Box>
          
          {figurasPulgadaCuadra.includes(formData.figura) && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <img src="/imagenes/costoPulgadaCuadrada.png" alt="costoPulgadaCuadrada" style={{ width: 17, height: 17, objectFit: "contain", marginBottom: 7 }}/>
              <CampoInput
                label="Costo Pulgada Cuadrada"
                name="costoPulgadaCuadrada"
                type="number"
                value={formData.costoPulgadaCuadrada}
                onChange={manejarCambio}
                required
              />
            </Box>
          )}
  
          {figurasLineales.includes(formData.figura) && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <img src="/imagenes/costoPulgadaLineal.png" alt="costoPulgadaLineal" style={{ width: 17, height: 17, objectFit: "contain", marginBottom: 7 }}/>
              <CampoInput
                label="Costo por pulgada lineal"
                name="costoPulgadaLineal"
                type="number"
                value={formData.costoPulgadaLineal}
                onChange={manejarCambio}
                required
              />
            </Box>
          )}
  
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <img src="/imagenes/ordenDeCompra.png" alt="ordenDeCompra" style={{ width: 17, height: 17, objectFit: "contain", marginBottom: 7 }}/>
            <CampoInput
              label="Orden de Compra"
              name="ordenDeCompra"
              type="text"
              value={formData.ordenDeCompra}
              onChange={manejarCambio}
              required
            />
          </Box>
          
        <Box sx={{ display: "flex", justifyContent: "space-between", mt:4 }}>
          <Button
            ref={refBotonSubmit}
            type="submit"
            variant="contained"
            color="primary"
            size="medium"
            startIcon={
              <img src="/add.png" alt="Add" style={{ width: 25, height: 25}} />
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
            { modoEditar ? "Actualizar" :  "Agregar material" }
          </Button>

          {modoEditar &&  (
            <Button
              variant="contained"
              color="secondary"
              size="medium"
              onClick={cancelarEdicion}
              sx={{ 
                ml: 2,
                borderRadius: 3,
                px: 3,
                fontFamily: "Orbitron, sans-serif",
                fontWeight: "bold",
                letterSpacing: "0.03em",
                boxShadow: 2,
                textTransform: "none",
              }}
            >
              Cancelar Edición
            </Button>
          )}

          <Button
            variant="contained"
            color="inherit"
            size="medium"
            startIcon={
              <img src="/clean.png" alt="clean" style={{width: 25, height: 25}} />
            }
            sx={{ 
              borderRadius: 3,
              px: 3,
              fontFamily: "Orbitron, sans-serif",
              fontWeight: "bold",
              letterSpacing: "0.03em",
              textTransform: "none",
              borderColor: "red",
              color: "black",
              "&:hover": {
                backgroundColor: "rgba(223, 223, 223, 0.9)",
                borderColor: "darkred",
              },
            }}
            onClick={() => {
              setFormData({
                categoria: "",
                nombre: "",
                acabado: "",
                figura: "",
                espesorFraccion: "",
                espesorDecimal: "",
                diametroFraccion: "",
                diametroDecimal: "",
                anchoFraccion: "",
                anchoDecimal: "",
                largoFraccion: "",
                largoDecimal: "",
                cantidad: "",
                min: "",
                max: "",
                costo: "",
                costoPulgadaCuadrada: "",
                costoPulgadaLineal: "",
                ordenDeCompra: "",
              });
            }}
          >
            Limpiar formulario
          </Button>
        </Box>
    </Paper>
  </Box>
  );
};

export default MaterialForm;