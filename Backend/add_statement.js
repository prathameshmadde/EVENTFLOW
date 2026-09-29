const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

const insertIdx = code.lastIndexOf('app.listen');

const newCode = code.slice(0, insertIdx) + `

app.get(
  '/api/bookings/:id/statement',
  requireAuth,
  async (req, res) => {
    try {
      const bookingId = req.params.id;
      const b = await one('SELECT b.*, u.name as customer_name, m.business_name FROM bookings b JOIN users u ON b.customer_id = u.user_id JOIN event_manager_profiles m ON b.manager_id = m.user_id WHERE b.booking_id = ?', [bookingId]);
      if (!b) return res.status(404).json({message: 'Booking not found'});
      if (Number(b.customer_id) !== Number(req.auth.user_id) && Number(b.manager_id) !== Number(req.auth.user_id) && req.auth.role !== 'ADMIN') {
        return res.status(403).json({message: 'Access denied'});
      }
      
      const payments = await query('SELECT * FROM payments WHERE booking_id = ? AND status = \\'COMPLETED\\'', [bookingId]);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', \`attachment; filename=EventFlow_Statement_\${b.booking_id}.pdf\`);

      const doc = new PDFDocument({ margin: 50 });
      doc.pipe(res);

      doc.fontSize(24).font('Helvetica-Bold').text('EventFlow Luxury Marketplace', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Official Account Statement', { align: 'center' }).moveDown(2);

      doc.fontSize(12).text('Booking ID: ' + b.booking_id);
      doc.text('Event: ' + b.event_name);
      doc.text('Customer: ' + b.customer_name);
      doc.text('Producer: ' + b.business_name);
      doc.moveDown();

      doc.font('Helvetica-Bold').fontSize(14).text('Financial Summary');
      doc.font('Helvetica').fontSize(12).text('Total Contract Value: INR ' + Number(b.final_amount).toLocaleString('en-IN'));
      
      const totalPaid = payments.reduce((acc, p) => acc + Number(p.amount), 0);
      doc.text('Total Paid to Escrow: INR ' + totalPaid.toLocaleString('en-IN'));
      doc.text('Remaining Balance: INR ' + Math.max(Number(b.final_amount) - totalPaid, 0).toLocaleString('en-IN'));
      doc.moveDown(2);

      doc.font('Helvetica-Bold').fontSize(14).text('Payment History');
      if (payments.length === 0) {
        doc.font('Helvetica').fontSize(12).text('No payments recorded yet.');
      } else {
        payments.forEach(p => {
            doc.font('Helvetica').fontSize(12).text(\`\${new Date(p.payment_date).toLocaleDateString()} | \${p.transaction_id || p.payment_id} | INR \${Number(p.amount).toLocaleString('en-IN')}\`);
        });
      }
      
      doc.moveDown(4);
      doc.fontSize(10).fillColor('gray').text('This is an automatically generated statement from the EventFlow Escrow Vault.', { align: 'center' });

      doc.end();
    } catch (e) {
      sendError(res, 'Failed to generate statement', e);
    }
  }
);
` + code.slice(insertIdx);

fs.writeFileSync('app.js', newCode);
console.log('Added statement API');

