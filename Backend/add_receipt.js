const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const insertIdx = code.lastIndexOf('app.listen');

const newCode = code.slice(0, insertIdx) + `

const PDFDocument = require('pdfkit');

app.get(
  '/api/payments/:id/receipt',
  requireAuth,
  async (req, res) => {
    try {
      const paymentId = req.params.id;
      const p = await one('SELECT p.*, b.event_name, u.name as customer_name, m.business_name FROM payments p JOIN bookings b ON p.booking_id = b.booking_id JOIN users u ON b.customer_id = u.user_id JOIN event_manager_profiles m ON b.manager_id = m.user_id WHERE p.payment_id = ? OR p.transaction_id = ?', [paymentId, paymentId]);
      if (!p) return res.status(404).json({message: 'Payment not found'});
      if (Number(p.customer_id) !== Number(req.auth.user_id) && Number(p.manager_id) !== Number(req.auth.user_id) && req.auth.role !== 'ADMIN') {
        return res.status(403).json({message: 'Access denied'});
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', \`attachment; filename=EventFlow_Receipt_\${p.transaction_id || p.payment_id}.pdf\`);

      const doc = new PDFDocument({ margin: 50 });
      doc.pipe(res);

      doc.fontSize(24).font('Helvetica-Bold').text('EventFlow Luxury Marketplace', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Official Escrow Payment Receipt', { align: 'center' }).moveDown(2);

      doc.fontSize(12).text('Transaction ID: ' + (p.transaction_id || p.payment_id));
      doc.text('Date: ' + new Date(p.payment_date).toLocaleString());
      doc.text('Status: ' + p.status);
      doc.moveDown();
      
      doc.text('Customer: ' + p.customer_name);
      doc.text('Producer: ' + p.business_name);
      doc.text('Event: ' + p.event_name);
      doc.moveDown();

      doc.font('Helvetica-Bold').fontSize(16).text('Payment Amount: INR ' + Number(p.amount).toLocaleString('en-IN'));
      doc.font('Helvetica').fontSize(12).text('Payment Method: ' + (p.payment_method || 'UPI / Escrow'));
      
      doc.moveDown(4);
      doc.fontSize(10).fillColor('gray').text('This is an automatically generated receipt from the EventFlow Escrow Vault. No signature is required.', { align: 'center' });

      doc.end();
    } catch (e) {
      sendError(res, 'Failed to generate receipt', e);
    }
  }
);
` + code.slice(insertIdx);

fs.writeFileSync('app.js', newCode);
console.log('Added receipt API');

