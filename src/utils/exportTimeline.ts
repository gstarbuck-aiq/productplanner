import { format } from 'date-fns';

/**
 * Deep clone an element and copy all computed styles inline
 */
function cloneWithStyles(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(false) as HTMLElement;

  // Copy all computed styles as inline styles
  const computedStyle = window.getComputedStyle(element);
  for (let i = 0; i < computedStyle.length; i++) {
    const property = computedStyle[i];
    const value = computedStyle.getPropertyValue(property);
    clone.style.setProperty(property, value, computedStyle.getPropertyPriority(property));
  }

  // Clone ALL child nodes (elements and text nodes)
  Array.from(element.childNodes).forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      // Recursively clone element children with styles
      clone.appendChild(cloneWithStyles(node as HTMLElement));
    } else if (node.nodeType === Node.TEXT_NODE) {
      // Clone text nodes directly
      clone.appendChild(node.cloneNode(true));
    }
  });

  return clone;
}

/**
 * Export the timeline using browser's print functionality
 */
export async function exportTimelineAsPNG(
  element: HTMLElement
): Promise<void> {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmmss');
  const title = `Timeline Export - ${timestamp}`;

  // Find the timeline container
  const timelineContainer = element.querySelector('.timeline-container') as HTMLElement;
  if (!timelineContainer) {
    alert('Timeline not found. Please try again.');
    return;
  }

  // Get dimensions
  const timelineGrid = timelineContainer.querySelector('.timeline-grid') as HTMLElement;
  const fullWidth = timelineGrid ? timelineGrid.offsetWidth : 1200;

  // Create new window
  const printWindow = window.open('', '', `width=${Math.min(fullWidth + 100, 1600)},height=900`);
  if (!printWindow) {
    alert('Please allow pop-ups for this site to enable export functionality.');
    return;
  }

  // Clone with all computed styles
  const clone = cloneWithStyles(timelineContainer);

  // Get all stylesheet rules
  let cssText = '';
  try {
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules).forEach(rule => {
          cssText += rule.cssText + '\n';
        });
      } catch (e) {
        console.warn('Could not access stylesheet:', sheet.href);
      }
    });
  } catch (e) {
    console.warn('Error reading stylesheets:', e);
  }

  // Write document
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 20px;
            background: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          }

          ${cssText}

          /* Export overrides */
          .timeline-scroll {
            overflow: visible !important;
          }

          /* Force print colors */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          @media print {
            body { padding: 10px; }
            .instructions { display: none !important; }
            @page {
              size: landscape;
              margin: 10mm;
            }
          }
        </style>
      </head>
      <body>
        ${clone.outerHTML}
        <div class="instructions" style="position: fixed; top: 10px; right: 10px; background: #3b82f6; color: white; padding: 15px 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 99999; font-size: 14px; max-width: 300px;">
          <strong>Export Timeline</strong><br>
          <button onclick="window.print()" style="margin-top: 10px; padding: 8px 16px; background: white; color: #3b82f6; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; width: 100%;">
            Print / Save as PDF
          </button>
          <p style="margin-top: 10px; font-size: 12px; line-height: 1.4;">
            In print dialog, enable:<br>
            <strong>"Background graphics"</strong>
          </p>
          <p style="margin-top: 8px; font-size: 11px; opacity: 0.9;">
            Or screenshot: Win+Shift+S / Cmd+Shift+4
          </p>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
}
