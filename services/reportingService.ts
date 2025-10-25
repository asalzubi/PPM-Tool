import html2canvas from 'html2canvas';
import PptxGenJS from 'pptxgenjs';

interface SlideExport {
    element: HTMLElement | null;
    title?: string;
}

/**
 * Captures an array of HTML elements, adds optional titles, and exports them
 * as separate slides in a PowerPoint (.pptx) file.
 * @param slides An array of slide export objects.
 * @param fileName The desired name for the downloaded presentation file.
 */
export const exportToSlides = async (slides: SlideExport[], fileName: string = 'report.pptx'): Promise<void> => {
    const validSlides = slides.filter((s): s is { element: HTMLElement; title?: string } => s.element !== null);
    if (validSlides.length === 0) {
        alert("No content found to export.");
        return;
    }

    try {
        const pptx = new PptxGenJS();
        
        for (const slideData of validSlides) {
            const canvas = await html2canvas(slideData.element, {
                 useCORS: true,
                 allowTaint: true,
                 scale: 2, // Increase scale for better resolution
                 backgroundColor: '#ffffff' // Ensure transparent backgrounds are white
            });
            const dataUrl = canvas.toDataURL('image/png');

            const slide = pptx.addSlide();

            // Use a primary color for titles, fallback to a default blue
            const titleColor = document.documentElement.style.getPropertyValue('--color-primary').replace('#', '') || '074B79';

            if (slideData.title) {
                slide.addText(slideData.title, { 
                    x: 0.5, 
                    y: 0.25, 
                    w: '90%', 
                    h: 0.5, 
                    fontSize: 24, 
                    bold: true, 
                    color: titleColor
                });
            }
            slide.addImage({
                data: dataUrl,
                x: 0.5,
                y: slideData.title ? 0.85 : 0.5,
                w: '90%',
                h: slideData.title ? '85%' : '90%',
                sizing: { type: 'contain', w: 9, h: 5 }
            });
        }

        await pptx.writeFile({ fileName });

    } catch (error) {
        console.error("Failed to export to slides:", error);
        alert("Error exporting to slides. See console for details.");
    }
};


/**
 * Simulates sending an email with the report content as an image.
 * In a real application, this would capture the element and send the image
 * data to a backend service for emailing.
 * @param element The HTML element of the report to capture.
 * @param recipientEmail The email address of the recipient.
 * @param subject The subject of the email.
 */
export const emailReport = async (element: HTMLElement | null, recipientEmail: string, subject: string = 'Project Portfolio Report'): Promise<void> => {
    if (!element) {
        console.error("Could not find content to email.");
        throw new Error("Report content element not found.");
    }

    console.log('--- SIMULATING EMAIL REPORT ---');
    console.log('Recipient:', recipientEmail);
    console.log('Subject:', subject);
    
    try {
        const canvas = await html2canvas(element, { useCORS: true, allowTaint: true });
        canvas.toDataURL('image/jpeg', 0.9);
        
        console.log('Report image generated. In a real app, this data URL would be sent to a backend email service.');
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log(`Email successfully simulated for ${recipientEmail}.`);

    } catch (error) {
        console.error("Failed to capture report for email:", error);
        throw new Error("Error preparing email report.");
    } finally {
        console.log('--- SIMULATION COMPLETE ---');
    }
};