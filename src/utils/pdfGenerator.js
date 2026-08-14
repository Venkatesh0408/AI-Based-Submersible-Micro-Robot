import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const generateInspectionReport = (item) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(13, 71, 161);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("Underwater Inspection Report", 105, 20, { align: 'center' });
    
    // Metadata
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Mission Name: ${item.missionName || 'N/A'} (${item.inspectionArea || 'Unknown'})`, 15, 40);
    doc.text(`Date: ${new Date(item.timestamp).toLocaleString()}`, 15, 48);
    doc.text(`Overall Condition: ${item.overallCondition}`, 15, 56);
    doc.text(`AI Accuracy: ${item.accuracy}%`, 15, 64);
    
    // Detections Table
    if (item.detections && item.detections.length > 0) {
        const tableColumn = ["Type", "Severity", "Confidence", "Solution"];
        const tableRows = [];
        
        item.detections.forEach(det => {
            const detData = [
                det.type,
                det.severity,
                det.confidence ? `${det.confidence}%` : 'N/A',
                det.solutionEnglish
            ];
            tableRows.push(detData);
        });
        
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 73,
            theme: 'grid',
            headStyles: { fillColor: [13, 71, 161] }
        });
    } else {
        doc.text("No defects detected during this inspection.", 15, 73);
    }
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Submersible Micro Robot Mission Control - Page ${i}`, 105, 285, { align: 'center' });
    }
    
    doc.save(`Inspection_Report_${new Date(item.timestamp).getTime()}.pdf`);
};
