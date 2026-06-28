import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Render a résumé / cover-letter "paper" element directly to a downloaded PDF —
 * no browser print dialog. The element is cloned at natural size (its on-screen
 * preview is scaled down via a transform), captured to a canvas, then sliced
 * across A4 / Letter pages.
 */
export async function downloadElementAsPdf(
  source: HTMLElement,
  filename: string,
  format: 'A4' | 'Letter' = 'A4',
): Promise<void> {
  const pageW = format === 'Letter' ? 816 : 794;

  // Make sure the web fonts are ready so text renders with the right faces.
  try {
    await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
  } catch {
    /* ignore */
  }

  const clone = source.cloneNode(true) as HTMLElement;
  clone.style.transform = 'none';
  clone.style.width = `${pageW}px`;
  clone.style.boxShadow = 'none';
  clone.style.margin = '0';
  clone.style.borderRadius = '0';

  const holder = document.createElement('div');
  holder.style.position = 'fixed';
  holder.style.left = '-10000px';
  holder.style.top = '0';
  holder.style.background = '#ffffff';
  holder.appendChild(clone);
  document.body.appendChild(holder);

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: pageW,
    });

    const pdf = new jsPDF({ unit: 'pt', format: format === 'Letter' ? 'letter' : 'a4', compress: true });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const imgH = (canvas.height * pw) / canvas.width;
    const img = canvas.toDataURL('image/jpeg', 0.95);

    let position = 0;
    let heightLeft = imgH;
    pdf.addImage(img, 'JPEG', 0, position, pw, imgH);
    heightLeft -= ph;
    while (heightLeft > 0) {
      position -= ph;
      pdf.addPage();
      pdf.addImage(img, 'JPEG', 0, position, pw, imgH);
      heightLeft -= ph;
    }

    pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  } finally {
    document.body.removeChild(holder);
  }
}
