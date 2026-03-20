import type { ResumeData, ResumeStyles, CoverLetter } from "@/context/resume-context";
import { defaultStyles } from "@/context/resume-context";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function exportResumePdf(resume: ResumeData, coverLetter?: CoverLetter | null) {
  const s: Required<ResumeStyles> = { ...defaultStyles, ...(resume.styles || {}) } as Required<ResumeStyles>;
  const basePx = s.fontSize || 12;
  const headingColor = s.headingColor || "#005149";
  const textColor = s.textColor || "#1c1917";
  const accentColor = s.accentColor || "#005149";
  const lineHeight = s.lineHeight || 1.5;
  const sectionGap = s.sectionSpacing || 20;
  const borderStyle = s.borderStyle || "solid";
  const fontFamily = `${s.fontFamily || "Inter"}, sans-serif`;
  const headerAlign = s.headerAlign || "left";
  const nameSize = s.nameSize || 1.67;
  const headingMult = s.headingSize || 1.0;
  const headingStyle = s.headingStyle || "uppercase";
  const marginsX = s.marginsX || s.margins || 32;
  const marginsY = s.marginsY || 28;
  const dividerWeight = s.dividerWeight || 1;
  const bulletChar = s.bulletStyle === "dash" ? "–" : s.bulletStyle === "arrow" ? "›" : s.bulletStyle === "none" ? "" : "•";
  const showSummary = s.showSummary !== false;
  const showSkills = s.showSkills !== false;
  const showEducation = s.showEducation !== false;

  const headingCss = `
    font-size: ${basePx * headingMult}px;
    font-weight: 700;
    color: ${headingColor};
    text-transform: ${headingStyle};
    letter-spacing: ${headingStyle === "uppercase" ? "0.05em" : "0"};
    margin: 0 0 8px 0;
    padding-bottom: 4px;
    border-bottom: ${borderStyle === "none" ? "none" : `${dividerWeight}px ${borderStyle} ${s.dividerColor || headingColor + "33"}`};
  `;

  const contactParts = [
    resume.contact.email,
    resume.contact.phone,
    resume.contact.location,
    resume.contact.linkedin,
  ].filter((x): x is string => !!x);

  // Photo HTML
  const photoHtml = s.showPhoto && resume.contact.photo ? `
    <img src="${resume.contact.photo}" style="
      width: ${s.photoSize || 72}px;
      height: ${s.photoSize || 72}px;
      object-fit: cover;
      flex-shrink: 0;
      border-radius: ${s.photoShape === "circle" ? "50%" : s.photoShape === "rounded" ? "8px" : "0"};
    " />
  ` : "";

  // Skills HTML
  let skillsHtml = "";
  if (resume.skills.length > 0 && showSkills) {
    const skillStyle = s.skillStyle || "pills";
    let skillItems = "";
    if (skillStyle === "comma") {
      skillItems = `<p style="font-size: ${basePx * 0.83}px; color: ${textColor}; margin: 0;">${resume.skills.map(escapeHtml).join(", ")}</p>`;
    } else {
      skillItems = `<div style="display: flex; flex-wrap: wrap; gap: 6px;">
        ${resume.skills.map((sk) => `<span style="
          background: ${skillStyle === "tags" ? "transparent" : accentColor + "15"};
          color: ${accentColor};
          font-size: ${basePx * 0.83}px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: ${skillStyle === "tags" ? "4px" : "9999px"};
          border: ${skillStyle === "tags" ? `1px solid ${accentColor}33` : "none"};
        ">${escapeHtml(sk)}</span>`).join("")}
      </div>`;
    }
    skillsHtml = `
      <div style="margin-bottom: ${sectionGap}px;">
        <h2 style="${headingCss}">Skills</h2>
        ${skillItems}
      </div>
    `;
  }

  // Experience HTML
  const experienceHtml = resume.experience.length > 0 ? `
    <div style="margin-bottom: ${sectionGap}px;">
      <h2 style="${headingCss}">Experience</h2>
      ${resume.experience.map((exp) => `
        <div style="margin-bottom: 14px; break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <div>
              <span style="font-weight: 600;">${escapeHtml(exp.title)}</span>
              <span style="color: ${textColor}55;"> · </span>
              <span style="color: ${textColor}99;">${escapeHtml(exp.company)}</span>
            </div>
            <span style="font-size: ${basePx * 0.83}px; color: ${textColor}77; white-space: nowrap; margin-left: 8px;">${escapeHtml(exp.dateRange)}</span>
          </div>
          <ul style="margin: 4px 0 0 0; padding-left: ${bulletChar ? "12px" : "0"}; list-style: none;">
            ${exp.bullets.map((b) => `
              <li style="margin-bottom: 2px; display: flex; gap: 6px;">
                ${bulletChar ? `<span style="color: ${textColor}66;">${bulletChar}</span>` : ""}
                <span>${escapeHtml(b)}</span>
              </li>
            `).join("")}
          </ul>
        </div>
      `).join("")}
    </div>
  ` : "";

  // Education HTML
  const educationHtml = resume.education.length > 0 && showEducation ? `
    <div style="margin-bottom: ${sectionGap}px;">
      <h2 style="${headingCss}">Education</h2>
      ${resume.education.map((edu) => `
        <div style="margin-bottom: 6px; display: flex; justify-content: space-between; align-items: baseline;">
          <div>
            <span style="font-weight: 600;">${escapeHtml(edu.degree)}</span>
            <span style="color: ${textColor}55;"> · </span>
            <span style="color: ${textColor}99;">${escapeHtml(edu.school)}</span>
          </div>
          <span style="font-size: ${basePx * 0.83}px; color: ${textColor}77;">${escapeHtml(edu.dateRange)}</span>
        </div>
      `).join("")}
    </div>
  ` : "";

  // Summary HTML
  const summaryHtml = resume.summary && showSummary ? `
    <div style="margin-bottom: ${sectionGap}px;">
      <h2 style="${headingCss}">Summary</h2>
      <p style="margin: 0; line-height: ${lineHeight};">${escapeHtml(resume.summary)}</p>
    </div>
  ` : "";

  // Cover letter page
  const coverLetterHtml = coverLetter ? `
    <div style="page-break-before: always; font-family: ${fontFamily}; color: ${textColor}; font-size: ${basePx}px; line-height: ${lineHeight}; padding: ${marginsY}px ${marginsX}px;">
      <p style="margin-bottom: 24px;">${escapeHtml(coverLetter.greeting)}</p>
      ${coverLetter.paragraphs.map((p) => `<p style="margin-bottom: 16px;">${escapeHtml(p)}</p>`).join("")}
      <p style="margin-top: 24px; margin-bottom: 4px;">${escapeHtml(coverLetter.closing)}</p>
      <p style="font-weight: 600;">${escapeHtml(coverLetter.signature)}</p>
    </div>
  ` : "";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(resume.contact.name || "Resume")} - Resume</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Lato:wght@400;700&family=Roboto:wght@400;700&family=Playfair+Display:wght@400;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: letter;
      margin: 0;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @media print {
      body { background: white; }
    }
    @media screen {
      body {
        background: #f5f5f4;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 40px 20px;
        gap: 40px;
      }
      .page {
        box-shadow: 0 4px 24px rgba(0,0,0,0.12);
        border-radius: 4px;
      }
    }
  </style>
</head>
<body>
  <div class="page" style="
    width: 8.5in;
    min-height: 11in;
    background: white;
    font-family: ${fontFamily};
    color: ${textColor};
    font-size: ${basePx}px;
    line-height: ${lineHeight};
    padding: ${marginsY}px ${marginsX}px;
  ">
    <!-- Header -->
    <div style="
      margin-bottom: ${sectionGap}px;
      padding-bottom: 16px;
      border-bottom: ${borderStyle === "none" ? "none" : `${Math.max(dividerWeight, 2)}px ${borderStyle} ${headingColor}`};
      text-align: ${headerAlign};
      display: flex;
      align-items: center;
      gap: 16px;
      flex-direction: ${headerAlign === "center" ? "column" : "row"};
    ">
      ${photoHtml}
      <div style="text-align: ${headerAlign};">
        <h1 style="font-size: ${basePx * nameSize}px; font-weight: 700; color: ${headingColor}; margin: 0 0 6px 0;">${escapeHtml(resume.contact.name)}</h1>
        <div style="font-size: ${basePx * 0.83}px; color: ${textColor}77;">
          ${contactParts.map(escapeHtml).join(' <span style="color: #d6d3d1;">·</span> ')}
        </div>
      </div>
    </div>

    ${summaryHtml}
    ${experienceHtml}
    ${educationHtml}
    ${skillsHtml}
  </div>

  ${coverLetterHtml}

  <script>
    // Auto-trigger print on load, then close
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>`;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
