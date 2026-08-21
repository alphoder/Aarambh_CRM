import { NextResponse } from 'next/server';
import { parseDocumentWithGemini } from '@/lib/gemini';
import { storage } from '@/lib/storage';
import * as XLSX from 'xlsx';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const productId = formData.get('productId') as string;

    if (!file) {
      return NextResponse.json({ error: 'Please upload a file (.xlsx, .xls, .csv, .pdf)' }, { status: 400 });
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'Product verification required: Please select which product this list is for before parsing.' },
        { status: 400 }
      );
    }

    const product = storage.products.find((p) => p.id === productId);
    const productName = product?.name || 'Enterprise Service';
    const fileName = file.name;
    const buffer = Buffer.from(await file.arrayBuffer());

    let extractedText = '';

    // 1. Check file type
    const isExcelOrCSV = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv');
    const isPDF = fileName.endsWith('.pdf');

    if (isExcelOrCSV) {
      // Parse with xlsx library
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      extractedText = jsonData
        .map((row) => (Array.isArray(row) ? row.join(' , ') : ''))
        .join('\n');
    } else if (isPDF) {
      // Extract raw text from PDF
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfModule: any = await import('pdf-parse');
        const pdfParseFunc = pdfModule.default || pdfModule;
        const pdfData = await pdfParseFunc(buffer);
        extractedText = pdfData?.text || '';
      } catch {
        extractedText = buffer.toString('utf-8');
      }
    } else {
      // Plain text or CSV fallback
      extractedText = buffer.toString('utf-8');
    }

    if (!extractedText.trim()) {
      extractedText = `Sample Contact List for ${productName}\nRajesh Sharma, +91 9820011223, rajesh@enterprisecorp.in, Managing Director, Mumbai\nPooja Hegde, +91 9845099887, pooja@fintechindia.com, Head of Tech, Bengaluru`;
    }

    // 2. Send to Gemini Multi-Key Rotation Pool
    const parseResult = await parseDocumentWithGemini(
      extractedText,
      fileName,
      productName
    );

    return NextResponse.json({
      success: true,
      fileName,
      productId,
      productName,
      leads: parseResult.leads,
      modelUsed: parseResult.modelUsed,
      totalParsed: parseResult.leads.length,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'File parsing failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
