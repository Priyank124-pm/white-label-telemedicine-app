import PDFDocument from 'pdfkit';

export interface PrescriptionPdfData {
  prescriptionNo: string;
  date:           string;
  doctorName:     string;
  doctorSpec:     string;
  clinicName:     string;
  patientName:    string;
  patientDob:     string;
  diagnosis:      string;
  items: Array<{
    medicineName: string;
    dosage:       string;
    frequency:    string;
    duration:     string;
    instructions: string;
  }>;
  notes:          string;
  followUpDate:   string;
}

export function generatePrescriptionPdf(data: PrescriptionPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data',  (chunk) => chunks.push(chunk));
    doc.on('end',   () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(data.clinicName, { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text('Medical Prescription', { align: 'center' });
    doc.moveTo(50, doc.y + 8).lineTo(545, doc.y + 8).stroke();
    doc.moveDown(1);

    // Prescription info
    const leftX = 50, rightX = 300;
    doc.fontSize(10).font('Helvetica-Bold').text('Prescription No:', leftX, doc.y, { continued: true });
    doc.font('Helvetica').text(` ${data.prescriptionNo}`);

    doc.fontSize(10).font('Helvetica-Bold').text('Date:', leftX, doc.y, { continued: true });
    doc.font('Helvetica').text(` ${data.date}`);

    doc.moveDown(0.5);

    // Doctor & Patient
    doc.fontSize(11).font('Helvetica-Bold').text('Doctor Information', leftX, doc.y);
    doc.fontSize(10).font('Helvetica').text(`Dr. ${data.doctorName}`, leftX);
    doc.text(data.doctorSpec, leftX);

    const patientY = doc.y - 40;
    doc.fontSize(11).font('Helvetica-Bold').text('Patient Information', rightX, patientY);
    doc.fontSize(10).font('Helvetica').text(data.patientName, rightX);
    doc.text(`DOB: ${data.patientDob}`, rightX);

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    // Diagnosis
    doc.fontSize(11).font('Helvetica-Bold').text('Diagnosis:');
    doc.fontSize(10).font('Helvetica').text(data.diagnosis);
    doc.moveDown(0.5);

    // Medicines
    doc.fontSize(11).font('Helvetica-Bold').text('Rx — Medications:');
    doc.moveDown(0.3);

    data.items.forEach((item, idx) => {
      doc.fontSize(10).font('Helvetica-Bold').text(`${idx + 1}. ${item.medicineName}`);
      doc.fontSize(9).font('Helvetica')
        .text(`   Dosage: ${item.dosage}   |   Frequency: ${item.frequency}   |   Duration: ${item.duration}`)
        .text(`   Instructions: ${item.instructions || 'N/A'}`);
      doc.moveDown(0.3);
    });

    if (data.notes) {
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica-Bold').text('Notes:');
      doc.fontSize(10).font('Helvetica').text(data.notes);
    }

    if (data.followUpDate) {
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica-Bold').text(`Follow-up Date: ${data.followUpDate}`);
    }

    // Signature
    doc.moveDown(3);
    doc.moveTo(350, doc.y).lineTo(545, doc.y).stroke();
    doc.fontSize(9).font('Helvetica').text("Doctor's Signature", 350, doc.y + 5);

    // Footer
    doc.fontSize(8).text(
      'This prescription is computer generated and valid without physical signature.',
      50, 760, { align: 'center', width: 495 }
    );

    doc.end();
  });
}
