import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.units import mm
from reportlab.lib import colors
from io import BytesIO
from app.models.bill import Bill

def generate_bill_pdf(bill: Bill) -> BytesIO:
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    # Shop Header - Centered and Bold
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width/2, height - 30*mm, "SUJI VEGETABLES")
    
    c.setFont("Helvetica", 10)
    c.drawCentredString(width/2, height - 38*mm, "Pondy - Tindivanam Main Raod, Kiliyanur")
    c.drawCentredString(width/2, height - 43*mm, "Phone: +91 9095938085")
    
    # Separator line
    c.setLineWidth(0.5)
    c.line(20*mm, height - 48*mm, width - 20*mm, height - 48*mm)
    
    # Bill Details - Two columns
    y = height - 58*mm
    c.setFont("Helvetica-Bold", 10)
    
    # Left column
    c.drawString(20*mm, y, "Bill To:")
    c.setFont("Helvetica", 10)
    c.drawString(40*mm, y, bill.customer_name or 'Walking Customer')
    
    # Right column
    c.setFont("Helvetica-Bold", 10)
    c.drawString(120*mm, y, "Bill No:")
    c.setFont("Helvetica", 10)
    c.drawString(145*mm, y, bill.bill_number)
    
    y -= 6*mm
    c.setFont("Helvetica-Bold", 10)
    c.drawString(20*mm, y, "Type:")
    c.setFont("Helvetica", 10)
    c.drawString(40*mm, y, bill.billing_type)
    
    c.setFont("Helvetica-Bold", 10)
    c.drawString(120*mm, y, "Date:")
    c.setFont("Helvetica", 10)
    c.drawString(145*mm, y, bill.created_at.strftime('%d/%m/%Y %H:%M'))
    
    # Items Table Header
    y -= 12*mm
    c.setLineWidth(1)
    c.line(20*mm, y, width - 20*mm, y)
    
    y -= 7*mm
    c.setFont("Helvetica-Bold", 10)
    c.drawString(20*mm, y, "Item")
    c.drawString(120*mm, y, "Qty")
    c.drawString(145*mm, y, "Price")
    c.drawString(170*mm, y, "Total")
    
    y -= 2*mm
    c.setLineWidth(0.5)
    c.line(20*mm, y, width - 20*mm, y)
    
    # Items
    y -= 8*mm
    c.setFont("Helvetica", 10)
    
    for item in bill.items:
        # Display name with Tamil name if available
        display_name = item.vegetable_name
        if hasattr(item, 'tamil_name') and item.tamil_name:
            # Tamil text might not render properly without Tamil font
            # For now, we'll just show English name
            display_name = f"{item.vegetable_name}"
        
        c.drawString(20*mm, y, display_name)
        c.drawString(120*mm, y, f"{item.qty_kg} kg")
        c.drawString(145*mm, y, f"{item.price:.2f}")
        c.drawString(170*mm, y, f"{item.subtotal:.2f}")
        
        y -= 7*mm
        
        # Page break if needed
        if y < 60*mm:
            c.showPage()
            c.setFont("Helvetica", 10)
            y = height - 30*mm
    
    # Separator before totals
    y -= 3*mm
    c.setLineWidth(1)
    c.line(20*mm, y, width - 20*mm, y)
    
    # Subtotal
    y -= 8*mm
    c.setFont("Helvetica", 10)
    c.drawString(145*mm, y, "Subtotal:")
    c.drawString(170*mm, y, f"₹{bill.subtotal:.2f}")
    
    # Tax (if applicable)
    y -= 6*mm
    c.drawString(145*mm, y, "Tax:")
    c.drawString(170*mm, y, f"₹{bill.tax_amount:.2f}")
    
    # Dotted line
    y -= 3*mm
    c.setDash(1, 2)
    c.line(140*mm, y, width - 20*mm, y)
    c.setDash()
    
    # Grand Total - Bold and larger
    y -= 8*mm
    c.setFont("Helvetica-Bold", 12)
    c.drawString(145*mm, y, "Grand Total:")
    c.drawString(170*mm, y, f"₹{bill.total_amount:.2f}")
    
    # Footer message
    y -= 20*mm
    c.setFont("Helvetica-Oblique", 9)
    c.drawCentredString(width/2, y, "Thank you for shopping with us!")
    y -= 5*mm
    c.drawCentredString(width/2, y, "Visit Again.")
    
    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer
