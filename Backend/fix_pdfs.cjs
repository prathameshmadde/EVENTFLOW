const fs = require('fs');

let c = fs.readFileSync('app.js', 'utf8');

const receiptStart = c.indexOf("app.get('/api/payments/:id/receipt',");
const statementStart = c.indexOf("app.get('/api/bookings/:id/statement',");
// find the end of the statement route, which is right before "app.use('/api', (req, res)"
const endOfStatement = c.indexOf("app.use('/api', (req, res) => res.status(404)");

const before = c.substring(0, receiptStart);
const after = c.substring(endOfStatement);

const newRoutes = `
app.get('/api/payments/:id/receipt', requireAuth, async (req, res) => {
  try {
    const paymentId = req.params.id;
    // Include er.requirement_title
    const p = await one('SELECT p.*, b.event_name, er.requirement_title, u.name as customer_name, m.business_name FROM payments p JOIN bookings b ON p.booking_id = b.booking_id LEFT JOIN proposals pr ON b.proposal_id = pr.proposal_id LEFT JOIN event_requirements er ON pr.requirement_id = er.requirement_id JOIN users u ON b.customer_id = u.user_id JOIN event_manager_profiles m ON b.manager_id = m.manager_id WHERE p.payment_id = ? OR p.transaction_id = ?', [paymentId, paymentId]);
    if (!p) return res.status(404).json({message: 'Payment not found'});
    
    if (Number(p.customer_id) !== Number(req.auth.user_id) && Number(p.manager_id) !== Number(req.auth.user_id) && req.auth.role !== 'ADMIN') {
      return res.status(403).json({message: 'Access denied'});
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', \`attachment; filename="EventFlow_Receipt_\${p.transaction_id || p.payment_id}.pdf"\`);

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    doc.pipe(res);

    // Decorative background header
    doc.rect(0, 0, 595, 140).fill('#0f172a');
    
    // Header text
    doc.fillColor('#ffffff').fontSize(32).font('Helvetica-Bold').text('EventFlow', 50, 45);
    doc.fillColor('#94a3b8').fontSize(11).font('Helvetica').text('The Premium Event Escrow Marketplace', 50, 85);

    doc.fillColor('#10b981').fontSize(22).font('Helvetica-Bold').text('OFFICIAL RECEIPT', 0, 45, { align: 'right', width: 545 });
    doc.fillColor('#cbd5e1').fontSize(11).font('Helvetica').text('Receipt ID: ' + (p.transaction_id || p.payment_id), 0, 75, { align: 'right', width: 545 });
    doc.text('Date: ' + new Date(p.payment_date).toLocaleDateString(), 0, 95, { align: 'right', width: 545 });

    // Customer & Booking info section
    let y = 180;
    doc.rect(50, y, 495, 100).fill('#f8fafc');
    doc.rect(50, y, 495, 100).lineWidth(1).strokeColor('#e2e8f0').stroke();

    doc.fillColor('#64748b').fontSize(10).font('Helvetica-Bold').text('Billed To:', 70, y + 20);
    doc.fillColor('#0f172a').fontSize(14).text(p.customer_name, 70, y + 38);

    doc.fillColor('#64748b').fontSize(10).font('Helvetica-Bold').text('Booking ID:', 260, y + 20);
    doc.fillColor('#0f172a').fontSize(12).text('BK-' + p.booking_id, 260, y + 38);

    doc.fillColor('#64748b').fontSize(10).font('Helvetica-Bold').text('Event Name:', 390, y + 20);
    doc.fillColor('#0f172a').fontSize(12).text((p.requirement_title || p.event_name || 'Event').substring(0, 20), 390, y + 38);

    // Payment block
    y += 140;
    
    doc.rect(50, y, 495, 110).fillOpacity(0.03).fill('#7c3aed');
    doc.rect(50, y, 495, 110).lineWidth(2).strokeColor('#7c3aed').stroke();
    doc.fillOpacity(1); // reset

    doc.fillColor('#7c3aed').fontSize(13).font('Helvetica-Bold').text('Payment Method', 80, y + 25);
    doc.fillColor('#0f172a').fontSize(15).font('Helvetica').text(p.payment_method || 'Escrow / UPI', 80, y + 50);
    doc.fillColor('#10b981').fontSize(12).font('Helvetica-Bold').text('STATUS: ' + p.status, 80, y + 75);

    doc.fillColor('#7c3aed').fontSize(13).font('Helvetica-Bold').text('Amount Paid', 0, y + 25, { align: 'right', width: 515 });
    doc.fillColor('#0f172a').fontSize(32).font('Helvetica-Bold').text('INR ' + Number(p.amount).toLocaleString('en-IN', {minimumFractionDigits: 2}), 0, y + 55, { align: 'right', width: 515 });

    // Footer
    doc.fillColor('#94a3b8').fontSize(10).font('Helvetica').text('This is a digitally generated receipt and does not require a signature.', 50, 750, { align: 'center', width: 495 });
    
    doc.end();
  } catch (err) {
    res.status(500).json({message: 'Server error', error: err.message});
  }
});

app.get('/api/bookings/:id/statement', requireAuth, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const b = await one('SELECT b.*, u.name as customer_name, m.business_name, er.requirement_title FROM bookings b JOIN users u ON b.customer_id = u.user_id JOIN event_manager_profiles m ON b.manager_id = m.manager_id LEFT JOIN proposals p ON b.proposal_id = p.proposal_id LEFT JOIN event_requirements er ON p.requirement_id = er.requirement_id WHERE b.booking_id = ?', [bookingId]);
    if (!b) return res.status(404).json({message: 'Booking not found'});
    
    if (Number(b.customer_id) !== Number(req.auth.user_id) && Number(b.manager_id) !== Number(req.auth.user_id) && req.auth.role !== 'ADMIN') {
      return res.status(403).json({message: 'Access denied'});
    }
    
    const payments = await query('SELECT * FROM payments WHERE booking_id = ? ORDER BY payment_date ASC', [bookingId]);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', \`attachment; filename="EventFlow_Statement_BK\${b.booking_id}.pdf"\`);
    
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    doc.pipe(res);

    // Decorative Header
    doc.rect(0, 0, 595, 140).fill('#0f172a');
    
    doc.fillColor('#ffffff').fontSize(32).font('Helvetica-Bold').text('EventFlow', 50, 45);
    doc.fillColor('#94a3b8').fontSize(11).font('Helvetica').text('The Premium Event Escrow Marketplace', 50, 85);
    
    doc.fillColor('#3b82f6').fontSize(22).font('Helvetica-Bold').text('ACCOUNT STATEMENT', 0, 45, { align: 'right', width: 545 });
    doc.fillColor('#cbd5e1').fontSize(10).font('Helvetica').text('Statement ID: STMT-' + b.booking_id + '-' + Date.now().toString().slice(-4), 0, 75, { align: 'right', width: 545 });
    doc.text('Date Generated: ' + new Date().toLocaleDateString(), 0, 95, { align: 'right', width: 545 });

    let y = 170;
    
    // Beautiful boxes for info
    doc.rect(50, y, 495, 100).fill('#f8fafc');
    doc.rect(50, y, 495, 100).strokeColor('#e2e8f0').lineWidth(1).stroke();

    doc.fillColor('#64748b').fontSize(10).font('Helvetica-Bold').text('Customer Name:', 70, y + 20);
    doc.fillColor('#0f172a').font('Helvetica').fontSize(13).text(b.customer_name || 'Customer', 70, y + 35);
    
    doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(10).text('Event Producer:', 300, y + 20);
    doc.fillColor('#0f172a').font('Helvetica').fontSize(13).text(b.business_name || 'Producer', 300, y + 35);

    doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(10).text('Booking ID:', 70, y + 60);
    doc.fillColor('#0f172a').font('Helvetica').fontSize(12).text('BK-' + b.booking_id, 70, y + 75);

    doc.fillColor('#64748b').font('Helvetica-Bold').fontSize(10).text('Event Name:', 300, y + 60);
    doc.fillColor('#0f172a').font('Helvetica').fontSize(12).text((b.requirement_title || b.event_name || 'Event').substring(0, 30), 300, y + 75);
    
    y += 130;
    
    // Financial Summary Banner
    const finalAmt = Number(b.final_amount) || 0;
    const totalPaid = payments.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS').reduce((acc, p) => acc + Number(p.amount), 0);
    const remaining = Math.max(finalAmt - totalPaid, 0);

    doc.rect(50, y, 495, 90).fillOpacity(0.05).fill('#3b82f6');
    doc.rect(50, y, 495, 90).strokeColor('#3b82f6').lineWidth(2).stroke();
    doc.fillOpacity(1);

    doc.fillColor('#3b82f6').fontSize(11).font('Helvetica-Bold').text('Total Contract Value', 70, y + 20);
    doc.fillColor('#0f172a').fontSize(18).text('INR ' + finalAmt.toLocaleString('en-IN', {minimumFractionDigits: 2}), 70, y + 45);
    
    doc.fillColor('#10b981').fontSize(11).font('Helvetica-Bold').text('Secured in Escrow', 240, y + 20);
    doc.fillColor('#0f172a').fontSize(18).text('INR ' + totalPaid.toLocaleString('en-IN', {minimumFractionDigits: 2}), 240, y + 45);

    doc.fillColor('#ef4444').fontSize(11).font('Helvetica-Bold').text('Remaining Due', 400, y + 20);
    doc.fillColor('#0f172a').fontSize(18).text('INR ' + remaining.toLocaleString('en-IN', {minimumFractionDigits: 2}), 400, y + 45);

    y += 130;
    doc.fillColor('#0f172a').fontSize(16).font('Helvetica-Bold').text('Transaction Ledger', 50, y);
    y += 30;
    
    // Table Header
    doc.rect(50, y, 495, 30).fill('#1e293b');
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');
    doc.text('Date', 60, y + 10);
    doc.text('Transaction ID', 150, y + 10);
    doc.text('Method', 300, y + 10);
    doc.text('Status', 380, y + 10);
    doc.text('Amount (INR)', 450, y + 10);
    
    y += 30;
    
    doc.font('Helvetica').fontSize(10);
    payments.forEach((p, idx) => {
      // Alternating row background
      if (idx % 2 === 0) {
        doc.rect(50, y, 495, 30).fill('#f1f5f9');
      } else {
        doc.rect(50, y, 495, 30).fill('#ffffff');
      }
      
      doc.fillColor('#0f172a');
      doc.text(new Date(p.payment_date).toLocaleDateString(), 60, y + 10);
      doc.text((p.transaction_id || p.payment_id).toString().substring(0, 15), 150, y + 10);
      doc.text(p.payment_method || 'UPI', 300, y + 10);
      
      if (p.status === 'SUCCESS' || p.status === 'COMPLETED') doc.fillColor('#10b981');
      else doc.fillColor('#ef4444');
      doc.text(p.status, 380, y + 10);
      
      doc.fillColor('#0f172a').font('Helvetica-Bold');
      doc.text(Number(p.amount).toLocaleString('en-IN', {minimumFractionDigits: 2}), 450, y + 10);
      doc.font('Helvetica');
      
      y += 30;
      if (y > 700) {
        doc.addPage({ margin: 0 });
        y = 50;
      }
    });

    if (payments.length === 0) {
      doc.rect(50, y, 495, 40).fill('#ffffff');
      doc.fillColor('#64748b').text('No transactions recorded yet.', 50, y + 15, { align: 'center', width: 495 });
    }
    
    doc.fillColor('#94a3b8').fontSize(10).font('Helvetica').text('EventFlow - Secure Escrow for Premium Events.', 50, 750, { align: 'center', width: 495 });
    
    doc.end();
  } catch (err) {
    res.status(500).json({message: 'Server error', error: err.message});
  }
});

`;

fs.writeFileSync('app.js', before + newRoutes + after);
console.log('PDF routes completely overhauled with beautiful design!');

