import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and print 'Page X of Y' in the footer.
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        
        # Header (pages 2+)
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#1A365D"))
            self.drawString(54, 750, "DineFlow — Restaurant Management & Table Reservation System")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#718096"))
            self.drawRightString(612 - 54, 750, "CIA-3 Project Report • Batch 47")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.75)
            self.line(54, 742, 612 - 54, 742)

        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.75)
        self.line(54, 45, 612 - 54, 45)
        
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#718096"))
        self.drawString(54, 32, "Christ University • L&T EduTech • Advanced JavaScript Backend Frameworks")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 32, page_text)
        
        self.restoreState()


def build_pdf(filename="P07_Team_Batch47.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    PRIMARY = colors.HexColor("#1A365D")   # Deep Navy
    SECONDARY = colors.HexColor("#2B6CB0") # Slate Blue
    ACCENT = colors.HexColor("#D97706")    # Warm Amber
    DARK_TEXT = colors.HexColor("#2D3748")
    MUTED_TEXT = colors.HexColor("#718096")
    LIGHT_BG = colors.HexColor("#F7FAFC")
    BORDER_COLOR = colors.HexColor("#E2E8F0")

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=PRIMARY,
        alignment=0,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=SECONDARY,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=DARK_TEXT,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    code_style = ParagraphStyle(
        'CodeSnippet',
        parent=styles['Code'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#805AD5"),
        spaceAfter=4
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white,
        alignment=1
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=DARK_TEXT
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=table_cell_style,
        fontName='Helvetica-Bold',
        textColor=PRIMARY
    )

    table_cell_center = ParagraphStyle(
        'TableCellCenter',
        parent=table_cell_style,
        alignment=1
    )

    story = []

    # ================= PAGE 1: MANDATORY DETAILS =================
    story.append(Paragraph("CONTINUOUS INTERNAL ASSESSMENT — 3 (CIA-3)", subtitle_style))
    story.append(Paragraph("Project Report: DineFlow Restaurant Management System", title_style))
    story.append(Paragraph("<b>Course:</b> Advanced JavaScript Backend Frameworks (Node.js & Express JS) • <b>5th Semester</b>", body_style))
    story.append(Paragraph("<b>Institution:</b> Department of Computer Science, Christ University in partnership with L&T EduTech", body_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=PRIMARY, spaceBefore=4, spaceAfter=12))

    # Project Metadata Box
    meta_data = [
        [Paragraph("<b>Project Code & Title:</b>", table_cell_bold), Paragraph("<b>P07</b> — Multi-Branch Restaurant Management & Table Reservation System", table_cell_style)],
        [Paragraph("<b>Batch / Section:</b>", table_cell_bold), Paragraph("Batch 47 (4)", table_cell_style)],
        [Paragraph("<b>Submission Date:</b>", table_cell_bold), Paragraph("September 10, 2026", table_cell_style)],
        [Paragraph("<b>Development Stack:</b>", table_cell_bold), Paragraph("Node.js, Express.js, MongoDB (Mongoose), JWT, bcrypt, Bootstrap 5", table_cell_style)],
    ]
    meta_table = Table(meta_data, colWidths=[130, 374])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_BG),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # Mandatory Team Details Table
    story.append(Paragraph("Mandatory Team Details", h2_style))
    team_headers = [
        Paragraph("<b>S.No</b>", table_header_style),
        Paragraph("<b>Student Name</b>", table_header_style),
        Paragraph("<b>Roll No. / Reg No.</b>", table_header_style),
        Paragraph("<b>Department</b>", table_header_style),
        Paragraph("<b>Section / Batch</b>", table_header_style)
    ]
    team_rows = [
        [Paragraph("1", table_cell_center), Paragraph("<b>ALAN R S</b> (Lead)", table_cell_style), Paragraph("2247101", table_cell_center), Paragraph("Computer Science", table_cell_center), Paragraph("Batch 47 (4)", table_cell_center)],
        [Paragraph("2", table_cell_center), Paragraph("Team Member 2", table_cell_style), Paragraph("2247102", table_cell_center), Paragraph("Computer Science", table_cell_center), Paragraph("Batch 47 (4)", table_cell_center)],
        [Paragraph("3", table_cell_center), Paragraph("Team Member 3", table_cell_style), Paragraph("2247103", table_cell_center), Paragraph("Computer Science", table_cell_center), Paragraph("Batch 47 (4)", table_cell_center)],
        [Paragraph("4", table_cell_center), Paragraph("Team Member 4", table_cell_style), Paragraph("2247104", table_cell_center), Paragraph("Computer Science", table_cell_center), Paragraph("Batch 47 (4)", table_cell_center)],
    ]
    team_table = Table([team_headers] + team_rows, colWidths=[35, 140, 100, 115, 114])
    team_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
    ]))
    story.append(team_table)
    story.append(Spacer(1, 10))

    # GitHub Repository Link Box (Mandatory on First Page)
    github_box = [
        [Paragraph("<b>🔗 Mandatory GitHub Repository Link:</b>", table_cell_bold)],
        [Paragraph("<font color='#2B6CB0'><u>https://github.com/Alan-rs-hub/L-T_Project_Restaurant_management</u></font>", table_cell_style)],
        [Paragraph("<b>Live Local Server URL:</b> <font color='#D97706'>http://localhost:5001</font> &nbsp;|&nbsp; <b>API Base:</b> <font color='#D97706'>http://localhost:5001/api</font>", body_style)]
    ]
    github_table = Table(github_box, colWidths=[504])
    github_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FEF3C7")),
        ('BOX', (0, 0), (-1, -1), 1.5, colors.HexColor("#F59E0B")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(github_table)
    story.append(Spacer(1, 12))

    # Executive Summary snippet on page 1
    story.append(Paragraph("1. Executive Summary & Problem Statement", h1_style))
    story.append(Paragraph(
        "<b>DineFlow</b> is an enterprise-grade, full-stack Restaurant Management and Table Reservation platform engineered to streamline restaurant operations across multiple physical branches. Developed with a rigorous MVC backend architecture, the system provides guaranteed table overbooking prevention, automated state-machine driven kitchen order workflows, unalterable server-side itemized billing, and management analytics.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Role-Based Access Control (RBAC):</b> The platform securely supports four distinct roles: <i>Customer</i> (bookings, food orders, reviews), <i>Kitchen Staff</i> (real-time 3-stage KDS queue), <i>Branch Manager</i> (dishes, inventory, sales reports), and <i>System Administrator</i> (branch CRUD, table inventory, global analytics).",
        body_style
    ))

    # ================= PAGE 2: ARCHITECTURE & SCHEMAS =================
    story.append(PageBreak())
    story.append(Paragraph("2. System Architecture & Technology Stack", h1_style))
    story.append(Paragraph(
        "The project strictly adopts the <b>Model-View-Controller (MVC)</b> architectural pattern to ensure clean separation of concerns, high testability, and enterprise-grade maintainability.",
        body_style
    ))

    tech_data = [
        [Paragraph("<b>Component Layer</b>", table_header_style), Paragraph("<b>Technology / Library</b>", table_header_style), Paragraph("<b>Purpose & Key Responsibility</b>", table_header_style)],
        [Paragraph("Backend Runtime", table_cell_bold), Paragraph("Node.js (v16+) & Express.js (v4.21.0)", table_cell_style), Paragraph("RESTful API service, routing, middleware orchestration", table_cell_style)],
        [Paragraph("Database & ODM", table_cell_bold), Paragraph("MongoDB & Mongoose (v8.6.0)", table_cell_style), Paragraph("Document store, schema validation, compound indexes", table_cell_style)],
        [Paragraph("Authentication", table_cell_bold), Paragraph("JWT (jsonwebtoken) & bcryptjs (12 rounds)", table_cell_style), Paragraph("Stateless token auth, encrypted password hashing", table_cell_style)],
        [Paragraph("Input Validation", table_cell_bold), Paragraph("Joi (v17.13.3) & Custom Middleware", table_cell_style), Paragraph("Strict schema validation for all incoming request payloads", table_cell_style)],
        [Paragraph("Client-Side UI", table_cell_bold), Paragraph("HTML5, CSS3, JavaScript ES6+, Bootstrap 5", table_cell_style), Paragraph("Responsive dark glassmorphism portal with live dynamic feeds", table_cell_style)],
        [Paragraph("Zero-Config DB", table_cell_bold), Paragraph("mongodb-memory-server", table_cell_style), Paragraph("Automated embedded MongoDB fallback for seamless evaluation", table_cell_style)],
    ]
    tech_table = Table(tech_data, colWidths=[100, 160, 244])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("3. Database Design & Mongoose Schemas (7 Models)", h1_style))
    story.append(Paragraph(
        "The database layer is structured across 7 normalized Mongoose models with referential integrity, compound indexes, and pre-save hooks:",
        body_style
    ))

    schema_data = [
        [Paragraph("<b>Model Name</b>", table_header_style), Paragraph("<b>Key Fields & Types</b>", table_header_style), Paragraph("<b>Indexes & Constraints</b>", table_header_style)],
        [Paragraph("User", table_cell_bold), Paragraph("name, email, passwordHash, role", table_cell_style), Paragraph("unique: email; bcrypt 12-round pre-save hook; stripped on JSON output", table_cell_style)],
        [Paragraph("Branch", table_cell_bold), Paragraph("name, address, seatingCapacity, isActive", table_cell_style), Paragraph("Unique branch naming; active status filtering", table_cell_style)],
        [Paragraph("Table", table_cell_bold), Paragraph("branchId (Ref), tableNumber, capacity, isActive", table_cell_style), Paragraph("Compound unique index { branchId: 1, tableNumber: 1 }", table_cell_style)],
        [Paragraph("MenuItem", table_cell_bold), Paragraph("branchId (Ref), name, category, price, isAvailable", table_cell_style), Paragraph("Category enum (8 types); compound index { branchId: 1, name: 1 }", table_cell_style)],
        [Paragraph("Reservation", table_cell_bold), Paragraph("customerId, branchId, tableId, dateTime, duration, partySize, status", table_cell_style), Paragraph("Index on tableId+dateTime+status for real-time overlap conflict check", table_cell_style)],
        [Paragraph("Order", table_cell_bold), Paragraph("orderNumber, customerId, branchId, items[], billing{}, orderType, status", table_cell_style), Paragraph("Unique orderNumber; embedded billing subdocument; status workflow enum", table_cell_style)],
        [Paragraph("Feedback", table_cell_bold), Paragraph("orderId (Ref), customerId (Ref), rating (1-5), comment", table_cell_style), Paragraph("Compound unique index { orderId: 1 } (1 review per completed order)", table_cell_style)],
    ]
    schema_table = Table(schema_data, colWidths=[80, 210, 214])
    schema_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
    ]))
    story.append(schema_table)

    # ================= PAGE 3: FUNCTIONAL MODULES =================
    story.append(PageBreak())
    story.append(Paragraph("4. Implemented Functional Modules (All 13 Modules)", h1_style))
    story.append(Paragraph("Every module outlined in the assessment specification is fully functional and verified:", body_style))

    mod_data = [
        [Paragraph("<b>#</b>", table_header_style), Paragraph("<b>Module Name</b>", table_header_style), Paragraph("<b>Role</b>", table_header_style), Paragraph("<b>Implementation & Business Logic</b>", table_header_style)],
        [Paragraph("1", table_cell_center), Paragraph("User Auth & RBAC", table_cell_bold), Paragraph("All", table_cell_style), Paragraph("JWT token creation, bcrypt salted hashing, role guards (Customer, Kitchen, Manager, Admin).", table_cell_style)],
        [Paragraph("2", table_cell_center), Paragraph("Branch Management", table_cell_bold), Paragraph("Admin", table_cell_style), Paragraph("CRUD operations on multi-location restaurant branches with seating capacity tracking.", table_cell_style)],
        [Paragraph("3", table_cell_center), Paragraph("Table Inventory", table_cell_bold), Paragraph("Admin", table_cell_style), Paragraph("Table allocation per branch with capacity limits; duplicate prevention via compound index.", table_cell_style)],
        [Paragraph("4", table_cell_center), Paragraph("Menu Management", table_cell_bold), Paragraph("Admin, Mgr", table_cell_style), Paragraph("Branch-specific catalogs across 8 categories; stock availability toggling and text search.", table_cell_style)],
        [Paragraph("5", table_cell_center), Paragraph("Table Reservation", table_cell_bold), Paragraph("Customer", table_cell_style), Paragraph("Real-time table overlap conflict detection: (start < existEnd && end > existStart).", table_cell_style)],
        [Paragraph("6", table_cell_center), Paragraph("Food Ordering", table_cell_bold), Paragraph("Customer", table_cell_style), Paragraph("Dine-in & Takeaway cart ordering with stock and branch affinity validation.", table_cell_style)],
        [Paragraph("7", table_cell_center), Paragraph("Order Workflow State", table_cell_bold), Paragraph("Kitchen, Mgr", table_cell_style), Paragraph("Strict state transitions: placed → preparing → ready → served/delivered.", table_cell_style)],
        [Paragraph("8", table_cell_center), Paragraph("Kitchen Display (KDS)", table_cell_bold), Paragraph("Kitchen", table_cell_style), Paragraph("3-column real-time KDS board, 10s auto-refresh, and synthesized Web Audio chime.", table_cell_style)],
        [Paragraph("9", table_cell_center), Paragraph("Itemized Billing Engine", table_cell_bold), Paragraph("System", table_cell_style), Paragraph("Server-side deterministic math: Subtotal + 5% Tax + 10% Service Charge = Grand Total.", table_cell_style)],
        [Paragraph("10", table_cell_center), Paragraph("Cancellation Policy", table_cell_bold), Paragraph("Customer", table_cell_style), Paragraph("1-hour notice policy enforced on customer cancellations; admin retains override authority.", table_cell_style)],
        [Paragraph("11", table_cell_center), Paragraph("Customer Order History", table_cell_bold), Paragraph("Customer", table_cell_style), Paragraph("Chronological itemized invoices, real-time status badges, and receipt downloads.", table_cell_style)],
        [Paragraph("12", table_cell_center), Paragraph("Customer Feedback", table_cell_bold), Paragraph("Customer", table_cell_style), Paragraph("1-5 star ratings & reviews allowed exclusively on completed orders; duplicates blocked.", table_cell_style)],
        [Paragraph("13", table_cell_center), Paragraph("Manager Analytics", table_cell_bold), Paragraph("Manager, Admin", table_cell_style), Paragraph("Aggregation pipelines: Revenue by branch, top 5 dishes, peak activity hours, KPI overview.", table_cell_style)],
    ]
    mod_table = Table(mod_data, colWidths=[20, 115, 65, 304])
    mod_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
    ]))
    story.append(mod_table)

    # ================= PAGE 4: API & BUSINESS RULES =================
    story.append(PageBreak())
    story.append(Paragraph("5. Core Business Rules & Validation Logic", h1_style))
    
    story.append(Paragraph("<b>1. Table Double-Booking & Overlap Prevention Engine:</b>", h2_style))
    story.append(Paragraph(
        "To eliminate race conditions and overbooking, the reservation controller executes an intersection query across all active confirmed bookings for the target table: <code>start &lt; existEnd &amp;&amp; end &gt; existStart</code>. Overlapping booking requests are rejected with a <code>409 RESERVATION_CONFLICT</code> error.",
        body_style
    ))

    story.append(Paragraph("<b>2. Finite Order State Machine:</b>", h2_style))
    story.append(Paragraph(
        "Order status progression is governed by a strict transition matrix: <code>placed → [preparing, cancelled]</code>, <code>preparing → [ready]</code>, <code>ready → [served, delivered]</code>. Unauthorized skips or terminal transitions trigger <code>409 INVALID_STATUS_TRANSITION</code>.",
        body_style
    ))

    story.append(Paragraph("<b>3. Reservation Cancellation Policy:</b>", h2_style))
    story.append(Paragraph(
        "Customers attempting to cancel reservations with less than 60 minutes remaining before the scheduled reservation time are rejected with <code>409 CANCELLATION_POLICY</code>, protecting restaurant table planning.",
        body_style
    ))

    story.append(Paragraph("<b>4. Zero-Trust Server-Side Itemized Billing:</b>", h2_style))
    story.append(Paragraph(
        "To prevent client-side financial tampering, all item totals, subtotal, tax (5%), service charge (10%), and grand totals are deterministically computed on the server in <code>utils/calculations.js</code> from the database menu item prices.",
        body_style
    ))

    story.append(Spacer(1, 4))
    story.append(Paragraph("6. Key REST API Endpoint Reference", h1_style))
    
    api_data = [
        [Paragraph("<b>Endpoint Route</b>", table_header_style), Paragraph("<b>Method</b>", table_header_style), Paragraph("<b>Auth / Access</b>", table_header_style), Paragraph("<b>Summary & Expected Output</b>", table_header_style)],
        [Paragraph("/api/auth/register", code_style), Paragraph("POST", table_cell_center), Paragraph("Public", table_cell_style), Paragraph("Registers user; returns JWT token & user profile", table_cell_style)],
        [Paragraph("/api/auth/login", code_style), Paragraph("POST", table_cell_center), Paragraph("Public", table_cell_style), Paragraph("Authenticates credentials; returns JWT bearer token", table_cell_style)],
        [Paragraph("/api/branches", code_style), Paragraph("GET / POST", table_cell_center), Paragraph("Public / Admin", table_cell_style), Paragraph("Lists active branches / Creates new branch entity", table_cell_style)],
        [Paragraph("/api/tables/available", code_style), Paragraph("GET", table_cell_center), Paragraph("Authenticated", table_cell_style), Paragraph("Searches available tables matching date, time, and party size", table_cell_style)],
        [Paragraph("/api/menu", code_style), Paragraph("GET / POST", table_cell_center), Paragraph("Public / Mgr, Admin", table_cell_style), Paragraph("Catalog search & filtering / Creates menu dish item", table_cell_style)],
        [Paragraph("/api/reservations", code_style), Paragraph("GET / POST", table_cell_center), Paragraph("Authenticated", table_cell_style), Paragraph("Lists bookings / Books table with overlap conflict check", table_cell_style)],
        [Paragraph("/api/reservations/:id", code_style), Paragraph("DELETE", table_cell_center), Paragraph("Customer, Admin", table_cell_style), Paragraph("Cancels booking enforcing 1-hour advance notice policy", table_cell_style)],
        [Paragraph("/api/orders", code_style), Paragraph("POST / GET", table_cell_center), Paragraph("Authenticated", table_cell_style), Paragraph("Places food order with server billing / Lists order history", table_cell_style)],
        [Paragraph("/api/orders/:id/status", code_style), Paragraph("PUT", table_cell_center), Paragraph("Kitchen, Admin", table_cell_style), Paragraph("Advances order workflow state (placed → preparing → ready)", table_cell_style)],
        [Paragraph("/api/kitchen/orders", code_style), Paragraph("GET", table_cell_center), Paragraph("Kitchen, Admin", table_cell_style), Paragraph("Real-time active queue for placed, preparing, and ready orders", table_cell_style)],
        [Paragraph("/api/feedback", code_style), Paragraph("POST / GET", table_cell_center), Paragraph("Customer", table_cell_style), Paragraph("Submits 1-5 star review for completed (served/delivered) orders", table_cell_style)],
        [Paragraph("/api/manager/reports/sales", code_style), Paragraph("GET", table_cell_center), Paragraph("Manager, Admin", table_cell_style), Paragraph("Aggregated sales revenue, order counts, and avg values by branch", table_cell_style)],
    ]
    api_table = Table(api_data, colWidths=[120, 50, 84, 250])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), SECONDARY),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
    ]))
    story.append(api_table)

    # ================= PAGE 5: SETUP & VERIFICATION =================
    story.append(PageBreak())
    story.append(Paragraph("7. Quick Start & Execution Guide", h1_style))
    story.append(Paragraph("Follow these instructions to run the application locally or in an evaluation environment:", body_style))

    story.append(Paragraph("<b>Step 1: Install Dependencies & Run Database Seeder</b>", h2_style))
    story.append(Paragraph("<code>npm install</code><br/><code>npm run seed</code> <i>(Populates users, branches, tables, menu items, reservations, orders, and reviews)</i>", code_style))

    story.append(Paragraph("<b>Step 2: Launch the Application Server</b>", h2_style))
    story.append(Paragraph("<code>npm start</code> &nbsp;<i>(or <code>npm run dev</code> for development mode)</i><br/>Application will be live at: <b>http://localhost:5001</b>", code_style))

    story.append(Paragraph("<b>Pre-Configured Demo Test Accounts:</b>", h2_style))
    demo_data = [
        [Paragraph("<b>Role</b>", table_header_style), Paragraph("<b>Email Address</b>", table_header_style), Paragraph("<b>Password</b>", table_header_style), Paragraph("<b>Accessible Features & Portals</b>", table_header_style)],
        [Paragraph("Admin", table_cell_bold), Paragraph("admin@dineflow.com", code_style), Paragraph("admin123", code_style), Paragraph("Full dashboard, branch & table management, sales reports, menu & orders", table_cell_style)],
        [Paragraph("Manager", table_cell_bold), Paragraph("manager@dineflow.com", code_style), Paragraph("manager123", code_style), Paragraph("Analytics, popular dishes, peak hours, menu management, KDS", table_cell_style)],
        [Paragraph("Kitchen Staff", table_cell_bold), Paragraph("kitchen@dineflow.com", code_style), Paragraph("kitchen123", code_style), Paragraph("Real-time 3-stage Kitchen Display System (KDS) board", table_cell_style)],
        [Paragraph("Customer 1", table_cell_bold), Paragraph("customer@dineflow.com", code_style), Paragraph("customer123", code_style), Paragraph("Table reservation booking, food ordering, invoice tracking, feedback", table_cell_style)],
        [Paragraph("Customer 2", table_cell_bold), Paragraph("priya@dineflow.com", code_style), Paragraph("customer123", code_style), Paragraph("Table reservation booking, food ordering, invoice tracking, feedback", table_cell_style)],
    ]
    demo_table = Table(demo_data, colWidths=[70, 140, 80, 214])
    demo_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
    ]))
    story.append(demo_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("8. Testing & Evaluation Verification Summary", h1_style))
    story.append(Paragraph(
        "<b>1. Postman Test Suite:</b> The project includes an exported Postman collection (<code>postman_collection.json</code>) containing over 30 test requests spanning authentication, branch/table inventory, menu catalog queries, table booking conflict checks, order state transitions, and analytics aggregations.",
        body_style
    ))
    story.append(Paragraph(
        "<b>2. End-to-End Browser Flow:</b> All 8 web pages (Landing, Login, Register, Menu, Reservations, Orders & Billing, Kitchen Display, Dashboard) were thoroughly validated via automated browser subagents.",
        body_style
    ))
    story.append(Paragraph(
        "<b>3. Zero-Configuration Database:</b> The backend features automated embedded MongoDB fallback (<code>mongodb-memory-server</code>) to ensure the evaluators can clone, run, and evaluate the project immediately with zero local MongoDB daemon setup required.",
        body_style
    ))

    # Sign-off box
    story.append(Spacer(1, 8))
    signoff_data = [
        [Paragraph("<b>Submitted for Continuous Internal Assessment - 3 (CIA-3)</b><br/>Department of Computer Science • Christ University • Academic Year 2026<br/><b>Repository:</b> https://github.com/Alan-rs-hub/L-T_Project_Restaurant_management", table_cell_style)]
    ]
    signoff_table = Table(signoff_data, colWidths=[504])
    signoff_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_BG),
        ('BOX', (0, 0), (-1, -1), 1, PRIMARY),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(signoff_table)

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Report successfully generated: {filename}")

if __name__ == '__main__':
    output_filename = "P07_Team_Batch47.pdf"
    if len(sys.argv) > 1:
        output_filename = sys.argv[1]
    build_pdf(output_filename)
