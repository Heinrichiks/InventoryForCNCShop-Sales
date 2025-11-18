import React, { useEffect, useState} from "react";
import { Autocomplete, Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, TextField, Button, styled ,MenuItem,  } from "@mui/material";
import { db } from "../firebase";
import { doc, getDoc, setDoc, getDocs, collection, query, addDoc,  } from "firebase/firestore"; 
import autoTable  from "jspdf-autotable";
import jsPDF from "jspdf";
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SaveIcon from '@mui/icons-material/Save';


const Carrito = ({ carrito, actualizarCarrito, eliminarDelCarrito }) => {
  const [quotationnumber, setquotationnumber] = useState(1);
  const [comments, setComments] = useState("");
  const [moneda, setMoneda] = useState("MXN");
  const [tiempoEntrega, setTiempoEntrega] = useState(5);
  const [condicionesPago, setCondicionesPago] = useState("Crédito");
  const [vigencia, setVigencia] = useState(30);
  const [cliente, setCliente] = useState({ empresa: "", contactos: "", telefono: "", });

  
  useEffect(() => {
    // Fetch the current quotation number from Firestore on component mount
    const fetchQuotationNumber = async () => {
      const ref = doc(db, "quotationnumber", "current");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setquotationnumber(snap.data().number);
      } else {
        console.log("No such document!");
      }
    };
    fetchQuotationNumber();
  }, []);

  const updateQuotationNumber = async () => {
    const ref = doc(db, "quotationnumber", "current");
    await setDoc(ref, { number: quotationnumber + 1 }, { merge: true });
    setquotationnumber((prev) => prev + 1);
  }

  const manejarCambio = (id, campo, valor) => {
    actualizarCarrito(id, campo, valor);
  };

  // Autocomplete for clients database from Firestore
  useEffect(() => {
  const clientes = async () => {
    const querySnapshot = await getDocs(collection(db, "clientes"));
    const clientesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setClientes(clientesData);
  };
  clientes();
}, []);

  const [clientes, setClientes] = useState([]);

  const getContactosByCliente  = async (clienteId) => {
    const contactosRef = collection(db, "clientes", clienteId, "contactos");
    const querySnapshot = await getDocs(contactosRef);
    const contactosData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    console.log("Contactos data:", contactosData); // Debugging line
    setContactos(contactosData);
  };

  const [contactos, setContactos] = useState([]);


  const calcularCostoUnitario = (item) => {
    const anchoUnitario = parseFloat(item.anchoDecimal) || 0;
    const largoUnitario = parseFloat(item.largoDecimal) || 0;
    //const ganancia is the profit in percentage
    const ganancia = parseFloat(item.ganancia) || 0;

    if (item.figura.toLowerCase() === "redondo") {
      const costoLinealUnitario = parseFloat(item.costoPulgadaLineal) || 0;
      return (largoUnitario * costoLinealUnitario * (1 + ganancia / 100)).toFixed(2);
    } else {
      const costoCuadradoUnitario = parseFloat(item.costoPulgadaCuadrada)
      return (anchoUnitario * largoUnitario * costoCuadradoUnitario * (1 + ganancia / 100)).toFixed(2);
    }
  };

  const calcularSubtotal = (item) => {
    if (!item.cantidad || item.cantidad <= 0) return "0.00";
    else {
      return (calcularCostoUnitario(item) * item.cantidad).toFixed(2);
    }
  };

  const generatePDF = async() => {
    // Update the quotation number in Firestore
    try {
    const currentNumber = quotationnumber;
    
    // Create the PDF document
    const pdf = new jsPDF();
    const date = new Date().toLocaleDateString();

    // 1. Add logo
    const resizeImage = (file, maxWidth, maxHeight) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = file;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/png", 0.8));
        };
      });
    };

    const logoBase64 = await resizeImage("/beskar.png", 200, 200);
    pdf.addImage(logoBase64, "PNG", 19, 5, 19, 17);

    // 2. Add title and quotation number
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(72, 0, 154);
    pdf.text("Cotización", 105, 15, { align: "center" });
    // 3. Add date and quotation number
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Cotización No. ${currentNumber}`, 200, 20, { align: "right" });
    pdf.text(`Fecha: ${date}`, 200, 28, { align: "right" });

    //Divisor line
    pdf.setDrawColor(72, 0, 154);
    pdf.setLineWidth(1);
    pdf.line(14, 34, 200, 34);

    // 4. Information about the company
    // Style the company info
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text("Heinrichiks S.A. de C.V.", 14, 46);

    //Line break
    pdf.setDrawColor(72, 0, 154);
    pdf.setLineWidth(0.5);
    pdf.line(14, 48, 200, 48);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);

    let y = 56;
    const info = [
      { label: "Dirección", value: "Calle 123, Ciudad,", },
      { label: "Teléfono", value: "899-346-1256", },
      { label: "Email", value: "heinrichiks@gmail.com", },
      { label: "RFC", value: "TUE123456789", },
      { label: "Contacto", value: "Enrique Sánchez", },
    ];

    // Loop through the info array to add each line
    info.forEach((item) => {
      pdf.setFont("helvetica", "bold");
      pdf.text(`${item.label}:`, 14, y);
      pdf.setFont("helvetica", "normal");
      pdf.text(item.value, 60, y);
      y += 6;
    });

    // 5. Information about the client
    let clienteY = 56;
      const clienteX = [
      { label: "Cliente", value: cliente.empresa || "____________________" },
      { label: "Contacto", value: cliente.nombre || "____________________" },
      { label: "Teléfono", value: cliente.telefono || "____________________" },
      { label: "Email", value: cliente.email || "____________________" },
    ];

    clienteX.forEach((item) => {
      pdf.setFont("helvetica", "bold");
      pdf.text(`${item.label}:`, 121, clienteY);
      pdf.setFont("helvetica", "normal");
      pdf.text(item.value, 150, clienteY);
      clienteY += 6;
    });

    pdf.setFont("helvetica", "bold");
    pdf.text("Datos del cliente:", 117, 46);

    // 6. Prepare the table data
    const tableColumn = [
      "Categoría",
      "Nombre",
      "Figura",
      "Espesor",
      "Diámetro",
      "Ancho",
      "Largo",
      "Cantidad",
      "Costo Unitario",
      "Subtotal"
    ];

    const tableRows = carrito.map((item) => [
      item.categoria,
      item.nombre,
      item.figura,
      item.espesorFraccion || "-",
      item.diametroFraccion || "-",
      item.anchoDecimal || "-",
      item.largoDecimal || "-",
      item.cantidad || "-",
      calcularCostoUnitario(item),
      calcularSubtotal(item),
    ]);

    autoTable(pdf, {
      startY: 90,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: { fontSize: 10, halign: "center" },
      headStyles: { fillColor: [72, 0, 154], textColor: 255 },
    });

    // 6. Save the PDF
    const totalAmount = carrito.reduce((acc, item) => acc + Number(calcularSubtotal(item)), 0);
    pdf.setFontSize(14);
    pdf.text(`Total: $${totalAmount.toFixed(2)}`, 195, pdf.lastAutoTable.finalY + 10, { align: "right" });
    
    // Footer note after the table
    y = pdf.lastAutoTable.finalY + 20;
    pdf.setFont("helvetica", "italic");
    pdf.setFontSize(8);
    pdf.text(`Moneda: ${moneda}`, 14, y);
    pdf.text(`Tiempo de entrega: ${tiempoEntrega} días`, 14, y + 5);
    pdf.text(`Vigencia: ${vigencia} días`, 14, y + 10);
    pdf.text(`Condiciones de pago: ${condicionesPago}`, 14, y + 15);
    pdf.text(`Comentarios: ${comments || "Ninguno"}`, 14, y + 20);
    pdf.text("Esta cotización no es una factura. Los precios y stock están sujetos a cambios sin previo aviso.", 105, 290, { align: "center" });
    

    pdf.save(`Cotizacion_${currentNumber}.pdf`);

    // Increment and update the quotation number in Firestore
    await updateQuotationNumber();
    
    // Update the local state for next quotation
    setquotationnumber(currentNumber + 1);

    } catch (error) {
      console.error("Error generating PDF or updating quotation number: ", error);
    }
  };

  const opcionesDias = Array.from({ length: 45 }, (_, i) => i + 1);
  const opciones = ["Stock", ...opcionesDias];
  const opcionesDiasVigencia = Array.from({ length: 45 }, (_, i) => i + 1);

  const extractNumber = (value) => {
   if (value == null) return null;
   // si ya es número
   if (typeof value === "number" && !isNaN(value)) return value;
   // si es string, extrae los dígitos contiguos
   const digits = String(value).match(/\d+/);
   return digits ? Number(digits[0]) : null;
  }

  const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    backgroundColor: 'black',
    color: 'white',
    "&:hover": {
      backgroundColor: 'green',
    },
    "&.Mui-selected": {
      backgroundColor: 'darkgray',
      color: 'black',
    },
    "&.Mui-focusVisible": {
      backgroundColor: 'gray',
      color: 'white',
    },
    "&.Mui-selected.Mui-focusVisible":{
      backgroundColor: 'darkgray',
      color: 'black',
    },
  }));

  const guardarCotizacion = async () => {
  try {
    const total = carrito.reduce(
      (acc, item) => acc + Number(calcularSubtotal(item)),
      0
    );

    const cotizacion = {
      numero: quotationnumber,
      clienteId: cliente.id || null,
      clienteNombre: cliente.empresa || "Sin cliente",
      fecha: new Date().toISOString(),
      vigenciaDias: Number(vigencia),
      tiempoEntregaDias: Number(tiempoEntrega),
      total: total,
      items: carrito.map((item) => ({
        categoria: item.categoria,
        nombre: item.nombre,
        figura: item.figura,
        espesor: item.espesorFraccion || null,
        diametro: item.diametroFraccion || null,
        ancho: item.anchoDecimal || null,
        largo: item.largoDecimal || null,
        cantidad: item.cantidad || 0,
        precioUnitario: Number(calcularCostoUnitario(item)),
        subtotal: Number(calcularSubtotal(item)),
      })),
    };

    await addDoc(collection(db, "cotizaciones"), cotizacion);

    console.log("✅ Cotización guardada:", cotizacion);
    alert(`Cotización ${quotationnumber} guardada con éxito`);

    
    await updateQuotationNumber();

  } catch (error) {
    console.error("❌ Error al guardar cotización:", error);
  }
};


  return (

    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", mb: 3, alignItems: "center", textAlign: "center", backgroundColor: "#48009aff", padding: 1, borderRadius: 3 }}>
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
          🛒 Carrito de Cotización
        </Typography>
      </Box>

      <Paper sx={{ overflowX: "auto", backgroundColor: "#000000ff" }}>
        <Table sx={{ minWidth: 650, borderCollapse: "collapse" }} size="small">
          <TableHead
            sx={{ "& th": {backgroundColor: "#48009aff", fontWeight: "bold", fontSize: "1rem", letterSpacing: "0.05em", border: "1px solid white", color: "white" } }}>
            <TableRow>
              <TableCell>Categoría</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Figura</TableCell>
              <TableCell>Espesor</TableCell>
              <TableCell>Diámetro</TableCell>
              <TableCell>Ancho</TableCell>
              <TableCell>Largo</TableCell>
              <TableCell>Costo Pulg. ²</TableCell>
              <TableCell>Costo Pulg.</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>% Ganancia</TableCell>
              <TableCell>Costo Unitario</TableCell>
              <TableCell>Subtotal</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{ "& td": { border: "1px solid white", fontSize: "0.9rem", letterSpacing: "0.03em", color: "white" } }}>
            {carrito.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.categoria}</TableCell>
                <TableCell>{item.nombre}</TableCell>
                <TableCell>{item.figura}</TableCell>
                <TableCell>{item.espesorFraccion || "-"}</TableCell>
                <TableCell>{item.diametroFraccion || "-"}</TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    value={item.anchoDecimal || ""}
                    onChange={(e) => manejarCambio(item.id, "anchoDecimal", e.target.value)}
                    sx={{ 
                      width: 80, 
                      input: { color: "white" },
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "black",
                        "& fieldset": { borderColor: "white" },
                      },
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    value={item.largoDecimal || ""}
                    onChange={(e) => manejarCambio(item.id, "largoDecimal", e.target.value)}
                    sx={{ 
                      width: 80,
                      "& .MuiOutlinedInput-root":{
                        backgroundColor: "black",
                        "& fieldset": { borderColor: "white" },
                      },
                    }}
                  />
                </TableCell>

                <TableCell sx={{ textAlign: "center" }}>{item.costoPulgadaCuadrada}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>{item.costoPulgadaLineal}</TableCell>

                <TableCell>
                  <TextField
                    type="number"
                    size="small"
                    value={item.cantidad || ""}
                    onChange={(e) => manejarCambio(item.id, "cantidad", e.target.value)}
                    sx={{ 
                      width: 80, 
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "black",
                        "& fieldset": { borderColor: "white" },
                      },
                    }}
                  />
                </TableCell>
                <TableCell
                  sx={{ justifyContent: "center", display: "flex" }}
                >
                  <TextField
                    type="number"
                    size="small"
                    value={item.ganancia || ""}
                    onChange={(e) => manejarCambio(item.id, "ganancia", e.target.value)}
                    sx={{
                      width: 100,
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "black",
                      },
                    }}
                  />
                </TableCell>
                <TableCell
                  sx={{ textAlign: "center" }}
                >
                  ${calcularCostoUnitario(item)}
                </TableCell>
                <TableCell
                  sx={{ textAlign: "center" }}
                >
                  ${calcularSubtotal(item)}
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => eliminarDelCarrito(item.id)}
                      sx={{
                        color: "white",
                        borderColor: "red",
                        fontWeight: "bold",
                        borderRadius: 2,
                        padding: "4px 12px",
                        ":hover": { backgroundColor: "#fc0202ff", borderColor: "#f9f9f9ff" },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, lineHeight: 1}}>
                        <Box
                          component="img"
                          src="/deleteDeathStar.png"
                          alt="Eliminar"
                          sx={{ width: 25, height: 25 }}
                        />
                        <Box component="span">Eliminar</Box>
                      </Box>
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Typography 
        variant="h6"
        sx={{ fontWeight: "bold", color: "#e6dcf0ff", textDecoration: "underline", mb: 1, mt: 7 }}
      >
        Información del Cliente y Términos de la Cotización
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mt: 3, mb: 2 }}>
        <Autocomplete
          freeSolo
          options={clientes}
          getOptionLabel={(option) => option.empresa || ""}
          onChange={(event, value) => {
            if (value) {
              setCliente({...cliente, empresa: value.empresa, id: value.id, nombre: "", telefono: "", email: "" });
              getContactosByCliente(value.id);
            }
          }}  
          sx={{ width: "100%" }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar Cliente"
              fullWidth
              margin="dense"
            />
          )}
        />
        <Autocomplete
          freeSolo
          options={cliente.id ? contactos : []}
          getOptionLabel={(option) => option.nombre || ""}
          onChange={(event, value) => {
            if (value) {
              setCliente({
                ...cliente,
                nombre: value.nombre || "",
                telefono: value.telefono || "",
                email: value.email || "",
              });
            }
          }}
          sx={{ width: "100%" }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar Contacto"
              fullWidth
              margin="dense"
            />
          )}
        />
        <TextField
          label="Teléfono"
          value={cliente.telefono || ""}
          onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
          fullWidth
          margin="dense"
        />
        <TextField
          label="Email"
          value={cliente.email || ""}
          onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
          fullWidth
          margin="dense"
        />
        {/* Tiempo de entrega */}
        <Autocomplete
          freeSolo
          options={opciones}
          value={tiempoEntrega}
          getOptionLabel={(option) =>
            // option puede ser número o string cuando el usuario escribe
            typeof option === "number" ? `${option} días` : String(option)
          }
          onChange={(event, newValue) => {
            // newValue puede ser número (al seleccionar) o string (free text) o null
            const parsed = extractNumber(newValue);
            if (parsed !== null) setTiempoEntrega(parsed);
            // si quieres que al borrar quede vacío:
            else setTiempoEntrega("");
          }}
          onInputChange={(event, newInputValue, reason) => {
            // cuando el usuario escribe; convertimos sólo si hay dígitos
            const parsed = extractNumber(newInputValue);
            if (parsed !== null) setTiempoEntrega(parsed);
            else setTiempoEntrega(""); // o null, según prefieras
          }}
          sx={{ width: "100%" }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tiempo de entrega"
              margin="dense"
              // aquí mantienes tus sx para apariencia
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: "white",
                  backgroundColor: "black",
                  "& fieldset": { borderColor: "white" },
                  "&:hover fieldset": { borderColor: "red" },
                  "&.Mui-focused fieldset": { borderColor: "purple" },
                },
                "& .MuiInputLabel-root": {
                  color: "white",
                  "&.Mui-focused": { color: "white" },
                },
                "& .MuiSvgIcon-root": { color: "white" },
              }}
            />
          )}
        />

        <TextField
          select
          label="Vigencia"
          value={vigencia}
          fullWidth
          margin="dense"
          onChange={(e) => setVigencia(e.target.value)}
          SelectProps={{
            MenuProps: {
              PaperProps: {
                sx: {
                  backgroundColor: 'black',
                  color: 'white',
                  boxShadow: '0px 0px 10px rgba(184, 6, 208, 0.5)',
                }
              },
              MenuListProps: {
                sx: {
                  bgcolor: 'black'
                }
              }
            }
          }}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              color: "white",
              backgroundColor: "black",
              '& fieldset': { borderColor: 'white'},
              '&:hover fieldset': { borderColor: 'red'},
              '&.Mui-focused fieldset': { borderColor: 'purple' },
            },
            '& .MuiInputLabel-root': {
              color: 'white',
              '&.Mui-focused': { color: 'white'}
            },
            '& .MuiSvgIcon-root': {
              color: 'white'
            },
          }}
        >
          {opcionesDiasVigencia.map((dia) => (
            <MenuItem
              key={dia} 
              value={dia}
              sx={{
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
                '&.Mui-selected': { backgroundColor: 'rgba(255, 255, 255, 0.16)' },
                '&.Mui-selected:hover': { backgroundColor: 'rgba(255, 255, 255, 0.24)' },
                '&.Mui-focusVisible': { backgroundColor: 'rgba(255, 255, 255, 0.32)'},
              }}
            >
              {dia} días
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Condiciones de pago"
          value={condicionesPago}
          onChange={(e) => setCondicionesPago(e.target.value)}
          fullWidth
          margin="dense"
          sx={{
             "& .MuiSelect-root": {
              bgcolor: 'black', 
              color: 'white', 
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: 'white'
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: 'gray',
            },
            "& .MuiInputLabel-root": {
              color: 'white',
            },
           }}
           MenuProps={{
             PaperProps: {
              sx: {
                bgcolor: 'black',
                color: 'white',
               },
             },
           }}
        >
          <StyledMenuItem value="Crédito">Crédito</StyledMenuItem>
          <StyledMenuItem value="Contado">Contado</StyledMenuItem>
          <StyledMenuItem value="50% Anticipo">50% Anticipo</StyledMenuItem>
        </TextField>
        <TextField
          select
          label="Moneda"
          value={moneda}
          onChange={(e) => setMoneda(e.target.value)}
          fullWidth
          margin="dense"
          sx={{
             "& .MuiSelect-root": {
              bgcolor: 'black', 
              color: 'white', 
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: 'white'
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: 'gray',
            },
            "& .MuiInputLabel-root": {
              color: 'white',
            },
           }}
           MenuProps={{
             PaperProps: {
              sx: {
                bgcolor: 'black',
                color: 'white',
               },
             },
           }}
        >
          <StyledMenuItem value="MXN">MXN</StyledMenuItem>
          <StyledMenuItem value="USD">USD</StyledMenuItem>
        </TextField>
        <TextField
          label="Comentarios"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          fullWidth
          multiline
          rows={3}
          margin="dense"
          sx={{
            "& .MuiOutlinedInput-root": { color: "white" }
          }}
        />
      </Box>
      <Button
        variant="outlined"
        size="small"
        onClick={generatePDF}
        sx={{
          ml: 215,
          mt: 2,
          mb: 4,
          color: "white",
          border: "2px solid",
          borderColor: "rgba(29, 86, 10, 1)",
          fontWeight: "bold",
          borderRadius: 2,
          padding: "4px 12px",
          gap: 1,
          ":hover": { backgroundColor: "rgba(0, 60, 255, 1)", borderColor: "#f9f9f9ff" },
        }}
      >
        Descargar 
        <PictureAsPdfIcon />
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={guardarCotizacion}
        sx={{
          ml: 215,
          mt: 2,
          mb: 4,
          color: "white",
          border: "2px solid",
          borderColor: "rgba(37, 22, 255, 1)",
          fontWeight: "bold",
          borderRadius: 2,
          padding: "4px 12px",
          gap: 1,
          ":hover": { backgroundColor: "rgba(42, 114, 33, 1)", borderColor: "#f9f9f9ff" },
        }}
      >
        Guardar
        <SaveIcon/>
      </Button>
    </Box>
  );
};

export default Carrito;
