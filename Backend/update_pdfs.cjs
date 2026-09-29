const fs = require('fs');

const routes = `
// ==================== RECEIPT PDF ====================
app.get('/api/payments/:id/receipt', requireAuth, async (req, res) => {
  try {
    const paymentId = req.params.id;
    const p = await one('SELECT p.*, b.event_name, b.event_date, b.location, er.requirement_title, u.name as customer_name, m.business_name FROM payments p JOIN bookings b ON p.booking_id = b.booking_id LEFT JOIN proposals pr ON b.proposal_id = pr.proposal_id LEFT JOIN event_requirements er ON pr.requirement_id = er.requirement_id JOIN users u ON b.customer_id = u.user_id JOIN event_manager_profiles m ON b.manager_id = m.manager_id WHERE p.payment_id = ? OR p.transaction_id = ?', [paymentId, paymentId]);
    if (!p) return res.status(404).json({message: 'Payment not found'});
    
    if (Number(p.customer_id) !== Number(req.auth.user_id) && Number(p.manager_id) !== Number(req.auth.user_id) && req.auth.role !== 'ADMIN') {
      return res.status(403).json({message: 'Access denied'});
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', \`attachment; filename="EventFlow_Receipt_\${p.transaction_id || p.payment_id}.pdf"\`);

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    doc.pipe(res);

    // Color Palette
    const navy = '#0F172A';
    const gold = '#D4AF37';
    const textDark = '#1E293B';
    const textMuted = '#64748B';
    const bgLight = '#F8FAFC';
    const bgGreen = '#F0FDF4';
    const bgLavender = '#F8F7FA';

    // Helper to draw Header
    function drawHeader() {
      doc.fillColor(navy);
      doc.polygon([0, 0], [595, 0], [595, 90], [450, 115], [0, 115]).fill();
      
      // Logo abstract leaf
      doc.lineWidth(2).strokeColor(gold);
      doc.path('M 60 75 Q 45 60 60 45 Q 75 60 60 75 Z').stroke();
      doc.path('M 60 85 L 60 75').stroke();
      doc.path('M 55 60 Q 40 45 50 35 Q 60 50 55 60 Z').stroke();
      doc.path('M 65 60 Q 80 45 70 35 Q 60 50 65 60 Z').stroke();

      doc.fillColor('#FFFFFF').fontSize(28).font('Times-Bold').text('EventFlow', 85, 45);
      doc.fillColor(gold).fontSize(8).font('Helvetica').text('PLAN  •  CELEBRATE  •  CHERISH', 87, 75, { characterSpacing: 1 });

      doc.moveTo(370, 45).lineTo(370, 85).lineWidth(1).strokeColor('#334155').stroke();

      doc.fillColor('#E2E8F0').fontSize(8).text('EVENT MANAGEMENT', 390, 45, { characterSpacing: 1 })
         .text('MADE SIMPLE', 390, 57, { characterSpacing: 1 })
         .text('FOR A BRIGHTER', 390, 69, { characterSpacing: 1 })
         .text('TOMORROW', 390, 81, { characterSpacing: 1 });
    }

    // Helper to draw Footer
    function drawFooter() {
      const fy = 740;
      doc.fillColor(navy).rect(0, fy, 595, 102).fill();
      
      doc.fillColor(gold).fontSize(20).font('Times-Bold').text('EventFlow', 50, fy + 30);
      doc.fontSize(8).font('Helvetica').text('PLAN  •  CELEBRATE  •  CHERISH', 52, fy + 55, { characterSpacing: 1 });

      doc.moveTo(300, fy + 35).lineTo(300, fy + 65).lineWidth(1).strokeColor('#334155').stroke();

      doc.fillColor('#E2E8F0').fontSize(8).text('TURNING MOMENTS', 320, fy + 40, { characterSpacing: 1 })
         .text('INTO MEMORIES', 320, fy + 55, { characterSpacing: 1 });
    }

    drawHeader();
    drawFooter();

    // ---------------- BODY ----------------
    let y = 145;
    
    // Title
    doc.fillColor(textMuted).fontSize(8).font('Helvetica-Bold').text('O F F I C I A L   D O C U M E N T', 50, y, { characterSpacing: 2 });
    y += 15;
    doc.fillColor(navy).fontSize(30).font('Times-Bold').text('Payment Receipt', 50, y);
    y += 35;
    doc.fillColor(textDark).fontSize(14).font('Times-Roman').text('Thank you for your payment!', 50, y);
    y += 20;
    doc.fillColor(textMuted).fontSize(11).font('Helvetica').text('We appreciate your trust in EventFlow.', 50, y);

    // Right Info Box
    doc.roundedRect(380, 140, 165, 75, 4).fill(bgLight);
    const ry = 152;
    doc.fillColor(textMuted).fontSize(9).font('Helvetica');
    doc.text('Receipt No.', 395, ry);
    doc.text('Payment Date', 395, ry + 20);
    doc.text('Transaction ID', 395, ry + 40);

    doc.fillColor(textDark).font('Helvetica-Bold');
    doc.text('EF-REC-' + p.payment_id, 470, ry);
    doc.text(new Date(p.payment_date).toLocaleDateString(), 470, ry + 20);
    doc.text((p.transaction_id || p.payment_id).toString().substring(0, 15), 470, ry + 40);

    // Success Banner
    y = 235;
    doc.roundedRect(50, y, 495, 70, 4).fill(bgGreen);
    // Green Check
    doc.circle(90, y + 35, 18).fill('#16A34A');
    doc.moveTo(82, y + 35).lineTo(88, y + 41).lineTo(98, y + 28).lineWidth(3).strokeColor('#FFFFFF').stroke();
    
    doc.fillColor(navy).fontSize(16).font('Times-Bold').text('Payment Successful!', 125, y + 20);
    doc.fillColor(textMuted).fontSize(10).font('Helvetica').text('Your payment has been received and processed successfully.', 125, y + 42);

    doc.moveTo(390, y + 15).lineTo(390, y + 55).lineWidth(1).strokeColor('#BBF7D0').stroke();
    doc.fillColor(navy).fontSize(10).font('Times-Roman').text('Together', 410, y + 18)
       .text('We Create', 410, y + 32)
       .text('Memories', 410, y + 46);
    doc.moveTo(410, y + 60).lineTo(460, y + 60).lineWidth(1).strokeColor(gold).stroke();

    // Details Box
    y = 325;
    doc.roundedRect(50, y, 310, 240, 6).fill(bgLight);
    
    // Icon & Header
    doc.rect(65, y + 15, 16, 16).fill('#CBD5E1'); // tiny icon placeholder
    doc.moveTo(68, y + 19).lineTo(78, y + 19).lineWidth(1).strokeColor(navy).stroke();
    doc.moveTo(68, y + 23).lineTo(78, y + 23).stroke();
    doc.moveTo(68, y + 27).lineTo(74, y + 27).stroke();
    
    doc.fillColor(navy).fontSize(13).font('Times-Bold').text('Payment Details', 90, y + 16);
    
    doc.moveTo(65, y + 40).lineTo(340, y + 40).lineWidth(1).strokeColor('#E2E8F0').stroke();

    const dLabels = ['Customer Name', 'Booking ID', 'Event Name', 'Event Date', 'Event Venue', 'Payment Method', 'Amount Paid', 'Payment Status'];
    const dVals = [
      p.customer_name || 'Customer',
      'BK-' + p.booking_id,
      (p.requirement_title || p.event_name || 'Event').substring(0, 25),
      new Date(p.event_date).toLocaleDateString(),
      (p.location || 'TBD').substring(0, 25),
      p.payment_method || 'UPI',
      'INR ' + Number(p.amount).toLocaleString('en-IN', {minimumFractionDigits:2}),
      'Successful'
    ];

    let rowY = y + 55;
    for(let i = 0; i < dLabels.length; i++) {
      doc.fillColor(textMuted).fontSize(10).font('Helvetica-Bold').text(dLabels[i], 65, rowY);
      doc.text(':', 160, rowY);
      if (dLabels[i] === 'Payment Status') {
        // Pill badge
        doc.roundedRect(175, rowY - 3, 75, 18, 9).fill('#16A34A');
        doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold').text('✔  Successful', 183, rowY + 1);
      } else {
        doc.fillColor(textDark).fontSize(10).font('Helvetica').text(dVals[i], 175, rowY);
      }
      rowY += 22;
    }

    // Quote Box
    doc.roundedRect(380, y, 165, 240, 6).fill(bgLavender);
    doc.fillColor(gold).fontSize(40).font('Times-Bold').text('“', 395, y + 10);
    doc.fillColor(navy).fontSize(18).font('Times-Bold').text('Every', 395, y + 50)
       .text('Celebration', 395, y + 75)
       .text('Tells a Story', 395, y + 100);
    
    doc.fillColor(textMuted).fontSize(10).font('Times-Roman').text('Thank you for', 395, y + 140)
       .text('being a part of', 395, y + 155)
       .text('our journey.', 395, y + 170);

    // Decorative lines in quote box
    doc.path('M 480 200 Q 520 180 540 230 Q 500 240 480 200 Z').lineWidth(1).strokeColor('#E2E8F0').stroke();
    doc.path('M 490 240 Q 530 200 545 280 Q 480 270 490 240 Z').stroke();

    // Footer contact area
    y = 600;
    doc.fillColor(navy).fontSize(34).font('Times-Italic').text('Thank You!', 50, y);
    doc.fontSize(12).font('Helvetica-Bold').text('Team EventFlow', 50, y + 45);
    doc.fillColor(textMuted).fontSize(10).font('Helvetica').text('For trusting us to be part of your special moments.', 50, y + 60);

    // Fake QR
    doc.rect(260, y + 10, 50, 50).lineWidth(1).strokeColor(navy).stroke();
    doc.rect(264, y + 14, 15, 15).fill(navy); doc.rect(268, y + 18, 7, 7).fill('#FFF'); doc.rect(270, y + 20, 3, 3).fill(navy);
    doc.rect(291, y + 14, 15, 15).fill(navy);
    doc.rect(264, y + 41, 15, 15).fill(navy);
    doc.rect(285, y + 35, 21, 21).fill(navy);
    doc.rect(287, y + 37, 17, 17).fill('#FFF');
    doc.rect(290, y + 40, 4, 4).fill(navy); doc.rect(296, y + 46, 6, 6).fill(navy);
    
    doc.fillColor(navy).fontSize(8).font('Helvetica-Bold').text('Scan to visit', 255, y + 70, {width: 60, align: 'center'})
       .text('our website', 255, y + 80, {width: 60, align: 'center'});

    // Contact lines
    const cx = 350;
    doc.circle(cx + 8, y + 16, 6).lineWidth(1).strokeColor(navy).stroke(); // phone icon
    doc.fillColor(textDark).fontSize(10).font('Helvetica').text('+91 98765 43210', cx + 25, y + 12);

    doc.rect(cx + 2, y + 33, 12, 8).stroke(); // mail icon
    doc.moveTo(cx + 2, y + 33).lineTo(cx + 8, y + 37).lineTo(cx + 14, y + 33).stroke();
    doc.text('support@eventflow.com', cx + 25, y + 32);

    doc.circle(cx + 8, y + 56, 6).stroke(); // globe icon
    doc.moveTo(cx + 2, y + 56).lineTo(cx + 14, y + 56).stroke();
    doc.text('www.eventflow.com', cx + 25, y + 52);

    doc.end();
  } catch (err) {
    res.status(500).json({message: 'Server error', error: err.message});
  }
});


// ==================== STATEMENT PDF ====================
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

    // Color Palette
    const navy = '#0F172A';
    const gold = '#D4AF37';
    const textDark = '#1E293B';
    const textMuted = '#64748B';
    const bgLight = '#F8FAFC';
    
    // Helpers
    function drawHeader() {
      doc.fillColor(navy).polygon([0, 0], [595, 0], [595, 90], [450, 115], [0, 115]).fill();
      doc.lineWidth(2).strokeColor(gold);
      doc.path('M 60 75 Q 45 60 60 45 Q 75 60 60 75 Z').stroke();
      doc.path('M 60 85 L 60 75').stroke();
      doc.path('M 55 60 Q 40 45 50 35 Q 60 50 55 60 Z').stroke();
      doc.path('M 65 60 Q 80 45 70 35 Q 60 50 65 60 Z').stroke();

      doc.fillColor('#FFFFFF').fontSize(28).font('Times-Bold').text('EventFlow', 85, 45);
      doc.fillColor(gold).fontSize(8).font('Helvetica').text('PLAN  •  CELEBRATE  •  CHERISH', 87, 75, { characterSpacing: 1 });

      doc.moveTo(370, 45).lineTo(370, 85).lineWidth(1).strokeColor('#334155').stroke();

      doc.fillColor('#E2E8F0').fontSize(8).text('YOUR EVENTS', 390, 45, { characterSpacing: 1 })
         .text('OUR COMMITMENT', 390, 57, { characterSpacing: 1 })
         .text('A HAPPIER TOMORROW', 390, 69, { characterSpacing: 1 });
      doc.moveTo(390, 83).lineTo(440, 83).lineWidth(2).strokeColor(gold).stroke();
    }

    function drawFooter() {
      const fy = 780; // slightly lower for statement to give space
      doc.fillColor(navy).rect(0, fy, 595, 62).fill();
      
      doc.fillColor(gold).fontSize(16).font('Times-Bold').text('EventFlow', 40, fy + 20);
      doc.fontSize(7).font('Helvetica').text('PLAN  •  CELEBRATE  •  CHERISH', 42, fy + 40, { characterSpacing: 1 });
      doc.moveTo(210, fy + 25).lineTo(210, fy + 45).lineWidth(1).strokeColor('#334155').stroke();
      doc.fillColor('#E2E8F0').fontSize(8).text('MEMORIES', 460, fy + 25, { characterSpacing: 1, align:'right', width:100 })
         .text('FOR A LIFETIME', 460, fy + 37, { characterSpacing: 1, align:'right', width:100 });
    }

    drawHeader();
    
    // ---------------- BODY ----------------
    let y = 135;
    
    doc.fillColor(textMuted).fontSize(8).font('Helvetica-Bold').text('O F F I C I A L   D O C U M E N T', 50, y, { characterSpacing: 2 });
    y += 15;
    doc.fillColor(navy).fontSize(30).font('Times-Bold').text('Payment Statement', 50, y);
    y += 35;
    doc.fillColor(textDark).fontSize(14).font('Times-Roman').text('A complete overview of your payments', 50, y);

    // Right Info Box
    doc.roundedRect(400, 130, 145, 60, 4).fill(bgLight);
    doc.fillColor(textMuted).fontSize(9).font('Helvetica');
    doc.text('Statement No.', 410, 142);
    doc.text('Statement Date', 410, 162);
    doc.fillColor(textDark).font('Helvetica-Bold');
    doc.text('EF-STMT-' + b.booking_id, 485, 142);
    doc.text(new Date().toLocaleDateString(), 485, 162);

    // Booking Info & Image
    y = 210;
    doc.roundedRect(40, y, 320, 130, 6).fill(bgLight);
    
    // Icon
    doc.rect(55, y + 15, 14, 14).fill('#CBD5E1'); 
    doc.fillColor(navy).fontSize(12).font('Times-Bold').text('Booking Information', 75, y + 16);
    doc.moveTo(55, y + 36).lineTo(345, y + 36).lineWidth(1).strokeColor('#E2E8F0').stroke();

    const blabels = ['Customer Name', 'Booking ID', 'Event Name', 'Event Date', 'Event Venue', 'Event Manager'];
    const bvals = [
      b.customer_name || 'Customer',
      'BK-' + b.booking_id,
      (b.requirement_title || b.event_name || 'Event').substring(0,25),
      new Date(b.event_date).toLocaleDateString(),
      (b.location || 'TBD').substring(0, 25),
      b.business_name || 'Manager'
    ];
    let rowY = y + 45;
    for(let i=0; i<blabels.length; i++) {
      doc.fillColor(textMuted).fontSize(9).font('Helvetica-Bold').text(blabels[i], 55, rowY);
      doc.text(':', 140, rowY);
      doc.fillColor(textDark).font('Helvetica').text(bvals[i], 150, rowY);
      rowY += 14;
    }

    // Right Image Placeholder
    doc.roundedRect(370, y, 175, 130, 6).fill(navy);
    doc.fillColor('#E2E8F0').fontSize(16).font('Times-Bold').text('MOMENTS', 370, y + 45, {align: 'center', width: 175});
    doc.fillColor(gold).fontSize(8).font('Helvetica-Bold').text('SPECIAL EVENTS', 370, y + 100, {align: 'center', width: 175});
    doc.fillColor('#E2E8F0').text('BRIGHTER PEOPLE', 370, y + 112, {align: 'center', width: 175});

    // Payment Summary
    y = 355;
    doc.roundedRect(40, y, 505, 120, 6).fill('#FFFDF5'); // Light gold
    
    doc.rect(55, y + 15, 14, 14).fill('#E5E7EB');
    doc.fillColor(navy).fontSize(12).font('Times-Bold').text('Payment Summary', 75, y + 16);
    doc.moveTo(55, y + 36).lineTo(525, y + 36).lineWidth(1).strokeColor('#FEF08A').stroke();

    const finalAmt = Number(b.final_amount) || 0;
    const totalPaid = payments.filter(p => p.status === 'COMPLETED' || p.status === 'SUCCESS').reduce((acc, p) => acc + Number(p.amount), 0);
    const remaining = Math.max(finalAmt - totalPaid, 0);
    const pct = finalAmt > 0 ? Math.round((totalPaid / finalAmt) * 100) : 0;
    
    let isFullyPaid = (remaining === 0 && finalAmt > 0);
    let overallStatus = isFullyPaid ? 'Fully Paid' : (totalPaid > 0 ? 'Partially Paid' : 'Unpaid');

    const sLabels = ['Total Contract Value', 'Total Amount Paid', 'Remaining Amount', 'Current Milestone', 'Overall Payment Status'];
    const sVals = [
      'INR ' + finalAmt.toLocaleString('en-IN', {minimumFractionDigits:2}),
      'INR ' + totalPaid.toLocaleString('en-IN', {minimumFractionDigits:2}),
      'INR ' + remaining.toLocaleString('en-IN', {minimumFractionDigits:2}),
      isFullyPaid ? 'Completed' : (totalPaid > 0 ? 'Stage 2 (40%)' : 'Stage 1 (60%)'),
      overallStatus
    ];

    rowY = y + 45;
    for(let i=0; i<sLabels.length; i++) {
      doc.fillColor(textMuted).fontSize(10).font('Helvetica-Bold').text(sLabels[i], 55, rowY);
      doc.text(':', 200, rowY);
      if (sLabels[i] === 'Overall Payment Status') {
        doc.roundedRect(215, rowY - 3, 85, 18, 9).fill(isFullyPaid ? '#16A34A' : '#FEF08A');
        doc.fillColor(isFullyPaid ? '#FFFFFF' : '#854D0E').fontSize(10).font('Helvetica-Bold').text(sVals[i], 215, rowY + 1, {width: 85, align: 'center'});
      } else {
        doc.fillColor(textDark).font('Helvetica').text(sVals[i], 215, rowY);
      }
      rowY += 15;
    }

    // Donut chart
    doc.circle(460, y + 65, 35).lineWidth(8).strokeColor('#E2E8F0').stroke();
    if (pct > 0) {
      const startAngle = -90;
      const endAngle = startAngle + (360 * (pct / 100));
      // path workaround for arcs since .arc is tricky: using simple path or just leave text
      // pdfkit path can draw arcs, but let's just use text in the center
    }
    // we'll just put the text inside a solid circle to mimic the design safely
    doc.circle(460, y + 65, 35).lineWidth(6).strokeColor(isFullyPaid ? '#16A34A' : navy).stroke();
    doc.fillColor(navy).fontSize(16).font('Times-Bold').text(pct + '%', 440, y + 55, {width: 40, align: 'center'});
    doc.fillColor(textMuted).fontSize(10).font('Helvetica').text('Paid', 440, y + 72, {width: 40, align: 'center'});

    // Ledger Table
    y = 490;
    doc.roundedRect(40, y, 505, 35, 6).fill(bgLight);
    doc.rect(55, y + 10, 14, 14).fill('#CBD5E1'); 
    doc.fillColor(navy).fontSize(12).font('Times-Bold').text('Transaction Ledger', 75, y + 11);
    
    y += 45;
    doc.rect(40, y, 505, 25).fill('#F1F5F9');
    doc.fillColor(textMuted).fontSize(8).font('Helvetica-Bold');
    doc.text('#', 50, y + 8);
    doc.text('Transaction ID', 70, y + 8);
    doc.text('Payment Date', 160, y + 8);
    doc.text('Milestone', 240, y + 8);
    doc.text('Payment Method', 310, y + 8);
    doc.text('Amount', 400, y + 8);
    doc.text('Status', 480, y + 8);

    y += 25;
    
    // Rows
    const stage1Amt = finalAmt * 0.60;
    const stage2Amt = finalAmt * 0.40;
    
    // Simulate Stage 1 and Stage 2 based on payments
    let stages = [
      { id: 1, name: 'Stage 1 (60%)', amount: stage1Amt, p: payments[0] },
      { id: 2, name: 'Stage 2 (40%)', amount: stage2Amt, p: payments[1] }
    ];

    stages.forEach((stg) => {
      doc.rect(40, y, 505, 30).fill('#FFFFFF');
      doc.moveTo(40, y+30).lineTo(545, y+30).lineWidth(1).strokeColor('#F1F5F9').stroke();
      
      doc.fillColor(textDark).fontSize(9).font('Helvetica');
      doc.text(stg.id.toString(), 50, y + 10);
      
      if (stg.p && (stg.p.status === 'SUCCESS' || stg.p.status === 'COMPLETED')) {
        doc.text((stg.p.transaction_id || stg.p.payment_id).toString().substring(0, 15), 70, y + 10);
        doc.text(new Date(stg.p.payment_date).toLocaleDateString(), 160, y + 10);
        doc.text(stg.name, 240, y + 10);
        doc.text(stg.p.payment_method || 'UPI', 310, y + 10);
        doc.text('INR ' + Number(stg.p.amount).toLocaleString('en-IN'), 400, y + 10);
        
        doc.roundedRect(475, y + 6, 60, 16, 8).fill('#16A34A');
        doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold').text('✔ Paid', 475, y + 10, {width: 60, align: 'center'});
      } else {
        doc.text('-', 70, y + 10);
        doc.text('-', 160, y + 10);
        doc.text(stg.name, 240, y + 10);
        doc.text('-', 310, y + 10);
        doc.text('INR ' + Number(stg.amount).toLocaleString('en-IN'), 400, y + 10);
        
        doc.roundedRect(475, y + 6, 60, 16, 8).fill('#FEF08A');
        doc.fillColor('#854D0E').fontSize(8).font('Helvetica-Bold').text('Pending', 475, y + 10, {width: 60, align: 'center'});
      }
      y += 30;
    });

    // Notes Box & Totals
    y += 15;
    doc.roundedRect(40, y, 320, 60, 4).fill(bgLight);
    doc.fillColor(navy).fontSize(9).font('Helvetica-Bold').text('Note:', 50, y + 10);
    doc.fillColor(textMuted).fontSize(8).font('Helvetica').text('1. This statement includes all successful payments made for this booking.', 50, y + 25);
    doc.text('2. Refunds, if any, will be shown separately.', 50, y + 35);
    doc.text('3. For any queries, contact our support team.', 50, y + 45);

    doc.fillColor(textMuted).fontSize(10).font('Helvetica-Bold').text('Total Paid', 390, y + 15);
    doc.text('Total Remaining', 390, y + 30);
    doc.text('Refunds (if any)', 390, y + 45);
    
    doc.fillColor(navy).font('Helvetica-Bold');
    doc.text(':   INR ' + totalPaid.toLocaleString('en-IN', {minimumFractionDigits: 2}), 470, y + 15);
    doc.text(':   INR ' + remaining.toLocaleString('en-IN', {minimumFractionDigits: 2}), 470, y + 30);
    doc.text(':   INR 0.00', 470, y + 45);

    drawFooter();
    
    doc.end();
  } catch (err) {
    res.status(500).json({message: 'Server error', error: err.message});
  }
});
`;

let appjs = fs.readFileSync('app.js', 'utf8');

const receiptStart = appjs.indexOf("app.get('/api/payments/:id/receipt',");
const statementStart = appjs.indexOf("app.get('/api/bookings/:id/statement',");
// We find the next route or middleware after statement
const endOfStatement = appjs.indexOf("app.use('/api', (req, res)", statementStart);

const before = appjs.substring(0, receiptStart);
const after = appjs.substring(endOfStatement);

fs.writeFileSync('app.js', before + routes + "\n\n" + after);
console.log('PDF templates updated to match premium design.');

