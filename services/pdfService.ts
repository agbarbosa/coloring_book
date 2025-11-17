
export function generatePdf(coverImage: string, pages: string[], childName: string, theme: string): void {
    if (!window.jspdf || !window.jspdf.jsPDF) {
        console.error("jsPDF not loaded");
        alert("Could not create PDF. The PDF library is not available.");
        return;
    }
    const { jsPDF } = window.jspdf;
    
    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;

    const addImageToPdf = (imageData: string) => {
        pdf.addImage(imageData, 'JPEG', 0, 0, pageWidth, pageHeight);
    };

    // Add cover page
    addImageToPdf(`data:image/jpeg;base64,${coverImage}`);
    
    // Add coloring pages
    pages.forEach(page => {
        pdf.addPage();
        addImageToPdf(`data:image/jpeg;base64,${page}`);
    });

    const sanitizedTheme = theme.replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedName = childName.replace(/[^a-zA-Z0-9]/g, '_');
    pdf.save(`${sanitizedName}_${sanitizedTheme}_coloring_book.pdf`);
}
