import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../Components/CabinetSelectionForm.css";

// ✅ Put your email here (also set it in the server snippet below)
const PRESELECTED_EMAIL = "you@example.com";

export default function CabinetSelectionForm() {
  const formRef = useRef(null);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    try {
      // 1) Render DOM to canvas, convert to a single-page A4 PDF
      const node = formRef.current;
      const canvas = await html2canvas(node, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Fit image to page with aspect ratio preserved
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let y = 0;
      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        // If content is taller than one page, split across pages
        let remainingHeight = imgHeight;
        let position = 0;
        while (remainingHeight > 0) {
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          remainingHeight -= pageHeight;
          if (remainingHeight > 0) {
            pdf.addPage();
            position -= pageHeight;
          }
        }
      }

      // 2) Send PDF to backend to email it as an attachment
      const pdfBlob = pdf.output("blob");
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const base64PDF = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const res = await fetch("/api/send-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: PRESELECTED_EMAIL,
          filename: "Cabinet_Selection_Form.pdf",
          filedata_base64: base64PDF,
        }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to send email");
      }

      alert("Form PDF emailed successfully!");
    } catch (err) {
      console.error(err);
      alert("Email failed. You can use the mailto fallback (no attachment).");
      // Optional quick fallback (no attachment, just body text):
      // window.location.href = makeMailtoFallback(PRESELECTED_EMAIL, nodeToText());
    } finally {
      setSending(false);
    }
  }

  // Optional helper for a mailto fallback (no attachment)
  function makeMailtoFallback(to, body) {
    const subject = encodeURIComponent("Cabinet Selection Form");
    const encodedBody = encodeURIComponent(body);
    return `mailto:${to}?subject=${subject}&body=${encodedBody}`;
  }

  // If you want to dump field values into the fallback email body:
  function nodeToText() {
    const fd = new FormData(document.getElementById("cabinet-form"));
    const lines = [];
    for (const [k, v] of fd.entries()) lines.push(`${k}: ${v}`);
    return lines.join("\n");
  }

  return (
    <div className="csf-page">
      <form id="cabinet-form" onSubmit={handleSubmit}>
        <div className="csf-paper" ref={formRef}>
          {/* Header */}
          <header className="csf-header">
            <div className="csf-title">SHOWER DESIGN</div>
            <div className="csf-form-id">Form D.8</div>
          </header>

          {/* Client / Room */}
          <section className="csf-row">
            <div className="csf-field">
              <label>Client Name:</label>
              <input name="clientName" type="text" />
            </div>
            <div className="csf-field">
              <label>Room:</label>
              <input name="room" type="text" />
            </div>
          </section>

          {/* Signatures (top) */}
          <section className="csf-row csf-two-col">
            <div className="csf-signature-block">
              <div className="csf-signature-line">
                <span>Client Signature:</span>
                <input name="clientSignatureTop" type="text" className="csf-line-input" />
              </div>
              <div className="csf-date-line">
                <span>Date:</span>
                <input name="clientDateTop" type="date" />
              </div>
            </div>
            <div className="csf-signature-block">
              <div className="csf-signature-line">
                <span>Designer Signature:</span>
                <input name="designerSignatureTop" type="text" className="csf-line-input" />
              </div>
              <div className="csf-date-line">
                <span>Date:</span>
                <input name="designerDateTop" type="date" />
              </div>
            </div>
          </section>

          {/* Bathroom Checklist */}
          <section className="csf-section">
            <h3>Bathroom Checklist:</h3>
            <div className="csf-grid-2">
              <label>Tile:<input name="tile" type="text" /></label>
              <label>Tile Layout:<input name="tileLayout" type="text" /></label>
              <label>Grout:<input name="grout" type="text" /></label>
              <label>Grout Color:<input name="groutColor" type="text" /></label>
              <label>Trim:<input name="trim" type="text" /></label>
              <label>Glass Trim Color:<input name="glassTrimColor" type="text" /></label>
              <label>Plumbing Fixtures:<input name="plumbingFixtures" type="text" /></label>
              <label>Drain Type:<input name="drainType" type="text" /></label>
              <label>Drain Location:<input name="drainLocation" type="text" /></label>
              <label>Fan:<input name="fan" type="text" /></label>
              <label>Poem Size?:<input name="poemSize" type="text" /></label>
            </div>
            <label className="csf-notes">
              Notes:
              <textarea name="bathNotes" rows={3} />
            </label>
          </section>

          {/* Finish One */}
          <section className="csf-section">
            <h3>FINISH ONE:</h3>
            <div className="csf-grid-2">
              <label>Location:<input name="finish1Location" type="text" /></label>
              <label>Wood Species / Veneers:<input name="finish1Species" type="text" /></label>
              <label>Color:<input name="finish1Color" type="text" /></label>
              <label>Edge Banding Color:<input name="finish1EdgeBanding" type="text" /></label>
              <label>Custom Finishing:<input name="finish1Custom" type="text" /></label>
            </div>
            <label className="csf-notes">
              Notes:
              <textarea name="finish1Notes" rows={3} />
            </label>
            <p className="csf-small-note">
              *No guarantee on accenting, distressing, and/or glazing consistency from door to door.
            </p>
          </section>

          {/* Finish Two */}
          <section className="csf-section">
            <h3>FINISH TWO:</h3>
            <div className="csf-grid-2">
              <label>Location:<input name="finish2Location" type="text" /></label>
              <label>Wood Species / Veneers:<input name="finish2Species" type="text" /></label>
              <label>Color:<input name="finish2Color" type="text" /></label>
              <label>Custom Finishing:<input name="finish2Custom" type="text" /></label>
            </div>
            <label className="csf-notes">
              Notes:
              <textarea name="finish2Notes" rows={3} />
            </label>
            <p className="csf-small-note">
              *No guarantee on accenting, distressing, and/or glazing consistency from door to door.
            </p>
          </section>

          {/* Cabinet Customizations */}
          <section className="csf-section">
            <h3>CABINET CUSTOMIZATIONS:</h3>
            <div className="csf-customization">
              <div>
                <label><input type="checkbox" name="crownMolding" /> Crown Molding</label>
              </div>
              <label className="csf-notes-line">
                Notes: <input name="crownMoldingNotes" type="text" />
              </label>
            </div>
            <div className="csf-customization">
              <div>
                <label><input type="checkbox" name="shoeMolding" /> Shoe Molding</label>
              </div>
              <label className="csf-notes-line">
                Notes: <input name="shoeMoldingNotes" type="text" />
              </label>
            </div>
            <div className="csf-customization">
              <div>
                <label><input type="checkbox" name="woodHood" /> Wood Hood</label>
              </div>
              <label className="csf-notes-line">
                Notes: <input name="woodHoodNotes" type="text" />
              </label>
            </div>
            <div className="csf-customization">
              <div>
                <label><input type="checkbox" name="lightRail" /> Light Rail</label>
              </div>
              <label className="csf-notes-line">
                Notes: <input name="lightRailNotes" type="text" />
              </label>
            </div>
          </section>

          {/* Glass Cabinets */}
          <section className="csf-section">
            <h3>GLASS CABINETS:</h3>
            <div className="csf-grid-2">
              <label>Glass <input name="glassType" type="text" /></label>
              <label>Shelving <input name="shelving" type="text" /></label>
              <label>Interior <input name="interior" type="text" /></label>
              <label>Light Type <input name="glassLightType" type="text" /></label>
            </div>
            <label className="csf-notes">
              Notes:
              <textarea name="glassNotes" rows={3} />
            </label>
            <label className="csf-inline">
              <input type="checkbox" name="glassIncluded" /> Included
            </label>
          </section>

          {/* Accessories */}
          <section className="csf-section">
            <h3>ACCESSORIES:</h3>
            <div className="csf-grid-2">
              <label>Corbel <input name="corbel" type="text" /></label>
              <label>Floating Shelves Light Type <input name="floatingShelvesLightType" type="text" /></label>
            </div>
            <div className="csf-included-list">
              <label><input type="checkbox" name="accIncluded1" /> Included</label>
              <label><input type="checkbox" name="accIncluded2" /> Included</label>
              <label><input type="checkbox" name="accIncluded3" /> Included</label>
              <label><input type="checkbox" name="accIncluded4" /> Included</label>
              <label><input type="checkbox" name="accIncluded5" /> Included</label>
            </div>
          </section>

          {/* CH / P-L Orientation */}
          <section className="csf-section">
            <div className="csf-inline-wrap">
              <span>CH / P/L Orientation:</span>
              <label className="csf-inline"><input type="radio" name="orientation" value="Vertical" /> Vertical</label>
              <label className="csf-inline"><input type="radio" name="orientation" value="Horizontal" /> Horizontal</label>
            </div>
            <div className="csf-inline-wrap">
              <span>CH / P/L:</span>
              <label className="csf-inline"><input type="checkbox" name="chpl1" /> CH</label>
              <label className="csf-inline"><input type="checkbox" name="chpl2" /> P/L</label>
            </div>
          </section>

          {/* Final Signatures */}
          <section className="csf-row csf-two-col">
            <div className="csf-signature-block">
              <div className="csf-signature-line">
                <span>Client Signature:</span>
                <input name="clientSignatureBottom" type="text" className="csf-line-input" />
              </div>
              <div className="csf-date-line">
                <span>Date:</span>
                <input name="clientDateBottom" type="date" />
              </div>
            </div>
            <div className="csf-signature-block">
              <div className="csf-signature-line">
                <span>Designer Signature:</span>
                <input name="designerSignatureBottom" type="text" className="csf-line-input" />
              </div>
              <div className="csf-date-line">
                <span>Date:</span>
                <input name="designerDateBottom" type="date" />
              </div>
            </div>
          </section>
        </div>

        <div className="csf-actions">
          <button className="csf-submit" type="submit" disabled={sending}>
            {sending ? "Submitting…" : "Submit & Email PDF"}
          </button>

          {/* Optional: Quick mode without attachment */}
          {/* <button type="button" onClick={() => window.location.href = makeMailtoFallback(PRESELECTED_EMAIL, nodeToText())}>
            Quick Email (no attachment)
          </button> */}
        </div>
      </form>
    </div>
  );
}
