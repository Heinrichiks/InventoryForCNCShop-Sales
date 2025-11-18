import React, { useEffect, useState } from "react";
import { collection, getDocs, where, query } from "firebase/firestore";
import { db } from "../firebase";
import { Box, Typography, Autocomplete, TextField, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, IconButton } from "@mui/material";
import algoliasearch from "algoliasearch/lite";
import FilterListIcon from '@mui/icons-material/FilterList';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const searchClient = algoliasearch(process.env.REACT_APP_ALGOLIA_ID, process.env.REACT_APP_ALGOLIA_SEARCH_KEY);
  const index = searchClient.initIndex('materiales');


const QuoteForm = ({ agregarAlCarrito }) => {
  const [materiales, setMateriales] = useState ([]);
  const [filtroBusquedaGeneral, setFiltroBusquedaGeneral] = useState("");
  const [ filtroCategoria , setFiltroCategoria ] = useState("");
  const [ inputCategoria , setInputCategoria ] = useState("");
  const [ filtroNombre , setFiltroNombre ] = useState("");
  const [ inputNombre , setInputNombre ] = useState("");
  const [ opcionesNombre , setOpcionesNombre ] = useState([]);
  const [ filtroFigura , setFiltroFigura ] = useState("");
  const [ inputFigura , setInputFigura ] = useState("");
  const [ filtroEspesor , setFiltroEspesor ] = useState("");
  const [ inputEspesor , setInputEspesor ] = useState("");
  const [ filtroDiametro , setFiltroDiametro ] = useState("");
  const [ inputDiametro , setInputDiametro ] = useState("");
  const [ filtroAncho , setFiltroAncho ] = useState("");
  const [ inputAncho , setInputAncho ] = useState("");
  const [ filtroLargo , setFiltroLargo ] = useState("");
  const [ inputLargo , setInputLargo ] = useState("");
  const [ filtroCosto , setFiltroCosto ] = useState("");
  const [ inputCosto , setInputCosto ] = useState("");

  useEffect(() => {
    if (filtroBusquedaGeneral.trim() !== "") {
      buscarPorAlgolia();
    } else {
      obtenerMaterialesFirestore();
    }
  }, [filtroCategoria, filtroBusquedaGeneral, filtroNombre, filtroFigura, filtroEspesor, filtroDiametro, filtroAncho, filtroLargo, filtroCosto]);

    const obtenerMaterialesFirestore = async () => {
      try {
        const filtros = [];
        if (filtroCategoria) filtros.push(where("categoria", "==", filtroCategoria.trim()));
        if (filtroNombre) filtros.push(where("nombre", "==", filtroNombre.trim()));
        if (filtroFigura) filtros.push(where("figura", "==", filtroFigura.trim()));
        if (filtroEspesor) filtros.push(where("espesorFraccion", "==", filtroEspesor.trim()));
        if (filtroDiametro) filtros.push(where("diametroFraccion", "==", filtroDiametro.trim()));
        if (filtroAncho) filtros.push(where("anchoFraccion", "==", filtroAncho.trim()));
        if (filtroLargo) filtros.push(where("largoFraccion", "==", filtroLargo.trim()));
        if (filtroCosto) filtros.push(where("costo", "==", filtroCosto.trim()));

        const q = filtros.length > 0 ? query(collection(db, "materiales"), ...filtros) : collection(db, "materiales");
        
        const querySnapshot = await getDocs(q);
        const lista = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMateriales(lista);
        setOpcionesNombre([]); // Limpiamos las opciones de nombre al obtener los materiales
      } catch (error) {
        console.error("Error al obtener los materiales", error);
        alert("❌ No se pudieron cargar los materiales");
      }
    };

  const buscarPorAlgolia = async () => {
    try {
      const facetFilters = [];
      if (filtroCategoria) facetFilters.push(`categoria:${filtroCategoria}`);
      if (filtroFigura) facetFilters.push(`figura:${filtroFigura}`);
      if (filtroEspesor) facetFilters.push(`espesorFraccion:${filtroEspesor}`);
      if (filtroDiametro) facetFilters.push(`diametroFraccion:${filtroDiametro}`);
      if (filtroAncho) facetFilters.push(`anchoFraccion:${filtroAncho}`);
      if (filtroLargo) facetFilters.push(`largoFraccion:${filtroLargo}`);

      const { hits } = await index.search(filtroBusquedaGeneral, {
        hitsPerPage: 10,
        facetFilters: facetFilters.length > 0 ? facetFilters : undefined,
      });

    // Evitar duplicado con objectID
      const materialesUnicos = [...new Map(hits.map(item => [item.objectID, item])).values()];
      setMateriales(materialesUnicos);
     
      // Actualizar lista de nombres únicos
      setOpcionesNombre([...new Set(hits.map(hit => hit.nombre))]);
    } catch (error) {
      console.error("❌ Error al buscar en Algolia", error);
    }
  };


  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", mb: 3, alignItems: "center", textAlign: "center", backgroundColor: "#1976d2", padding: 1, borderRadius: 3 }}>
        <Box sx={{ mr: 2 }}>
          <img src="/quote.png" alt="quote" style={{ width: 30, height: 30, marginRight: 3, marginLeft: 7, marginBottom: 3 }} />
        </Box>      
        <Typography
          gutterBottom
          sx={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            letterSpacing: "0.05em",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexGrow: 1,
          }}
        >
          Cotización de Materiales
        </Typography>
      </Box>

      <Box 
        display= "flex"
        alignItems= "center"
        gap={1}
        mb={3}
        flexWrap="wrap"
      >
        <Box sx={{ mb:2 }}>
          <Typography 
            sx={{
              mb: 1,
              fontWeight: "bold",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: 1
            }}
          >
            <FilterListIcon sx={{ color: "white" }} />
            General
          </Typography>
          <Autocomplete
            freeSolo
            options={opcionesNombre}
            value={filtroBusquedaGeneral}
            onInputChange={(event, newInputValue) => {
              setFiltroBusquedaGeneral(newInputValue || "");
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                sx={{
                  width: 200,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            )}
          />
        </Box>  
        <Box sx={{ mb:2 }}>
          <Typography 
            sx={{ 
              mb: 1,
              fontWeight: "bold",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: 1
            }}
          >
            <FilterListIcon sx={{ color: "white" }} />
            Categoría
          </Typography>
          <Autocomplete
            freeSolo
            autoSelect
            openOnFocus
            autoHighlight
            options={[...new Set(materiales.map((m) => m.categoria.trim())
              .filter((val) => typeof val === "string" && val.length > 0)
            )]}
            filterOptions={(options, state) => {
              // Function to ignore special characters and spaces, except spanish accents
              const normalizeString = (str) =>
                str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");              
              const cleanInput = normalizeString(state.inputValue);
              return options.filter((option) => {
                const cleanOption = normalizeString(option);
                return cleanOption.includes(cleanInput);
              });
            }}
            inputValue={inputCategoria}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === "input") {
                setInputCategoria(newInputValue);
              }
            }}
            onChange={(event, newValue) => {
              const valor = typeof newValue === "string" ? newValue : "";
              setInputCategoria(valor);
              setFiltroCategoria(valor); // 👈 se aplica el filtro
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                sx={{
                  width: 200,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />        
            )}
          />
        </Box>
        <Box sx={{ mb:2 }}>
          <Typography 
            sx={{
              mb: 1,
              fontWeight: "bold",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: 1
            }}
          >
            <FilterListIcon sx={{ color: "white" }} />
            Nombre
          </Typography>
          <Autocomplete
            freeSolo
            autoSelect
            openOnFocus
            autoHighlight
            options={[...new Set(materiales.map((m) => m.nombre.trim())
              .filter((val) => typeof val === "string" && val.length > 0)
            )]}
            filterOptions={(options, state) => {
              // Function to ignore special characters and spaces, except spanish accents
              const normalizeString = (str) =>
                str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              const cleanInput = normalizeString(state.inputValue);
              return options.filter((option) => {
                const cleanOption = normalizeString(option);
                return cleanOption.includes(cleanInput);
              });
            }}
            inputValue={inputNombre}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === "input") {
                setInputNombre(newInputValue);
              }
            }}
            onChange={(event, newValue) => {
              const valor = typeof newValue === "string" ? newValue : "";
              setInputNombre(valor);
              setFiltroNombre(valor);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                sx={{
                  width: 200,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            )}
          />
        </Box>
        <Box sx={{ mb:2 }}>
          <Typography 
            sx={{ 
              mb: 1,
              fontWeight: "bold",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: 1
            }}
          >
            <FilterListIcon sx= {{ color: "white" }} />
            Figura
          </Typography>
          <Autocomplete
            freeSolo
            autoSelect
            openOnFocus
            autoHighlight
            options={[...new Set(materiales.map((m) => m.figura.trim())
              .filter((val) => typeof val === "string" && val.length > 0)
            )]}
            filterOptions={(options, state) => {
              // Function to ignore special characters and spaces, except spanish accents
              const normalizeString = (str) =>
                str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
              const cleanInput = normalizeString(state.inputValue);
              return options.filter((option) => {
                const cleanOption = normalizeString(option);
                return cleanOption.includes(cleanInput);
              });
            }}
            inputValue={inputFigura}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === "input") {
                setInputFigura(newInputValue);
              }
            }}
            onChange={(event, newValue) => {
              const valor = typeof newValue === "string" ? newValue : "";
              setInputFigura(valor);
              setFiltroFigura(valor);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                sx={{
                  width: 170,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            )}
          />  
        </Box>
        <Box sx={{ mb:2 }}>
          <Typography 
            sx={{
              mb: 1,
              fontWeight: "bold",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: 1
            }}
          >
            <FilterListIcon sx={{ color: "white" }} />
            Espesor
          </Typography>
          <Autocomplete
            freeSolo
            autoSelect
            openOnFocus
            autoHighlight
            options={[
              ...new Set(
                materiales
                .map((m) => m.espesorFraccion?.trim())
                .filter((val) => typeof val === "string" && val.length > 0)
              ),
            ]}
            filterOptions={(options, state) => {
              const cleanInput = state.inputValue.toLowerCase().replace(/["()\\s]/g, "");
              return options.filter((option) => {
                const cleanOption = option.toLowerCase().replace(/["()\\s]/g, "");
                return cleanOption.includes(cleanInput);
              });
            }}
            inputValue={inputEspesor}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === "input") {
                setInputEspesor(newInputValue);
              }
            }}
            onChange={(event, newValue) => {
              const valor = typeof newValue === "string" ? newValue : "";
              setInputEspesor(valor);
              setFiltroEspesor(valor); // 👈 se aplica el filtro
          }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                sx={{
                  width: 170,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            )}
          />
        </Box>
        <Box sx={{ mb:2 }}>
          <Typography
            sx={{
              mb: 1,
              fontWeight: "bold",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: 1
            }}
          >
            <FilterListIcon sx={{ color: "white" }} />
            Diámetro
          </Typography>
          <Autocomplete
            freeSolo
            autoSelect
            openOnFocus
            autoHighlight
            options={[
              ...new Set(
                materiales
                  .map((m) => m.diametroFraccion?.trim())
                  .filter((val) => typeof val === "string" && val.length > 0)
              ),  
            ]}
            filterOptions={(options, state) => {
              const cleanInput = state.inputValue.toLowerCase().replace(/["()\\s]/g, "");
              return options.filter((option) => {
                const cleanOption = option.toLowerCase().replace(/["()\\s]/g, "");
                return cleanOption.includes(cleanInput);
              });
            }}
            inputValue={inputDiametro}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === "input") {
                setInputDiametro(newInputValue);
              }
            }}
            onChange={(event, newValue) => {
              const valor =  typeof newValue === "string" ? newValue : "";
              setInputDiametro(valor);
              setFiltroDiametro(valor); // 👈 se aplica el filtro
            }} 
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                sx={{
                  width: 170,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            )}
          />
        </Box>
        <Box sx={{ mb:2 }}>
          <Typography
            sx={{
              mb: 1,
              fontWeight: "bold",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: 1
            }}
          >
            <FilterListIcon sx={{ color: "white" }} />
            Ancho
          </Typography>
          <Autocomplete
            freeSolo
            autoSelect
            openOnFocus
            autoHighlight
            options={[
              ...new Set(
                materiales
                  .map((m) => m.anchoFraccion.trim())
                  .filter((val) => typeof val === "string" && val.length > 0)
              ),
            ]}
            filterOptions={(options, state) => {
              const cleanInput = state.inputValue.toLowerCase().replace(/["()\\s]/g, "");
              return options.filter((option) => {
                const cleanOption = option.toLowerCase().replace(/["()\\s]/g, "");
                return cleanOption.includes(cleanInput);
              });
            }}
            inputValue={inputAncho}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === "input") {
                setInputAncho(newInputValue);
              }
            }}
            onChange={(event, newValue) => {
              const valor = typeof newValue === "string" ? newValue : "";
              setInputAncho(valor);
              setFiltroAncho(valor); // 👈 se aplica el filtro
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                sx={{
                  width: 170,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            )}
          />
        </Box>
        <Box sx={{ mb:2 }}>
          <Typography 
            sx={{
              mb: 1,
              fontWeight: "bold",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: 1
            }}
          >
            <FilterListIcon sx={{ color: "white" }} />
            Largo
          </Typography>
          <Autocomplete
            freeSolo
            autoSelect
            openOnFocus
            autoHighlight
            options={[
              ...new Set(
                materiales
                .map((m) => m.largoFraccion?.trim())
                .filter((val) => typeof val === "string" && val.length > 0)
              ),
            ]}
            filterOptions={(options, state) => {
              const cleanInput = state.inputValue.toLowerCase().replace(/["()\\s]/g, "");
              return options.filter((option) => {
                const cleanOption = option.toLowerCase().replace(/["()\\s]/g, "");
                return cleanOption.includes(cleanInput);
              });
            }}
            inputValue={inputLargo}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === "input") {
                setInputLargo(newInputValue);
              }
            }}
            onChange={(event, newValue) => {
              const valor = typeof newValue === "string" ? newValue : "";
              setInputLargo(valor);
              setFiltroLargo(valor); // 👈 se aplica el filtro
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                size="small"
                sx={{
                  width: 170,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    },
                }}
              />  
            )}
          />
          </Box>
          <Box sx={{ mb:2 }}>
            <Typography
              sx={{
                mb: 1,
                fontWeight: "bold",
                letterSpacing: "0.05em",
                display: "flex",
                alignItems: "center",
                gap: 1
              }}
            >
              <FilterListIcon sx={{ color: "white" }} />
              Costo
            </Typography>
            <Autocomplete
              freeSolo
              autoSelect
              openOnFocus
              autoHighlight
              options={[...new Set(materiales.map((m) => m.costo?.trim()) // Error if costo is undefined
                .filter((val) => typeof val === "string" && val.length > 0)
              )]}
              inputValue={inputCosto}
              onInputChange={(event, newInputValue, reason) => {
                if (reason === "input") {
                  setInputCosto(newInputValue);
                }
              }}
              onChange={(event, newValue) => {
                const valor = typeof newValue === "string" ? newValue : "";
                setInputCosto(valor);
                setFiltroCosto(valor); // Filter applied here
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  type="number"
                  variant="outlined"
                  size="small"
                  sx={{
                    width: 170,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              )}
            />
          </Box>

          <Box sx={{ mt: -7, ml: 3, }}>
            <IconButton
              onClick={() => {
               setFiltroBusquedaGeneral("");
              setFiltroCategoria("");
              setInputCategoria("");
              setFiltroNombre("");
              setInputNombre("");
              setFiltroFigura("");
              setInputFigura("");
              setFiltroEspesor("");
              setInputEspesor("");
              setFiltroDiametro("");
              setInputDiametro("");
              setFiltroAncho("");
              setInputAncho("");
              setFiltroLargo("");
              setInputLargo("");
              setFiltroCosto("");
              setInputCosto("");
            }}
              sx={{
                p: 0.7,
                height: "40px",
                width: "70px",
                backgroundColor: "black",
                border: "1px solid white",
                borderRadius: "22px",
                "&:hover": { backgroundColor: "green"},
              }}
            >
              <img src="/filter.png" alt="filter" style={{ width: "35px", height: "35px" }} />
            </IconButton>
          </Box>
        </Box>

        <Paper sx={{ overflowX: "auto", backgroundColor: "black" }}>
          <Table sx={{ minWidth: 650, borderCollapse: "collapse" }} size="small">
            <TableHead
              sx={{ "& th": { fontWeight: "bold", backgroundColor: "#1976d2", fontSize: "1.2rem", letterSpacing: "0.05em", color: "white", border: "1px solid white"} }}>
              <TableRow>
                <TableCell>Categoría</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Figura</TableCell>
                <TableCell>Espesor</TableCell>
                <TableCell>Diámetro</TableCell>
                <TableCell>Ancho</TableCell>
                <TableCell>Largo</TableCell>
                <TableCell>$ Costo</TableCell>
                <TableCell>$ Costo pulg. ²</TableCell>
                <TableCell>$ Costo pulg.</TableCell>
                <TableCell>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody
              sx={{ "& td": { border: "1px solid white", fontSize: "0.9rem", color: "white", letterSpacing: "0.05em" } }}>
              {materiales.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>{material.categoria}</TableCell>
                  <TableCell>{material.nombre}</TableCell>
                  <TableCell>{material.figura}</TableCell>
                  <TableCell>{material.espesorFraccion}</TableCell>
                  <TableCell>{material.diametroFraccion}</TableCell>
                  <TableCell>{material.anchoFraccion}</TableCell>
                  <TableCell>{material.largoFraccion}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{material.costo}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{material.costoPulgadaCuadrada}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{material.costoPulgadaLineal}</TableCell>
                  <TableCell sx={{ display: "flex", justifyContent: "center" }}>
                    <Button 
                      onClick={() => agregarAlCarrito(material)}
                      sx={{ color: "white", backgroundColor: "#1976d2", "&:hover": { backgroundColor: "green" }, padding: "4px 8px", borderRadius: 2, display: "flex", alignItems: "center", gap: 0.5, }}
                    >
                      <ShoppingCartIcon sx={{ fontSize: "1rem" }} />
                      <Typography sx={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>Agregar</Typography>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
    </Box>
  );
};

export default QuoteForm;
