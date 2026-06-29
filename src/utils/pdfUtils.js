import jsPDF from 'jspdf';
import 'jspdf-autotable';
import emailjs from '@emailjs/browser';
import { auth } from '../firebase';

// EmailJS config — set these in your .env file
const EMAILJS_SERVICE_ID  = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY  = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

// ========== PDF GENERATION – Multi‑page with 15 items per page ==========
export const generateOrderPDF = (orderData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const BODY_FONT_SIZE = 11;
  const HEADING_FONT_SIZE = 24;
  const ITEMS_PER_PAGE = 15; // adjust as needed

  // Format date once
  const orderDate = new Date(orderData.orderDate || Date.now());
  const formattedDate = orderDate.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // Helper: draw the gold header + shop name + order ref
  const drawHeader = (pageNumber) => {
    doc.setFillColor(255, 215, 0);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(0, 0, 0);
    doc.setFont('times', 'bold');
    doc.setFontSize(HEADING_FONT_SIZE);
    doc.text('5star Crackers', pageWidth / 2, 20, { align: 'center' });

    doc.setFont('times', 'normal');
    doc.setFontSize(BODY_FONT_SIZE);
    doc.text('Premium Quality Cracker Shells', pageWidth / 2, 32, { align: 'center' });

    if (pageNumber > 1) {
      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      doc.text(`Order #: ${orderData.referenceNumber}`, 20, 50);
      doc.text(`Page ${pageNumber}`, pageWidth - 20, 50, { align: 'right' });
    }
  };

  // Helper: draw order details (only on first page)
  const drawOrderDetails = () => {
    doc.setFont('times', 'bold');
    doc.setFontSize(BODY_FONT_SIZE);
    doc.text('ORDER INVOICE', pageWidth / 2, 50, { align: 'center' });

    doc.setFont('times', 'normal');
    doc.setFontSize(BODY_FONT_SIZE);
    let y = 62;
    const leftX = 20, rightX = 140;

    doc.text(`Order #: ${orderData.referenceNumber}`, leftX, y);
    doc.text(`Date: ${formattedDate}`, rightX, y);
    y += 8;

    doc.text(`Customer: ${orderData.userName || orderData.userEmail}`, leftX, y);
    doc.text(`Email: ${orderData.userEmail}`, rightX, y);
    y += 8;

    doc.setFont('times', 'bold');
    doc.text('Delivery Address:', leftX, y);
    y += 6;
    doc.setFont('times', 'normal');
    doc.text(`${orderData.address}`, leftX, y);
    y += 5;
    if (orderData.landmark) {
      doc.text(`Landmark: ${orderData.landmark}`, leftX, y);
      y += 5;
    }
    doc.text(`${orderData.city}, ${orderData.pincode}`, leftX, y);
    y += 5;
    if (orderData.phone) {
      doc.text(`Phone: ${orderData.phone}`, leftX, y);
    }
    y += 10;
    doc.setFont('times', 'bold');
    doc.text('Order Items:', leftX, y);
    return y + 6; // return startY for the table
  };

  // ===== CHUNK THE ITEMS =====
  const items = orderData.items || [];
  const totalItems = items.length;
  const chunks = [];
  for (let i = 0; i < totalItems; i += ITEMS_PER_PAGE) {
    chunks.push(items.slice(i, i + ITEMS_PER_PAGE));
  }

  // If no items, create an empty chunk to avoid errors
  if (chunks.length === 0) chunks.push([]);

  // ===== RENDER EACH CHUNK ON A NEW PAGE =====
  let pageNum = 1;
  chunks.forEach((chunk, index) => {
    // First page: draw header + order details
    if (index === 0) {
      drawHeader(pageNum);
      const tableStartY = drawOrderDetails();
      renderTable(chunk, tableStartY);
    } else {
      doc.addPage();
      pageNum++;
      drawHeader(pageNum);
      const tableStartY = 55; // after header (45mm header + some margin)
      renderTable(chunk, tableStartY);
    }
  });

  // Helper to render a table for a chunk
  function renderTable(chunk, startY) {
    if (chunk.length === 0) return; // skip empty chunks
    const tableData = chunk.map(item => [
      item.name || 'Item',
      item.quantity || 0,
      `Rs.${item.price || 0}`,
      `Rs.${(item.price || 0) * (item.quantity || 0)}`
    ]);

    doc.autoTable({
      startY: startY,
      head: [['Product', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'grid',
      margin: { left: 20, right: 20, bottom: 20 },
      headStyles: {
        fillColor: [255, 215, 0],
        textColor: [0, 0, 0],
        font: 'times',
        fontStyle: 'bold',
        fontSize: BODY_FONT_SIZE
      },
      bodyStyles: {
        font: 'times',
        fontSize: BODY_FONT_SIZE
      },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' }
      }
    });
  }

  // ===== TOTALS & FOOTER ON THE LAST PAGE =====
  // After all chunks, we are on the last page. We need to place totals after the last table.
  const lastTable = doc.lastAutoTable;
  let finalY = 80;
  if (lastTable) {
    finalY = lastTable.finalY + 8;
  }

  // Totals
  const subtotal = orderData.subtotal || orderData.total - 50;
  const delivery = orderData.deliveryCharge || 50;
  const total = orderData.total;
  const totalX = pageWidth - 20;

  doc.setFont('times', 'normal');
  doc.setFontSize(BODY_FONT_SIZE);
  doc.text(`Subtotal: Rs.${subtotal}`, totalX, finalY, { align: 'right' });
  doc.text(`Delivery Charge: Rs.${delivery}`, totalX, finalY + 7, { align: 'right' });

  doc.setFont('times', 'bold');
  doc.setTextColor(255, 0, 0);
  doc.setFontSize(BODY_FONT_SIZE + 2);
  doc.text(`Total: Rs.${total}`, totalX, finalY + 16, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 18;
  doc.setFont('times', 'normal');
  doc.setFontSize(BODY_FONT_SIZE);
  doc.text('Thanks for shopping at 5star Crackers!', pageWidth / 2, footerY, { align: 'center' });
  doc.text('www.5starcrackers.vercel.app', pageWidth / 2, footerY + 6, { align: 'center' });

  return doc;
};

// ========== PDF DOWNLOAD ==========
export const downloadOrderPDF = (orderData) => {
  const doc = generateOrderPDF(orderData);
  doc.save(`Order_${orderData.referenceNumber || 'invoice'}.pdf`);
};

// ========== EMAIL SENDING ==========
export const generatePDFAndSend = async (orderData) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  // Build HTML items table rows
  const itemsRows = orderData.items
    .map(i => `
      <tr>
        <td style="padding:8px 12px; border-bottom:1px solid #f0e0b0;">${i.name}</td>
        <td style="padding:8px 12px; border-bottom:1px solid #f0e0b0; text-align:center;">${i.quantity}</td>
        <td style="padding:8px 12px; border-bottom:1px solid #f0e0b0; text-align:right;">Rs.${i.price}</td>
        <td style="padding:8px 12px; border-bottom:1px solid #f0e0b0; text-align:right;">Rs.${i.price * i.quantity}</td>
      </tr>`)
    .join('');

  const orderDate = new Date(orderData.orderDate).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // Full HTML email body
  const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: #f5a623; padding: 30px; text-align: center; }
    .header h1 { margin: 0; color: #1a1a1a; font-size: 28px; }
    .header p { margin: 8px 0 0; color: #333; font-size: 14px; }
    .banner { background: #fff8e7; padding: 20px; text-align: center; border-bottom: 2px solid #f5a623; }
    .banner h2 { margin: 0; color: #2d7a2d; font-size: 22px; }
    .banner p { margin: 6px 0 0; color: #555; }
    .content { padding: 24px 30px; }
    .info-table { width: 100%; margin-bottom: 20px; }
    .info-table td { padding: 4px 0; }
    .info-table .label { color: #888; font-size: 13px; }
    .info-table .value { font-weight: bold; font-size: 16px; color: #f5a623; }
    .items-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 12px; }
    .items-table th { background: #f5a623; padding: 10px 12px; text-align: left; color: #1a1a1a; }
    .items-table td { padding: 8px 12px; border-bottom: 1px solid #f0e0b0; }
    .items-table .right { text-align: right; }
    .totals { margin-top: 16px; text-align: right; font-size: 14px; }
    .totals .row { padding: 4px 0; }
    .totals .grand { font-weight: bold; font-size: 18px; color: #e63946; border-top: 2px solid #f5a623; padding-top: 8px; margin-top: 8px; }
    .address-box { background: #f9f9f9; border-left: 4px solid #f5a623; padding: 14px 18px; margin-top: 20px; border-radius: 4px; }
    .address-box h4 { margin: 0 0 6px; color: #333; }
    .address-box p { margin: 0; color: #555; font-size: 14px; line-height: 1.6; }
    .note { background: #e8f5e9; border-radius: 8px; padding: 14px 18px; margin-top: 20px; text-align: center; }
    .note p { margin: 0; color: #2d7a2d; font-size: 13px; }
    .footer { background: #1a1a1a; padding: 20px; text-align: center; }
    .footer p { margin: 0; color: #f5a623; font-size: 13px; }
    .footer .small { color: #888; font-size: 12px; margin-top: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>★ 5star Crackers</h1>
      <p>Premium Quality Cracker Shells</p>
    </div>
    <div class="banner">
      <h2>✔ Order Confirmed!</h2>
      <p>Thank you for your order, <strong>${orderData.userName || user.email}</strong>!</p>
    </div>
    <div class="content">
      <table class="info-table">
        <tr>
          <td class="label">Order Reference</td>
          <td class="label">Order Date</td>
        </tr>
        <tr>
          <td class="value">${orderData.referenceNumber}</td>
          <td class="value">${orderDate}</td>
        </tr>
      </table>
      <h3 style="color:#333; border-bottom:2px solid #f5a623; padding-bottom:8px;">Order Items</h3>
      <table class="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th class="right">Price</th>
            <th class="right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
      <div class="totals">
        <div class="row">Subtotal: Rs.${orderData.subtotal}</div>
        <div class="row">Delivery Charge: Rs.${orderData.deliveryCharge}</div>
        <div class="grand">Total: Rs.${orderData.total}</div>
      </div>
      <div class="address-box">
        <h4>📦 Delivery Address</h4>
        <p>
          ${orderData.address}${orderData.landmark ? ', ' + orderData.landmark : ''}<br/>
          ${orderData.city} - ${orderData.pincode}<br/>
          Phone: ${orderData.phone || 'N/A'}
        </p>
      </div>
      <div class="note">
        <p>📄 Your invoice PDF has been downloaded to your device automatically.</p>
      </div>
    </div>
    <div class="footer">
      <p>Thank you for shopping at 5star Crackers!</p>
      <p class="small">www.5starcrackers.vercel.app</p>
    </div>
  </div>
</body>
</html>
`;

  const templateParams = {
    to_email: user.email,
    to_name: orderData.userName || user.email,
    message: htmlMessage,
  };

  // Always download PDF locally
  downloadOrderPDF(orderData);

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    return { success: true };
  } catch (error) {
    console.error('EmailJS error:', error);
    throw new Error('Invoice PDF downloaded. Confirmation email could not be sent.');
  }
};