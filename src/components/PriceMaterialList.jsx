import React, { useEffect, useState } from "react";
import { collection, getDocs , deleteDoc, doc, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { 
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Button,
  Autocomplete,
  TextField,
  IconButton,
  TablePagination,
  Chip,
  Tooltip
} from "@mui/material";
import FilterListAltIcon from '@mui/icons-material/FilterListAlt';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon  from '@mui/icons-material/CheckCircle';


const PriceMaterialList = ({ setFormData, setModoEditar, setVista}) => {
  
  const [ precioporpeso, setPrecioPorPeso ] = useState([]);
  const [ filtroNombre , setFiltroNombre ] = useState("");
  const [ inputNombre , setInputNombre ] = useState("");
  const [ filtroFigura , setFiltroFigura ] = useState("");
  const [ inputFigura , setInputFigura ] = useState("");
  const [ filtroMedidaReferencia, setFiltroMedidaReferencia ] = useState("");
  const [ inputMedidaReferencia, setInputMedidaReferencia ] = useState("");
  const [ filtroAcabado, setFiltroAcabado ] = useState("");
  const [ inputAcabado, setInputAcabado ] = useState("");
  const [ filtroPrecioLibra, setFiltroPrecioLibra ] = useState("");
  const [ inputPrecioLibra, setInputPrecioLibra ] = useState("");
  const [ filtroFecha, setFiltroFecha ] = useState("");
  const [ inputFecha, setInputFecha ] = useState("");
  const [ filtroProveedor, setFiltroProveedor ] = useState("");
  const [ inputProveedor, setInputProveedor ] = useState("");
  const [ filtroDensidad, setFiltroDensidad ] = useState("");
  const [ inputDensidad, setInputDensidad ] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);


  useEffect(() => {
      obtenerPreciosFirestore();
    }, [
        filtroNombre,
        filtroFigura,
        filtroMedidaReferencia,
        filtroAcabado,
        filtroPrecioLibra,
        filtroFecha,
        filtroProveedor,
        filtroDensidad,
      ]
    );

    const obtenerPreciosFirestore = async () => {
      try {
        const filtros = [];
        if (filtroNombre) filtros.push(where("nombre", "==", filtroNombre.trim()));
        if (filtroFigura) filtros.push(where("figura", "==", filtroFigura.trim()));
        if (filtroMedidaReferencia) filtros.push(where("medidareferencia", "==", filtroMedidaReferencia.trim()));
        if (filtroAcabado) filtros.push(where("acabado", "==", filtroAcabado.trim()));
        if (filtroPrecioLibra) {
          const precioNum = parseFloat(filtroPrecioLibra);
          if (!isNaN(precioNum)) {
            filtros.push(where("preciolibra", "==", precioNum));
          }
        }    
        if (filtroFecha) filtros.push(where("fecha", "==", filtroFecha));
        if (filtroProveedor) filtros.push(where("proveedor", "==", filtroProveedor.trim()));
        if (filtroDensidad) {
          const densidadNum = parseFloat(filtroDensidad);
          if (!isNaN(densidadNum)) {
            filtros.push(where("densidadlpi3", "==", densidadNum));
          }
        }

        const q = filtros.length > 0 
          ? query(collection(db, "precioporpeso"), ...filtros)
          : collection(db, "precioporpeso");
        
        const querySnapshot = await getDocs(q);
        const lista = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Convert Timestamp to string
          fechaDisplay: doc.data().fecha?.toDate ?
            doc.data().fecha.toDate().toLocaleDateString('es-MX'):
            doc.data().fecha || '-'
        }));

        setPrecioPorPeso(lista);
        setPage(0); // Reset to first page
      } catch (error) {
        console.error("Error al obtener los precios", error);
        alert("❌ No se pudieron cargar los precios");
      }
    };


    const handleEditar = (precio) => {
    setFormData({
        id: precio.id,
        nombre: precio.nombre ||"",
        acabado: precio.acabado || "",
        figura: precio.figura ||"",
        medidareferencia: precio.medidareferencia ||"",
        preciolibra: precio.preciolibra  || 0,
        fecha: precio.fecha || "",
        proveedor: precio.proveedor || "",
        densidad: precio.densidad || 0,
    });

    setModoEditar(true);
    setVista("formularioPrecioPeso"); // Cambia la vista a modo edición
  };
    
  // Función para eliminar un material

    const eliminarPrecio = async (id) => {
      if (window.confirm("¿Estas seguro de eliminar este precio?")) { 
        try {
            await deleteDoc(doc(db, "precioporpeso", id));
            setPrecioPorPeso((prev) => prev.filter((p) => p.id !== id));
            alert("🗑️ Precio eliminado correctamente");
        } catch (error) {
            console.error( "Error al eliminar", error );
            alert("❌ No se pudo eliminar el precio");
        }
      }
    };
    
    const limpiarFiltros = () => {
    setFiltroNombre("");
    setInputNombre("");
    setFiltroFigura("");
    setInputFigura("");
    setFiltroAcabado("");
    setInputAcabado("");
    setFiltroMedidaReferencia("");
    setInputMedidaReferencia("");
    setFiltroPrecioLibra("");
    setInputPrecioLibra("");
    setFiltroProveedor("");
    setInputProveedor("");
    setFiltroFecha("");
    setInputFecha("");
    setFiltroDensidad("");
    setInputDensidad("");
  };

  const getPrecioIndicator = (precio) => {
    const precioNum = parseFloat(precio);
    if (precioNum > 50) {
      return <Chip label="Alto" color="error" size="small"  icon={<WarningIcon />} />;
    } else if (precioNum > 20) {
      return <Chip label="Medio" color="warning" size="small" />;
    } else {
      return <Chip label="Bajo" color="success" size="small" icon={<CheckCircleIcon />} />;
    }
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  }

  const handleChangeRowsPerPage =(event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const datosPaginados = precioporpeso.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ mt:4 }}>
      {/* Header */}  
      <Box sx={{ 
        display: "flex",
        alignItems: "center",
        mb: 3, 
        backgroundColor: "rgba(247, 86, 124, 0.8)",
        padding: 1,
        borderRadius: 3,
        boxShadow: "0 0 20px rgba(247, 86, 124, 0. 8",  
      }}>
        <Box sx={{ mr: 2 }}>
          <img
            src="/list.png"
            alt="Lista"
            style={{ width: 30, height: 30, marginRight: 3, marginLeft: 7, marginBottom: 3 }} 
          />
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
          Lista de Precios ({precioporpeso.length} registros)
        </Typography>
      </Box>

      {/* Filtros */}    
      <Box 
        display= "flex"
        alignItems= "center"
        gap={2}
        mb={3}
        flexWrap= "wrap"
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
            <FilterListAltIcon sx={{ color: "white" }} />
            Nombre
          </Typography>
          <Autocomplete
            freeSolo
            autoSelect
            openOnFocus
            autoHighlight
            options={[...new Set(precioporpeso
              .map((p) => p.nombre)
              .filter((val) => typeof val === "string" && val.length > 0)
            )]}
            inputValue={inputNombre}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === "input") {
                setInputNombre(newInputValue);
              }
            }}
            onChange={(event, newValue) => {
              const valor = typeof newValue === "string" ? newValue : "";
              setInputNombre(valor);
              setFiltroNombre(valor); // 👈 se aplica el filtro
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

        {/* Filtro Figura */}
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
            <FilterListAltIcon sx= {{ color: "white" }} />
            Figura
          </Typography>
          <Autocomplete
            freeSolo
            autoSelect
            openOnFocus
            autoHighlight
            options={[...new Set(precioporpeso
              .map((p) => p.figura)
              .filter((val) => typeof val === "string" && val.length > 0)
            )]}
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
                  width: 200,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            )}
          />  
        </Box>

        {/* Filtro Acabado */}
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
            <FilterListAltIcon sx={{ color: "white" }} />
            Acabado
          </Typography>
          <Autocomplete
            freeSolo
            autoSelect
            openOnFocus
            autoHighlight
            options={[...new Set(precioporpeso
                .map((p) => p.acabado)
                .filter((val) => typeof val === "string" && val.length > 0)
            )]}
            inputValue={inputAcabado}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === "input") {
                setInputAcabado(newInputValue);
              }
            }}
            onChange={(event, newValue) => {
              const valor = typeof newValue === "string" ? newValue : "";
              setInputAcabado(valor);
              setFiltroAcabado(valor); // 👈 se aplica el filtro
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

        {/* Filtro Medida Referencia */}
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
            <FilterListAltIcon sx={{ color: "white" }} />
            Medida Ref.
          </Typography>
          <Autocomplete
            freeSolo
            autoSelect
            openOnFocus
            autoHighlight
            options={[...new Set(precioporpeso
                .map((p) => p.medidareferencia?.trim())
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
            inputValue={inputMedidaReferencia}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === "input") {
                setInputMedidaReferencia(newInputValue);
              }
            }}
            onChange={(event, newValue) => {
              const valor = typeof newValue === "string" ? newValue : "";
              setInputMedidaReferencia(valor);
              setFiltroMedidaReferencia(valor); // 👈 se aplica el filtro
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

        {/* Filtro Precio Lb */}
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
            <FilterListAltIcon sx={{ color: "white" }} />
            Precio Lb
          </Typography>
          <Autocomplete
            freeSolo
            autoSelect
            openOnFocus
            autoHighlight
            options={[...new Set(precioporpeso
              .map((p) => String(p.preciolibra))
              .filter((val) => val && val !== 'undefined' && val !== 'null')
            )].sort((a, b) => parseFloat(a) - parseFloat(b))}
              inputValue={inputPrecioLibra}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === "input") {
                setInputPrecioLibra(newInputValue);
              }
            }}
            onChange={(event, newValue) => {
              const valor =  typeof newValue === "string" ? newValue : "";
              setInputPrecioLibra(valor);
              setFiltroPrecioLibra(valor); // 👈 se aplica el filtro
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

        {/* Filtro Fecha */}
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
            <FilterListAltIcon sx={{ color: "white" }} />
            Fecha
          </Typography>
          <Autocomplete
            freeSolo
            autoSelect
            openOnFocus
            autoHighlight
            options={[...new Set(precioporpeso
              .map((p) => p.fecha)
              .filter((val) => typeof val === "string" && val.length > 0)
              )]}
            inputValue={inputFecha}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === "input") {
                setInputFecha(newInputValue);
              }
            }}
            onChange={(event, newValue) => {
              const valor = typeof newValue === "string" ? newValue : "";
              setInputFecha(valor);
              setFiltroFecha(valor); // 👈 se aplica el filtro
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
            <FilterListAltIcon sx={{ color: "white" }} />
            Proveedor
          </Typography>
          <Autocomplete
            freeSolo
            autoSelect
            openOnFocus
            autoHighlight
            options={[...new Set(precioporpeso
              .map((p) => p.proveedor)
              .filter((val) => typeof val === "string" && val.length > 0)
              )]}
            inputValue={inputProveedor}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === "input") {
                setInputProveedor(newInputValue);
              }
            }}
            onChange={(event, newValue) => {
              const valor = typeof newValue === "string" ? newValue : "";
              setInputProveedor(valor);
              setFiltroProveedor(valor); // 👈 se aplica el filtro
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
            <FilterListAltIcon sx= {{ color: "white" }} />
            Densidad
          </Typography>
          <Autocomplete
            freeSolo
            autoSelect
            openOnFocus
            autoHighlight
            options={[...new Set(precioporpeso
              .map((p) => String(p.densidadlpi3))
              .filter((val) => val && val !== 'undefined' && val !== 'null')
            )].sort((a, b) => parseFloat(a) - parseFloat(b))}
            inputValue={inputDensidad}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === "input") {
                setInputDensidad(newInputValue);
              }
            }}
            onChange={(event, newValue) => {
              const valor = typeof newValue === "string" ? newValue : "";
              setInputDensidad(valor);
              setFiltroDensidad(valor);
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

        {/* Botón limpiar Filtros */}
        <Box sx={{ mt: -7, ml: 3,  }}>
          <Tooltip title="Limpiar todos los filtros">
            <IconButton
              onClick={limpiarFiltros}
              sx={{
                p: 0.7,
                height: "40px",
                width: "70px",
                backgroundColor: "#f7567c",
                border: "1px solid white",
                borderRadius: "22px",
                transition: "all 0.3s ease",
                "&:hover": {
                    backgroundColor: "#fcfcfc",
                    boxShadow: "0 0 20px rgba(247, 86, 124, 0.8)",
                },
              }}
            >
              <img
                src="/filter.png"
                alt="filter"
                style={{ width: "35px", height: "35px" }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Table */}
      <Paper sx={{ 
        overflowX: "auto",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        border: "1px solid rgba(247, 86, 124, 0.3)",
        borderRadius: 2
      }}>
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow sx={{
                backgroundColor: "rgba(247, 86, 124, 0.2",
                borderBottom: "2px solid #f7567c"
            }}>
              <TableCell sx={{ color: "#f7567c", fontWeight: 700 }}>Nombre</TableCell>
              <TableCell sx={{ color: "#f7567c", fontWeight: 700 }}>Figura</TableCell>
              <TableCell sx={{ color: "#f7567c", fontWeight: 700 }}>Acabado</TableCell>
              <TableCell sx={{ color: "#f7567c", fontWeight: 700 }}>Medida Referencia</TableCell>
              <TableCell sx={{ color: "#f7567c", fontWeight: 700 }}>Precio/Lb</TableCell>
              <TableCell sx={{ color: "#f7567c", fontWeight: 700 }}>Indicador</TableCell>
              <TableCell sx={{ color: "#f7567c", fontWeight: 700 }}>Densidad</TableCell>
              <TableCell sx={{ color: "#f7567c", fontWeight: 700 }}>Proveedor</TableCell>
              <TableCell sx={{ color: "#f7567c", fontWeight: 700 }}>Fecha</TableCell>
              <TableCell sx={{ color: "#f7567c", fontWeight: 700 }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody> 
            {datosPaginados.map((precio) => (
              <TableRow 
                key={precio.id}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(247, 86, 124, 0.05)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <TableCell sx={{ color: "white" }}>{precio.nombre}</TableCell>
                <TableCell sx={{ color: "white" }}>{precio.figura}</TableCell>
                <TableCell sx={{ color: "white" }}>{precio.acabado}</TableCell>
                <TableCell sx={{ color: "white" }}>{precio.medidareferencia}</TableCell>
                <TableCell sx={{ color: "#4ade80", fontWeight: 600 }}>
                  ${precio.preciolibra}
                </TableCell>
                <TableCell>{getPrecioIndicator(precio.preciolibra)}</TableCell>
                <TableCell sx={{ color: "white" }}>{precio.densidadlpi3}</TableCell>
                <TableCell sx={{ color: "white" }}>{precio.proveedor}</TableCell>
                <TableCell sx={{ color: "white" }}>{precio.fechaDisplay}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleEditar(precio)}
                      sx={{
                        minWidth: "auto",
                        px: 1.5,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)"  ,
                        }
                      }}
                    >
                      <Box
                        component="img"
                        src="/editR2D2.png"
                        alt="EditarR2D2"
                        sx={{ width: 25, height: 25 }} 
                      />
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => eliminarPrecio(precio.id)}
                      sx={{ 
                        minWidth: "auto",
                        px: 1.5,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.05)",  
                        }
                      }}
                    >
                      <Box  
                        component="img"
                        src="/deleteDeathStar.png"
                        alt="EliminarDeathStar"
                        sx={{ width: 25, height: 25 }} 
                      />
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Paginación */}
        <TablePagination  
          component="div"
          count={precioporpeso.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          sx={{
            color: "white",
            borderTop: "1px solid rgba(247, 86, 124, 0.3)",
            "& .MuiTablePagination-selectIcon": {
              color: "white",
            },
            "& .MuiTablePagination-actions": {
              color: "white",
            }
          }}
        />
      </Paper>
    </Box>
  );
};

export default PriceMaterialList;

