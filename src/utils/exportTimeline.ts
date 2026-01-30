import { format } from 'date-fns';

/**
 * Export the timeline using browser's print functionality
 * This opens a print dialog where user can save as PDF or print to a printer
 *
 * @param element - The DOM element to capture (timeline container)
 */
export async function exportTimelineAsPNG(
  element: HTMLElement,
  filename?: string
): Promise<void> {
  // Since native canvas export is blocked by CORS, we'll use the browser's print capability
  // User can then use "Save as PDF" or screenshot tools

  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
  const title = `Timeline Export - ${timestamp}`;

  // Create a new window with just the timeline
  const printWindow = window.open('', '', 'width=1200,height=800');

  if (!printWindow) {
    alert('Please allow pop-ups for this site to enable export functionality.');
    return;
  }

  // Clone the timeline element
  const clone = element.cloneNode(true) as HTMLElement;

  // Get all stylesheets
  let styles = '';
  for (let i = 0; i < document.styleSheets.length; i++) {
    try {
      const sheet = document.styleSheets[i];
      if (sheet.cssRules) {
        for (let j = 0; j < sheet.cssRules.length; j++) {
          styles += sheet.cssRules[j].cssText + '\n';
        }
      }
    } catch (e) {
      // Skip stylesheets we can't access
    }
  }

  // Create a complete HTML document
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            padding: 20px;
            background: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          ${styles}

          /* Print-specific styles */
          @media print {
            body {
              padding: 0;
            }
          }

          /* Override any overflow settings for export */
          .timeline-scroll {
            overflow: visible !important;
          }
        </style>
      </head>
      <body>
        ${clone.outerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();

  // Wait for content to load
  setTimeout(() => {
    // Show instructions
    const instructions = printWindow.document.createElement('div');
    instructions.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #3b82f6;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 10000;
      font-size: 14px;
      max-width: 300px;
    `;
    instructions.innerHTML = `
      <strong>Export Options:</strong><br>
      <button onclick="window.print()" style="
        margin-top: 10px;
        padding: 8px 16px;
        background: white;
        color: #3b82f6;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 600;
        width: 100%;
      ">Print / Save as PDF</button>
      <p style="margin-top: 10px; font-size: 12px;">
        Or use screenshot tool (Windows: Win+Shift+S, Mac: Cmd+Shift+4)
      </p>
    `;
    printWindow.document.body.appendChild(instructions);

    // Hide instructions when printing
    const style = printWindow.document.createElement('style');
    style.textContent = '@media print { .instructions { display: none !important; } }';
    instructions.className = 'instructions';
    printWindow.document.head.appendChild(style);
  }, 100);
}
