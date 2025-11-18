import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { FileDown, Mail, FileText, MessageCircle, Copy, Trash2 } from 'lucide-react';

const RecordTable = ({ registros, onEliminar, onExportar }) => {
  if (!registros || registros.length === 0) {
    return null;
  }

  const totalGeneral = registros.reduce((sum, r) => sum + r.totalConIva, 0);

  return (
    <Box sx={{ mt: 6, mb: 4 }}>
      {/* Header con botones de exportación */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#edf2f4',
            fontWeight: 700,
            letterSpacing: '1px',
            textShadow: '0 0 5px rgba(247, 86, 124, 0.5)'
          }}
        >
          📊 Registros de Cotización ({registros.length})
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="Exportar a PDF">
            <Button
              variant="contained"
              size="small"
              onClick={() => onExportar('pdf')}
              sx={{
                backgroundColor: '#bf0603',
                color: 'white',
                boxShadow: '0 0 7px rgba(243, 162, 181, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#fcfcfc',
                  color: 'black',
                  boxShadow: '0 0 20px rgba(247, 86, 124, 0.8)',
                }
              }}
            >
              <FileDown size={16} style={{ marginRight: 4 }} />
              PDF
            </Button>
          </Tooltip>

          <Tooltip title="Exportar a Excel">
            <Button
              variant="contained"
              size="small"
              onClick={() => onExportar('excel')}
              sx={{
                backgroundColor: '#004b23',
                color: 'white',
                boxShadow: '0 0 7px rgba(102, 237, 152, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#22c55e',
                  boxShadow: '0 0 20px rgba(74, 222, 128, 0.8)',
                }
              }}
            >
              <FileText size={16} style={{ marginRight: 4 }} />
              Excel
            </Button>
          </Tooltip>

          <Tooltip title="Enviar por Email">
            <Button
              variant="contained"
              size="small"
              onClick={() => onExportar('email')}
              sx={{
                backgroundColor: '#0077b6',
                color: 'white',
                boxShadow: '0 0 7px rgba(181, 211, 247, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#3b82f6',
                  boxShadow: '0 0 20px rgba(96, 165, 250, 0.8)',
                }
              }}
            >
              <Mail size={16} style={{ marginRight: 4 }} />
              Email
            </Button>
          </Tooltip>

          <Tooltip title="Compartir por WhatsApp">
            <Button
              variant="contained"
              size="small"
              onClick={() => onExportar('whatsapp')}
              sx={{
                backgroundColor: '#006d77',
                color: 'white',
                boxShadow: '0 0 7px rgba(114, 245, 162, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#128C7E',
                  boxShadow: '0 0 20px rgba(37, 211, 102, 0.8)',
                }
              }}
            >
              <MessageCircle size={16} style={{ marginRight: 4 }} />
              WhatsApp
            </Button>
          </Tooltip>

          <Tooltip title="Copiar al portapapeles">
            <Button
              variant="contained"
              size="small"
              onClick={() => onExportar('copiar')}
              sx={{
                backgroundColor: '#5a189a',
                color: 'white',
                boxShadow: '0 0 7px rgba(196, 176, 254, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#8b5cf6',
                  boxShadow: '0 0 20px rgba(167, 139, 250, 0.8)',
                }
              }}
            >
              <Copy size={16} style={{ marginRight: 4 }} />
              Copiar
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Tabla */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          backgroundColor: 'rgba(30, 30, 30, 0.9)',
          border: '1px solid rgba(247, 86, 124, 0.3)',
          boxShadow: '0 0 10px rgba(247, 86, 124, 0.2)',
          borderRadius: 2,
          maxHeight: 600,
          overflow: 'auto'
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: '#020202'
            }}>
              <TableCell sx={{ color: '#fefefeff', fontWeight: 700, backgroundColor: '#020202', fontSize: '1.1rem' }}>
                Material
              </TableCell>
              <TableCell sx={{ color: '#ffffffff', fontWeight: 700, backgroundColor: '#020202', fontSize: '1.1rem' }}>
                Figura
              </TableCell>
              <TableCell align="right" sx={{ color: '#ffffffff', fontWeight: 700, backgroundColor: '#020202', fontSize: '1.1rem' }}>
                Cant.
              </TableCell>
              <TableCell align="right" sx={{ color: '#fdfdfdff', fontWeight: 700, backgroundColor: '#020202', fontSize: '1.1rem' }}>
                Dimensiones
              </TableCell>
              <TableCell align="right" sx={{ color: '#ffffffff', fontWeight: 700, backgroundColor: '#020202', fontSize: '1.1rem' }}>
                Peso (kg)
              </TableCell>
              <TableCell align="right" sx={{ color: '#ffffffff', fontWeight: 700, backgroundColor: '#020202', fontSize: '1.1rem' }}>
                Costo
              </TableCell>
              <TableCell align="right" sx={{ color: '#ffffffff', fontWeight: 700, backgroundColor: '#020202', fontSize: '1.1rem' }}>
                % Gan.
              </TableCell>
              <TableCell align="right" sx={{ color: '#ffffffff', fontWeight: 700, backgroundColor: '#020202', fontSize: '1.1rem' }}>
                P. Venta
              </TableCell>
              <TableCell align="right" sx={{ color: '#ffffffff', fontWeight: 700, backgroundColor: '#020202', fontSize: '1.1rem' }}>
                Subtotal
              </TableCell>
              <TableCell align="right" sx={{ color: '#ffffffff', fontWeight: 700, backgroundColor: '#020202', fontSize: '1.1rem' }}>
                IVA
              </TableCell>
              <TableCell align="right" sx={{ color: '#ffffffff', fontWeight: 700, backgroundColor: '#020202', fontSize: '1.1rem' }}>
                Total
              </TableCell>
              <TableCell align="center" sx={{ color: '#ffffffff', fontWeight: 700, backgroundColor: '#020202', fontSize: '1.1rem' }}>
                Acción
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registros.map((row) => {
              const dimensiones = row.figura === 'Redondo' 
                ? `Ø ${row.diametro} × L ${row.largo}"`
                : `${row.espesor}" × ${row.ancho}" × ${row.largo}"`;

              return (
                <TableRow 
                  key={row.id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <TableCell sx={{ color: 'white', backgroundColor: '#0d2818', fontSize: '1rem' }}>
                    {row.material}
                  </TableCell>
                  <TableCell sx={{ color: 'white', backgroundColor: '#0d2818', fontSize: '1rem' }}>
                    {row.figura}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'white', backgroundColor: '#0d2818', fontSize: '1rem' }}>
                    {row.cantidad}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'white', backgroundColor: '#0d2818', fontSize: '1rem' }}>
                    {dimensiones}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'white', backgroundColor: '#0d2818', fontSize: '1rem' }}>
                    {row.peso.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'white', backgroundColor: '#0d2818', fontSize: '1rem' }}>
                    ${row.costo.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#60a5fa', backgroundColor: '#0d2818', fontSize: '1rem' }}>
                    {row.porcentajeGanancia}%
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#fbbf24', backgroundColor: '#0d2818', fontSize: '1rem' }}>
                    ${row.precioVenta.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'white', backgroundColor: '#0d2818', fontSize: '1rem' }}>
                    ${row.subtotal.toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'white', backgroundColor: '#0d2818', fontSize: '1rem' }}>
                    ${(row.iva || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'white', backgroundColor: '#0d2818', fontSize: '1rem' }}>
                    ${(row.totalConIva || 0).toFixed(2)}
                  </TableCell>
                  <TableCell align="center" sx={{ backgroundColor: '#0d2818'}}>
                    <IconButton 
                      size="small"
                      onClick={() => onEliminar(row.id)}
                      sx={{ 
                        color: '#ef4444',
                        '&:hover': { 
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)'
                        }
                      }}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Fila de Total */}
            <TableRow sx={{ 
              backgroundColor: '#04471c',
              borderTop: '2px solid #f7567c'
            }}>
              <TableCell colSpan={10} sx={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>
                TOTAL GENERAL
              </TableCell>
              <TableCell 
                align="right" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 700, 
                  fontSize: '1.2rem',
                  textShadow: '0 0 10px rgba(74, 222, 128, 0.3)'
                }}
              >
                ${totalGeneral.toFixed(2)}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer info */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
          Última actualización: {new Date().toLocaleString('es-MX')}
        </Typography>
      </Box>
    </Box>
  );
};

export default RecordTable;