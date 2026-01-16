import * as fs from 'fs';
import * as path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export async function generateClientContract(data: {
    clientName: string;
    date: string;
    time: string;
}) {
    // 1️⃣ READ TEMPLATE FROM ASSETS
    const templatePath = path.join(
        process.cwd(),
        'assets',
        'contract-template.docx',
    );

    if (!fs.existsSync(templatePath)) {
        throw new Error('Contract template not found in assets/');
    }

    const content = fs.readFileSync(templatePath, 'binary');

    const zip = new PizZip(content);

    // 🔴 THIS IS THE ONLY REQUIRED CHANGE
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
            start: '[[',
            end: ']]',
        },
    });

    doc.render({
        clientName: data.clientName,
        date: data.date,
        time: data.time,
    });

    const buffer = doc.getZip().generate({
        type: 'nodebuffer',
    });

    // 2️⃣ WRITE GENERATED FILE
    const outputDir = path.join(process.cwd(), 'uploads', 'contracts');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(
        outputDir,
        `contract-${Date.now()}.docx`,
    );

    fs.writeFileSync(outputPath, buffer);

    return outputPath;
}
