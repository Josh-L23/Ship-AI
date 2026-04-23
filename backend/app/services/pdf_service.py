import io
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)


def _hex_to_color(hex_str: str) -> colors.Color:
    h = hex_str.lstrip("#")
    if len(h) != 6:
        return colors.black
    return colors.HexColor(f"#{h}")


def generate_brand_guidelines_pdf(
    project_name: str,
    spec: dict,
) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        topMargin=25 * mm,
        bottomMargin=20 * mm,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
    )

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        "CoverTitle", parent=styles["Title"], fontSize=32, spaceAfter=12,
    ))
    styles.add(ParagraphStyle(
        "CoverSub", parent=styles["Normal"], fontSize=14,
        textColor=colors.grey, spaceAfter=40,
    ))
    styles.add(ParagraphStyle(
        "SectionHead", parent=styles["Heading2"], fontSize=18,
        spaceBefore=18, spaceAfter=10, textColor=colors.HexColor("#1a1a2e"),
    ))
    styles.add(ParagraphStyle(
        "Body", parent=styles["Normal"], fontSize=11, leading=16,
    ))
    styles.add(ParagraphStyle(
        "SmallGrey", parent=styles["Normal"], fontSize=9,
        textColor=colors.grey,
    ))

    elements: list = []
    canvas_assets = spec.get("canvasAssets", [])
    if not isinstance(canvas_assets, list):
        canvas_assets = []

    brand_name = project_name
    tagline = ""
    for asset in canvas_assets:
        if asset.get("type") == "brand_guidelines":
            data = asset.get("data", {})
            brand_name = data.get("brandName", brand_name)
            tagline = data.get("tagline", tagline)
            break

    # --- Cover ---
    elements.append(Spacer(1, 60 * mm))
    elements.append(Paragraph(brand_name, styles["CoverTitle"]))
    if tagline:
        elements.append(Paragraph(tagline, styles["CoverSub"]))
    elements.append(Paragraph("Brand Identity Guidelines", styles["CoverSub"]))
    now = datetime.now(timezone.utc).strftime("%B %d, %Y")
    elements.append(Paragraph(f"Generated {now}", styles["SmallGrey"]))
    elements.append(PageBreak())

    # --- Brand DNA ---
    dna_assets = [a for a in canvas_assets if a.get("type") == "brand_guidelines"]
    if dna_assets:
        elements.append(Paragraph("Brand DNA", styles["SectionHead"]))
        for asset in dna_assets:
            title = asset.get("title", "")
            if title:
                elements.append(Paragraph(f"<b>{title}</b>", styles["Body"]))
            data = asset.get("data", {})
            for key in ("industry", "targetAudience"):
                val = data.get(key)
                if val:
                    label = "Industry" if key == "industry" else "Target Audience"
                    elements.append(Paragraph(f"<b>{label}:</b> {val}", styles["Body"]))
            descriptors = data.get("voiceDescriptors", [])
            if descriptors and isinstance(descriptors, list):
                elements.append(Paragraph(
                    "<b>Voice:</b> " + ", ".join(str(d) for d in descriptors),
                    styles["Body"],
                ))
            elements.append(Spacer(1, 6 * mm))

    # --- Color Palette ---
    palette_assets = [a for a in canvas_assets if a.get("type") == "color_palette"]
    if palette_assets:
        elements.append(Paragraph("Color Palette", styles["SectionHead"]))
        for asset in palette_assets:
            title = asset.get("title", "Palette")
            elements.append(Paragraph(f"<b>{title}</b>", styles["Body"]))
            color_list = asset.get("data", {}).get("colors", [])
            if color_list and isinstance(color_list, list):
                table_data = []
                row_colors_bg = []
                for c in color_list:
                    if not isinstance(c, dict):
                        continue
                    name = c.get("name", "")
                    hex_val = c.get("hex", "#000000")
                    table_data.append([name, hex_val, ""])
                    row_colors_bg.append(_hex_to_color(hex_val))
                if table_data:
                    t = Table(table_data, colWidths=[60 * mm, 30 * mm, 30 * mm])
                    style_cmds = [
                        ("FONTSIZE", (0, 0), (-1, -1), 10),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                        ("TOPPADDING", (0, 0), (-1, -1), 6),
                        ("GRID", (0, 0), (-1, -1), 0.5, colors.lightgrey),
                    ]
                    for i, bg in enumerate(row_colors_bg):
                        style_cmds.append(("BACKGROUND", (2, i), (2, i), bg))
                    t.setStyle(TableStyle(style_cmds))
                    elements.append(t)
            elements.append(Spacer(1, 6 * mm))

    # --- Typography ---
    typo_assets = [a for a in canvas_assets if a.get("type") == "typography"]
    if typo_assets:
        elements.append(Paragraph("Typography", styles["SectionHead"]))
        for asset in typo_assets:
            data = asset.get("data", {})
            heading = data.get("heading", "")
            body = data.get("body", "")
            if heading:
                elements.append(Paragraph(f"<b>Heading Font:</b> {heading}", styles["Body"]))
            if body:
                elements.append(Paragraph(f"<b>Body Font:</b> {body}", styles["Body"]))
            elements.append(Spacer(1, 6 * mm))

    # --- Notes ---
    note_assets = [a for a in canvas_assets if a.get("type") == "note"]
    if note_assets:
        elements.append(Paragraph("Notes &amp; Details", styles["SectionHead"]))
        for asset in note_assets:
            title = asset.get("title", "Note")
            content = asset.get("data", {}).get("content", "")
            elements.append(Paragraph(f"<b>{title}</b>", styles["Body"]))
            for line in str(content).split("\\n"):
                elements.append(Paragraph(line, styles["Body"]))
            elements.append(Spacer(1, 4 * mm))

    # --- Fallback ---
    if not canvas_assets:
        elements.append(Paragraph("Brand Guidelines", styles["SectionHead"]))
        elements.append(Paragraph(
            "No brand assets have been generated yet. Chat with the agents to build your brand identity.",
            styles["Body"],
        ))

    doc.build(elements)
    return buf.getvalue()
