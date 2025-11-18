import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// ============================================
// FUNCIÓN PARA EXPORTAR A PDF
// ============================================
export const exportarPDF = (registros, nombreEmpresa = "HIKS") => {
  try {
    const doc = new jsPDF();
    
    // Configurar fuente y título
    doc.setFontSize(18);
    doc.setTextColor(247, 86, 124);
    doc.text('Cotizacion', 14, 20);
    
    // Información adicional
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Empresa: ${nombreEmpresa}`, 14, 30);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 14, 36);
    doc.text(`Total de registros: ${registros.length}`, 14, 42);
    
    // Preparar datos para la tabla
    const tableData = registros.map(row => {
      const dimensiones = row.figura === 'Redondo' 
        ? `Ø${row.diametro || 0} x L${row.largo || 0}`
        : `${row.espesor || 0} x ${row.ancho || 0} x ${row.largo || 0}`;
      
      return [
        row.material || '-',
        row.figura || '-',
        (row.cantidad || 0).toString(),
        dimensiones,
        `${(row.peso || 0).toFixed(2)} kg`,
        `$${(row.precioVenta || 0).toFixed(2)}`,
        `$${(row.subtotal || 0).toFixed(2)}`,
        `$${(row.iva || 0).toFixed(2)}`,
        
      ];
    });
    
    // Calcular total
    const totalGeneral = registros.reduce((sum, r) => sum + (r.totalConIva || 0), 0);
    
    // Crear tabla con autoTable
    autoTable(doc, {
      startY: 50,
      head: [['Material', 'Figura', 'Cant.', 'Dimensiones', 'Peso', 'Precio', 'Subtotal', 'IVA']],
      body: tableData,
      foot: [['', '', '', '', '', 'TOTAL:', `$${totalGeneral.toFixed(2)}`]],
      theme: 'striped',
      headStyles: { 
        fillColor: [247, 86, 124],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      footStyles: {
        fillColor: [247, 86, 124],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 11
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        2: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right', fontStyle: 'bold' }
      },
      margin: { top: 50 }
    });
    
    // Guardar PDF
    const filename = `cotizacion_${new Date().getTime()}.pdf`;
    doc.save(filename);
    
    console.log('PDF generado exitosamente:', filename);
    alert('✅ PDF generado correctamente');
    return filename;
    
  } catch (error) {
    console.error('Error al generar PDF:', error);
    alert('❌ Error al generar el PDF: ' + error.message);
    return null;
  }
};

// ============================================
// FUNCIÓN PARA EXPORTAR A EXCEL
// ============================================
export const exportarExcel = (registros, nombreHoja = "Cotizacion") => {
  try {
    const datosExcel = registros.map(row => {
      const dimensiones = row.figura === 'Redondo' 
        ? `Ø${row.diametro || 0} × L${row.largo || 0}`
        : `${row.espesor || 0} × ${row.ancho || 0} × ${row.largo || 0}`;
      
      return {
        'Material': row.material || '-',
        'Figura': row.figura || '-',
        'Cantidad': row.cantidad || 0,
        'Dimensiones': dimensiones,
        'Peso (kg)': (row.peso || 0).toFixed(2),
        'Precio': (row.precioVenta || 0).toFixed(2),
        'Subtotal': (row.subtotal || 0).toFixed(2),
        'IVA': (row.iva || 0).toFixed(2)
      };
    });
    
    // Agregar fila de total
    const totalGeneral = registros.reduce((sum, r) => sum + (r.totalConIva || 0), 0);
    datosExcel.push({
      'Material': '',
      'Figura': '',
      'Cantidad': '',
      'Dimensiones': '',
      'Peso (kg)': '',
      'Precio': 'TOTAL:',
      'Subtotal': totalGeneral.toFixed(2),
      'IVA': ''
    });
    
    // Crear hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(datosExcel);
    
    // Ajustar ancho de columnas
    const wscols = [
      { wch: 30 }, // Material
      { wch: 15 }, // Figura
      { wch: 10 }, // Cantidad
      { wch: 25 }, // Dimensiones
      { wch: 12 }, // Peso
      { wch: 12 }, // Precio
      { wch: 12 }, // Subtotal
      { wch: 12 }  // IVA
    ];
    ws['!cols'] = wscols;
    
    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
    
    // Guardar archivo
    const filename = `cotizacion_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    alert('✅ Excel generado correctamente');
    return filename;
    
  } catch (error) {
    console.error('Error al generar Excel:', error);
    alert('❌ Error al generar el Excel: ' + error.message);
    return null;
  }
};

// ============================================
// FUNCIÓN PARA ENVIAR POR EMAIL
// ============================================
export const enviarPorEmail = (registros) => {
  try {
    const totalGeneral = registros.reduce((sum, r) => sum + (r.totalConIva || 0), 0);
    
    let cuerpoEmail = `Cotización\n`;
    cuerpoEmail += `Fecha: ${new Date().toLocaleDateString('es-MX')}\n`;
    cuerpoEmail += `Total de registros: ${registros.length}\n\n`;
    cuerpoEmail += `${'='.repeat(70)}\n\n`;
    
    registros.forEach((row, index) => {
      const dimensiones = row.figura === 'Redondo' 
        ? `Ø ${row.diametro || 0}" × L ${row.largo || 0}"`
        : `${row.espesor || 0}" × ${row.ancho || 0}" × ${row.largo || 0}"`;
      
      cuerpoEmail += `${index + 1}. ${row.material || '-'} - ${row.figura || '-'}\n`;
      cuerpoEmail += `   Cantidad: ${row.cantidad || 0}\n`;
      cuerpoEmail += `   Dimensiones: ${dimensiones}\n`;
      cuerpoEmail += `   Peso: ${(row.peso || 0).toFixed(2)} kg\n`;
      cuerpoEmail += `   Precio: $${(row.precioVenta || 0).toFixed(2)}\n`;
      cuerpoEmail += `   Subtotal: $${(row.subtotal || 0).toFixed(2)}\n\n`;
      cuerpoEmail += `   IVA: $${(row.iva || 0).toFixed(2)}\n\n`;
    });
    
    cuerpoEmail += `${'='.repeat(70)}\n`;
    cuerpoEmail += `TOTAL GENERAL: $${totalGeneral.toFixed(2)}\n`;
    
    const asunto = `Cotización - ${new Date().toLocaleDateString('es-MX')}`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpoEmail)}`;
    
    window.location.href = mailtoLink;
    
    return mailtoLink;
    
  } catch (error) {
    console.error('Error al enviar email:', error);
    alert('❌ Error al preparar el email: ' + error.message);
    return null;
  }
};

// ============================================
// FUNCIÓN PARA COMPARTIR POR WHATSAPP
// (Abre WhatsApp para que selecciones el contacto)
// ============================================
export const compartirWhatsApp = (registros) => {
  try {
    const totalGeneral = registros.reduce((sum, r) => sum + (r.totalConIva || 0), 0);
    
    let mensaje = `*Cotización*\n`;
    mensaje += `Fecha: ${new Date().toLocaleDateString('es-MX')}\n`;
    mensaje += `Total: ${registros.length} item(s)\n\n`;
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    registros.forEach((row, index) => {
      const dimensiones = row.figura === 'Redondo' 
        ? `Ø ${row.diametro || 0}" × L ${row.largo || 0}"`
        : `${row.espesor || 0}" × ${row.ancho || 0}" × ${row.largo || 0}"`;
      
      mensaje += `*${index + 1}. ${row.material || '-'}*\n`;
      mensaje += `Fig: ${row.figura || '-'}\n`;
      mensaje += `Cant: ${row.cantidad || 0}\n`;
      mensaje += `Dim: ${dimensiones}\n`;
      mensaje += `Peso: ${(row.peso || 0).toFixed(2)} kg\n`;
      mensaje += `Precio: $${(row.precioVenta || 0).toFixed(2)}\n`;
      mensaje += `Subtotal: $${(row.subtotal || 0).toFixed(2)}\n\n`;
      mensaje += `IVA: $${(row.iva || 0).toFixed(2)}\n\n`;
    });
    
    mensaje += `━━━━━━━━━━━━━━━━━━━━\n`;
    mensaje += `*TOTAL: $${totalGeneral.toFixed(2)}*\n\n`;
    mensaje += `Cotización generada por HIKS`;
    
    // Abrir WhatsApp sin número específico para que el usuario seleccione el contacto
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    
    window.open(whatsappLink, '_blank');
    
    return whatsappLink;
    
  } catch (error) {
    console.error('Error al compartir por WhatsApp:', error);
    alert('❌ Error al preparar WhatsApp: ' + error.message);
    return null;
  }
};

// ============================================
// FUNCIÓN PARA COPIAR DATOS AL PORTAPAPELES
// ============================================
export const copiarAlPortapapeles = (registros) => {
  try {
    const totalGeneral = registros.reduce((sum, r) => sum + (r.totalConIva || 0), 0);
    
    let texto = `Cotización\n`;
    texto += `Fecha: ${new Date().toLocaleDateString('es-MX')}\n`;
    texto += `Total de registros: ${registros.length}\n\n`;
    texto += `${'='.repeat(60)}\n\n`;
    
    registros.forEach((row, index) => {
      const dimensiones = row.figura === 'Redondo' 
        ? `Ø ${row.diametro || 0} × L ${row.largo || 0}"`
        : `${row.espesor || 0}" × ${row.ancho || 0}" × ${row.largo || 0}"`;
      
      texto += `${index + 1}. ${row.material || '-'} - ${row.figura || '-'}\n`;
      texto += `   Cantidad: ${row.cantidad || 0}\n`;
      texto += `   Dimensiones: ${dimensiones}\n`;
      texto += `   Peso: ${(row.peso || 0).toFixed(2)} kg\n`;
      texto += `   Precio: $${(row.precioVenta || 0).toFixed(2)}\n`;
      texto += `   Subtotal: $${(row.subtotal || 0).toFixed(2)}\n\n`;
      texto += `   IVA: $${(row.iva || 0).toFixed(2)}\n\n`;
    });
    
    texto += `${'='.repeat(60)}\n`;
    texto += `TOTAL GENERAL: $${totalGeneral.toFixed(2)}`;
    
    navigator.clipboard.writeText(texto)
      .then(() => {
        alert('✅ Datos copiados al portapapeles');
      })
      .catch(err => {
        console.error('Error al copiar:', err);
        alert('❌ Error al copiar al portapapeles');
      });
      
  } catch (error) {
    console.error('Error al copiar:', error);
    alert('❌ Error al copiar: ' + error.message);
  }
};