import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    """Sets background color of a table cell."""
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets internal padding for a cell (in dxa: 20 dxa = 1 pt)."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="CCCCCC", sz="4", val="single"):
    """Sets subtle borders on a table."""
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>'
        f'<w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:left w:val="none"/>'
        f'<w:right w:val="none"/>'
        f'<w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
        f'<w:insideV w:val="none"/>'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def build_docx(filename="P07_Team_Batch47.docx"):
    doc = docx.Document()

    # Page Margins: 0.75 in (54 pt)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

        # Header & Footer
        header = section.header
        hp = header.paragraphs[0]
        hp.text = "DineFlow — Restaurant Management System | CIA-3 Project Report (Batch 47)"
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hp.runs[0].font.size = Pt(8.5)
        hp.runs[0].font.color.rgb = RGBColor(100, 116, 139)

        footer = section.footer
        fp = footer.paragraphs[0]
        fp.text = "Christ University • L&T EduTech • Advanced JavaScript Backend Frameworks"
        fp.alignment = WD_ALIGN_PARAGRAPH.LEFT
        fp.runs[0].font.size = Pt(8.5)
        fp.runs[0].font.color.rgb = RGBColor(100, 116, 139)

    # Styles
    PRIMARY = RGBColor(30, 58, 138)     # Navy #1E3A8A
    SECONDARY = RGBColor(2, 132, 199)   # Blue #0284C7
    ACCENT = RGBColor(217, 119, 6)      # Amber #D97706
    DARK = RGBColor(30, 41, 59)         # Slate #1E293B

    # 1. Document Super Title
    p_sub = doc.add_paragraph()
    r_sub = p_sub.add_run("CONTINUOUS INTERNAL ASSESSMENT — 3 (CIA-3) PROJECT REPORT")
    r_sub.font.size = Pt(10)
    r_sub.font.bold = True
    r_sub.font.color.rgb = SECONDARY
    p_sub.paragraph_format.space_after = Pt(2)

    # 2. Main Title
    p_title = doc.add_paragraph()
    r_title = p_title.add_run("DineFlow: Multi-Branch Restaurant Management & Table Reservation System")
    r_title.font.size = Pt(18)
    r_title.font.bold = True
    r_title.font.color.rgb = PRIMARY
    p_title.paragraph_format.space_after = Pt(4)

    # 3. Academic Details
    p_meta = doc.add_paragraph()
    r_meta1 = p_meta.add_run("Course: ")
    r_meta1.bold = True
    p_meta.add_run("Advanced JavaScript Backend Frameworks (Node.js & Express JS) • ")
    r_meta2 = p_meta.add_run("Semester: ")
    r_meta2.bold = True
    p_meta.add_run("5th Semester\n")
    r_meta3 = p_meta.add_run("Institution: ")
    r_meta3.bold = True
    p_meta.add_run("Department of Computer Science, Christ University (in partnership with L&T EduTech)")
    p_meta.runs[0].font.color.rgb = DARK
    p_meta.paragraph_format.space_after = Pt(12)

    # Metadata Overview Table
    meta_tbl = doc.add_table(rows=4, cols=2)
    meta_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(meta_tbl, "CBD5E1")

    meta_info = [
        ("Project Code & Title:", "P07 — Multi-Branch Restaurant Management & Table Reservation System"),
        ("Batch / Section:", "Batch 47 (4)"),
        ("Submission Date:", "September 10, 2026 (Deadline: September 12, 2026)"),
        ("Technology Stack:", "Node.js, Express.js (v4.21), MongoDB (Mongoose v8.6), JWT, bcryptjs, Bootstrap 5")
    ]

    for i, (k, v) in enumerate(meta_info):
        row = meta_tbl.rows[i]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(1.8)
        c1.width = Inches(5.2)
        set_cell_background(c0, "F8FAFC")
        set_cell_background(c1, "F8FAFC")
        set_cell_margins(c0, 80, 80, 120, 120)
        set_cell_margins(c1, 80, 80, 120, 120)
        
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(k)
        r0.bold = True
        r0.font.size = Pt(9)
        r0.font.color.rgb = PRIMARY
        
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(v)
        r1.font.size = Pt(9)
        r1.font.color.rgb = DARK

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # Mandatory Team Details Table
    p_team_hdr = doc.add_paragraph()
    r_th = p_team_hdr.add_run("Mandatory Team Details")
    r_th.bold = True
    r_th.font.size = Pt(11)
    r_th.font.color.rgb = PRIMARY
    p_team_hdr.paragraph_format.space_after = Pt(4)

    team_tbl = doc.add_table(rows=5, cols=5)
    team_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(team_tbl, "CBD5E1")

    headers = ["S.No", "Student Name", "Roll No. / Reg No.", "Department", "Section / Batch"]
    for j, h in enumerate(headers):
        cell = team_tbl.rows[0].cells[j]
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, 100, 100, 100, 100)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(h)
        r.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    team_members = [
        ("1", "ALAN R S (Lead Developer)", "2247101", "Computer Science", "Batch 47 (4)"),
        ("2", "Team Member 2", "2247102", "Computer Science", "Batch 47 (4)"),
        ("3", "Team Member 3", "2247103", "Computer Science", "Batch 47 (4)"),
        ("4", "Team Member 4", "2247104", "Computer Science", "Batch 47 (4)"),
    ]

    for i, member in enumerate(team_members):
        row = team_tbl.rows[i + 1]
        bg = "FFFFFF" if i % 2 == 0 else "F8FAFC"
        for j, val in enumerate(member):
            cell = row.cells[j]
            set_cell_background(cell, bg)
            set_cell_margins(cell, 80, 80, 100, 100)
            p = cell.paragraphs[0]
            if j in [0, 2, 3, 4]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(val)
            if j == 1 and "ALAN" in val:
                r.bold = True
            r.font.size = Pt(8.5)
            r.font.color.rgb = DARK

    # Widths
    col_widths = [Inches(0.5), Inches(2.2), Inches(1.3), Inches(1.5), Inches(1.5)]
    for row in team_tbl.rows:
        for j, w in enumerate(col_widths):
            row.cells[j].width = w

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Mandatory GitHub Link Box
    gh_tbl = doc.add_table(rows=1, cols=1)
    gh_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_gh = gh_tbl.rows[0].cells[0]
    c_gh.width = Inches(7.0)
    set_cell_background(c_gh, "FEF3C7")
    set_cell_margins(c_gh, 100, 100, 150, 150)
    
    p_gh = c_gh.paragraphs[0]
    r_gh_title = p_gh.add_run("🔗 Mandatory GitHub Repository Link:\n")
    r_gh_title.bold = True
    r_gh_title.font.size = Pt(9.5)
    r_gh_title.font.color.rgb = ACCENT

    r_gh_url = p_gh.add_run("https://github.com/Alan-rs-hub/L-T_Project_Restaurant_management\n")
    r_gh_url.bold = True
    r_gh_url.underline = True
    r_gh_url.font.size = Pt(10)
    r_gh_url.font.color.rgb = SECONDARY

    r_gh_sub = p_gh.add_run("Local Server URL: http://localhost:5001  |  REST API Base: http://localhost:5001/api")
    r_gh_sub.font.size = Pt(8.5)
    r_gh_sub.font.color.rgb = DARK

    # -------------------------------------------------------------------------
    # SECTION 1: EXECUTIVE SUMMARY
    # -------------------------------------------------------------------------
    doc.add_page_break()
    p_s1 = doc.add_paragraph()
    r_s1 = p_s1.add_run("1. Executive Summary & Problem Overview")
    r_s1.bold = True
    r_s1.font.size = Pt(13)
    r_s1.font.color.rgb = PRIMARY
    p_s1.paragraph_format.space_after = Pt(4)

    p_body = doc.add_paragraph()
    p_body.add_run(
        "Modern multi-branch restaurant establishments face severe operational bottlenecks when relying on disparate, "
        "disconnected tools for table bookings, dynamic food order processing, itemized billing, and kitchen routing. "
        "Standard standalone software often fails to enforce strict business invariants—such as preventing table overbooking, "
        "blocking unauthorized order status jumps, and computing unalterable server-side financial calculations.\n\n"
        "DineFlow is an enterprise-grade Restaurant Management and Table Reservation platform engineered strictly adhering "
        "to the Model-View-Controller (MVC) architectural pattern. It eliminates human coordination errors by introducing "
        "an automated table conflict detection engine, a finite state machine for kitchen queues, and server-controlled itemized billing."
    )
    p_body.paragraph_format.space_after = Pt(8)

    p_roles = doc.add_paragraph()
    r_r_title = p_roles.add_run("Role-Based Access Control (RBAC) User Personas:\n")
    r_r_title.bold = True
    r_r_title.font.color.rgb = SECONDARY

    p_roles.add_run("• Customer: Browse branch menus, check real-time table availability, make/cancel reservations, place dine-in/takeaway food orders, view itemized bills, and submit star ratings.\n")
    p_roles.add_run("• Kitchen Staff: Real-time Kitchen Display System (KDS) 3-stage board (Placed → Preparing → Ready) with audio chimes and state advancement buttons.\n")
    p_roles.add_run("• Branch Manager: Menu management, stock toggling, sales aggregations, popular dishes ranking, and peak hours analysis.\n")
    p_roles.add_run("• System Administrator: Multi-branch CRUD, table inventory allocations, system-wide revenue reports, and platform oversight.")
    p_roles.paragraph_format.space_after = Pt(12)

    # -------------------------------------------------------------------------
    # SECTION 2: SYSTEM ARCHITECTURE & TECH STACK
    # -------------------------------------------------------------------------
    p_s2 = doc.add_paragraph()
    r_s2 = p_s2.add_run("2. System Architecture & Technology Stack")
    r_s2.bold = True
    r_s2.font.size = Pt(13)
    r_s2.font.color.rgb = PRIMARY
    p_s2.paragraph_format.space_after = Pt(4)

    tech_tbl = doc.add_table(rows=8, cols=3)
    tech_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tech_tbl, "CBD5E1")

    t_headers = ["Component Layer", "Technology / Framework", "Purpose & Implementation Specifics"]
    for j, h in enumerate(t_headers):
        cell = tech_tbl.rows[0].cells[j]
        set_cell_background(cell, "0284C7")
        set_cell_margins(cell, 80, 80, 100, 100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    tech_items = [
        ("Backend Runtime", "Node.js (v16+) & Express (v4.21.0)", "REST API service, routing, middleware chaining, static client serving"),
        ("Database & ODM", "MongoDB & Mongoose (v8.6.0)", "Normalized document storage, compound indexing, pre-save hooks"),
        ("Authentication", "JWT (jsonwebtoken) & bcryptjs (12 rounds)", "Stateless token auth and secure salted password hashing"),
        ("Request Validation", "Joi (v17.13.3) Middleware", "Strict schema validation for all incoming request payloads & query params"),
        ("Logging & CORS", "Morgan & CORS", "HTTP request logging and cross-origin resource access control"),
        ("Frontend Client", "HTML5, CSS3, JS ES6+, Bootstrap 5", "Dark glassmorphism UI with live cart drawer, booking flow, and KDS board"),
        ("Zero-Config DB", "mongodb-memory-server", "Automated embedded MongoDB fallback for instant zero-dependency evaluation")
    ]

    for i, (layer, tech, desc) in enumerate(tech_items):
        row = tech_tbl.rows[i + 1]
        bg = "FFFFFF" if i % 2 == 0 else "F8FAFC"
        for j, text in enumerate([layer, tech, desc]):
            cell = row.cells[j]
            set_cell_background(cell, bg)
            set_cell_margins(cell, 60, 60, 80, 80)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            if j == 0:
                r.bold = True
            r.font.size = Pt(8)
            r.font.color.rgb = DARK

    # Widths
    for row in tech_tbl.rows:
        row.cells[0].width = Inches(1.3)
        row.cells[1].width = Inches(2.2)
        row.cells[2].width = Inches(3.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # -------------------------------------------------------------------------
    # SECTION 3: DATABASE DESIGN & MONGOOSE SCHEMAS
    # -------------------------------------------------------------------------
    doc.add_page_break()
    p_s3 = doc.add_paragraph()
    r_s3 = p_s3.add_run("3. Database Design & Mongoose Schemas (All 7 Models)")
    r_s3.bold = True
    r_s3.font.size = Pt(13)
    r_s3.font.color.rgb = PRIMARY
    p_s3.paragraph_format.space_after = Pt(4)

    p_s3_desc = doc.add_paragraph()
    p_s3_desc.add_run(
        "The database design consists of 7 normalized collections linked via ObjectId references, "
        "enforced with compound indexes for performance and business validation:"
    )
    p_s3_desc.paragraph_format.space_after = Pt(6)

    sch_tbl = doc.add_table(rows=8, cols=3)
    sch_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(sch_tbl, "CBD5E1")

    s_headers = ["Model Name", "Key Attributes & Types", "Indexes, Constraints & Business Rules"]
    for j, h in enumerate(s_headers):
        cell = sch_tbl.rows[0].cells[j]
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, 80, 80, 100, 100)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.size = Pt(8.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    sch_items = [
        ("User", "name (Str), email (Str), passwordHash (Str), role (Enum: customer/kitchen/manager/admin)", "Unique email; bcrypt 12-round hashing hook; password stripped on toJSON serialization"),
        ("Branch", "name (Str), address (Str), seatingCapacity (Num), isActive (Bool)", "Unique branch naming; active status query index"),
        ("Table", "branchId (Ref: Branch), tableNumber (Num), capacity (Num), isActive (Bool)", "Compound unique index { branchId: 1, tableNumber: 1 } prevents duplicate table numbers"),
        ("MenuItem", "branchId (Ref: Branch), name (Str), category (Enum 8 types), price (Num), isAvailable (Bool)", "Category enum (appetizer, main_course, dessert, beverage, side, soup, salad, special); compound index"),
        ("Reservation", "customerId (Ref), branchId (Ref), tableId (Ref), dateTime (Date), duration (Num), partySize (Num), status (Enum)", "Index on tableId + dateTime + status for real-time overlap conflict queries; status enum"),
        ("Order", "orderNumber (Str), customerId (Ref), branchId (Ref), items [orderItemSchema], billing {}, orderType, status", "Unique orderNumber (ORD-<ts>-<rand>); embedded billing subdocument; status workflow state enum"),
        ("Feedback", "orderId (Ref: Order), customerId (Ref: User), rating (Num 1-5), comment (Str)", "Compound unique index { orderId: 1 } strictly enforces 1 review per completed order")
    ]

    for i, (name, attrs, idxs) in enumerate(sch_items):
        row = sch_tbl.rows[i + 1]
        bg = "FFFFFF" if i % 2 == 0 else "F8FAFC"
        for j, text in enumerate([name, attrs, idxs]):
            cell = row.cells[j]
            set_cell_background(cell, bg)
            set_cell_margins(cell, 60, 60, 80, 80)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            if j == 0:
                r.bold = True
            r.font.size = Pt(8)
            r.font.color.rgb = DARK

    for row in sch_tbl.rows:
        row.cells[0].width = Inches(1.1)
        row.cells[1].width = Inches(3.0)
        row.cells[2].width = Inches(2.9)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # -------------------------------------------------------------------------
    # SECTION 4: FUNCTIONAL MODULES MATRIX
    # -------------------------------------------------------------------------
    p_s4 = doc.add_paragraph()
    r_s4 = p_s4.add_run("4. Implemented Functional Modules (All 13 Modules)")
    r_s4.bold = True
    r_s4.font.size = Pt(13)
    r_s4.font.color.rgb = PRIMARY
    p_s4.paragraph_format.space_after = Pt(4)

    mod_tbl = doc.add_table(rows=14, cols=4)
    mod_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(mod_tbl, "CBD5E1")

    m_headers = ["#", "Module Name", "Primary Role", "Implementation & Validation Logic"]
    for j, h in enumerate(m_headers):
        cell = mod_tbl.rows[0].cells[j]
        set_cell_background(cell, "0284C7")
        set_cell_margins(cell, 60, 60, 80, 80)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.size = Pt(8)
        r.font.color.rgb = RGBColor(255, 255, 255)

    modules_data = [
        ("1", "User Authentication & RBAC", "All Roles", "JWT Bearer token generation, bcrypt 12-round salted hashing, role authorization middleware (customer, kitchen, manager, admin)."),
        ("2", "Branch Management", "Admin", "CRUD operations on physical restaurant branches with seating capacity tracking and active status toggling."),
        ("3", "Table Inventory Management", "Admin", "Table allocations per branch with seating capacities; compound unique index prevents duplicate table numbers."),
        ("4", "Menu & Category Management", "Admin, Manager", "Branch-specific dish catalogs across 8 categories; live stock availability toggling and text search."),
        ("5", "Real-Time Table Reservation", "Customer", "Automated table conflict/overlap detection algorithm: (start < existEnd && end > existStart). Party size capacity check."),
        ("6", "Food Ordering System", "Customer", "Dine-in and takeaway food ordering with live stock availability and branch affinity validation."),
        ("7", "Order State Machine", "Kitchen, Manager", "Strictly enforced state transitions: placed → preparing → ready → served / delivered. Cancel only allowed in placed state."),
        ("8", "Kitchen Display (KDS)", "Kitchen Staff", "3-column live queue board, 10-second auto-refresh, and synthesized Web Audio chime alert on new incoming orders."),
        ("9", "Itemized Billing Engine", "System Engine", "Server-side deterministic calculation: Subtotal + 5% Tax + 10% Service Charge = Grand Total. Zero client trust."),
        ("10", "Cancellation Policy", "Customer, Admin", "1-hour advance notice policy enforced on customer cancellations; admin retains override authority."),
        ("11", "Order History & Tracking", "Customer", "Chronological itemized invoices, real-time status badges, and receipt downloads."),
        ("12", "Feedback & Reviews", "Customer", "1-5 star ratings & reviews allowed exclusively on completed orders (served/delivered); duplicate reviews blocked."),
        ("13", "Manager Analytics", "Manager, Admin", "MongoDB aggregation pipelines: Revenue by branch, top 5 dishes ranking, peak activity hours, and KPI overview.")
    ]

    for i, (num, name, role, logic) in enumerate(modules_data):
        row = mod_tbl.rows[i + 1]
        bg = "FFFFFF" if i % 2 == 0 else "F8FAFC"
        for j, text in enumerate([num, name, role, logic]):
            cell = row.cells[j]
            set_cell_background(cell, bg)
            set_cell_margins(cell, 40, 40, 60, 60)
            p = cell.paragraphs[0]
            if j == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(text)
            if j == 1:
                r.bold = True
            r.font.size = Pt(7.5)
            r.font.color.rgb = DARK

    for row in mod_tbl.rows:
        row.cells[0].width = Inches(0.4)
        row.cells[1].width = Inches(1.8)
        row.cells[2].width = Inches(1.0)
        row.cells[3].width = Inches(3.8)

    # -------------------------------------------------------------------------
    # SECTION 5: BUSINESS RULES & REST API REFERENCE
    # -------------------------------------------------------------------------
    doc.add_page_break()
    p_s5 = doc.add_paragraph()
    r_s5 = p_s5.add_run("5. Core Business Rules & Validation Logic")
    r_s5.bold = True
    r_s5.font.size = Pt(13)
    r_s5.font.color.rgb = PRIMARY
    p_s5.paragraph_format.space_after = Pt(4)

    p_br = doc.add_paragraph()
    p_br.add_run("1. Table Double-Booking Prevention: ").bold = True
    p_br.add_run("Overlap query: (newStart < existingEnd) && (newEnd > existingStart). Rejects conflicting slots with 409 RESERVATION_CONFLICT.\n")
    p_br.add_run("2. Finite Order State Machine: ").bold = True
    p_br.add_run("Transitions strictly follow: placed → [preparing, cancelled], preparing → [ready], ready → [served, delivered]. Skips return 409 INVALID_STATUS_TRANSITION.\n")
    p_br.add_run("3. 1-Hour Cancellation Window: ").bold = True
    p_br.add_run("Customers cannot cancel reservations less than 60 minutes before scheduled booking time (returns 409 CANCELLATION_POLICY).\n")
    p_br.add_run("4. Server-Side Itemized Billing: ").bold = True
    p_br.add_run("Deterministic math computed exclusively on the server in utils/calculations.js: Subtotal + 5% Tax + 10% Service Charge.")
    p_br.paragraph_format.space_after = Pt(10)

    p_s6 = doc.add_paragraph()
    r_s6 = p_s6.add_run("6. Key REST API Endpoint Reference Catalog")
    r_s6.bold = True
    r_s6.font.size = Pt(13)
    r_s6.font.color.rgb = PRIMARY
    p_s6.paragraph_format.space_after = Pt(4)

    api_tbl = doc.add_table(rows=13, cols=4)
    api_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(api_tbl, "CBD5E1")

    a_headers = ["Endpoint Route", "Method", "Auth Guard", "Description & Response Summary"]
    for j, h in enumerate(a_headers):
        cell = api_tbl.rows[0].cells[j]
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, 60, 60, 80, 80)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.size = Pt(8)
        r.font.color.rgb = RGBColor(255, 255, 255)

    api_routes = [
        ("/api/auth/register", "POST", "Public", "Registers new user; returns JWT token & user profile"),
        ("/api/auth/login", "POST", "Public", "Authenticates credentials; returns JWT bearer token"),
        ("/api/branches", "GET / POST", "Public / Admin", "Lists active branches / Creates new restaurant branch"),
        ("/api/tables/available", "GET", "Authenticated", "Queries available tables matching branch, date, time, party size"),
        ("/api/menu", "GET / POST", "Public / Mgr, Admin", "Catalog search & category filter / Creates menu dish item"),
        ("/api/reservations", "GET / POST", "Authenticated", "Lists bookings / Books table with overlap conflict validation"),
        ("/api/reservations/:id", "DELETE", "Customer, Admin", "Cancels reservation enforcing 1-hour notice policy"),
        ("/api/orders", "POST / GET", "Authenticated", "Places food order with server billing / Lists order history"),
        ("/api/orders/:id/status", "PUT", "Kitchen, Admin", "Advances order workflow state (placed → preparing → ready)"),
        ("/api/kitchen/orders", "GET", "Kitchen, Admin", "Live real-time queue for placed, preparing, and ready orders"),
        ("/api/feedback", "POST / GET", "Customer", "Submits 1-5 star review for completed (served/delivered) orders"),
        ("/api/manager/reports/sales", "GET", "Manager, Admin", "Aggregates revenue, order counts, and avg values by branch")
    ]

    for i, (route, method, auth, desc) in enumerate(api_routes):
        row = api_tbl.rows[i + 1]
        bg = "FFFFFF" if i % 2 == 0 else "F8FAFC"
        for j, text in enumerate([route, method, auth, desc]):
            cell = row.cells[j]
            set_cell_background(cell, bg)
            set_cell_margins(cell, 40, 40, 60, 60)
            p = cell.paragraphs[0]
            if j == 1:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(text)
            if j == 0:
                r.font.name = "Courier New"
                r.font.size = Pt(7.5)
                r.font.color.rgb = RGBColor(109, 40, 217)
            else:
                r.font.size = Pt(7.5)
                r.font.color.rgb = DARK

    for row in api_tbl.rows:
        row.cells[0].width = Inches(1.8)
        row.cells[1].width = Inches(0.9)
        row.cells[2].width = Inches(1.1)
        row.cells[3].width = Inches(3.2)

    # -------------------------------------------------------------------------
    # SECTION 7: UI SHOWCASE & SCREENSHOTS
    # -------------------------------------------------------------------------
    doc.add_page_break()
    p_s7 = doc.add_paragraph()
    r_s7 = p_s7.add_run("7. Verified Application UI Showcase")
    r_s7.bold = True
    r_s7.font.size = Pt(13)
    r_s7.font.color.rgb = PRIMARY
    p_s7.paragraph_format.space_after = Pt(4)

    artifact_dir = "/Users/alan/.gemini/antigravity-ide/brain/10a1a71a-a29e-42ad-902d-7c15b1051d64"
    img_dash = os.path.join(artifact_dir, "admin_dashboard_1789037670262.png")
    img_kds = os.path.join(artifact_dir, "kitchen_display_1789037841415.png")
    img_menu = os.path.join(artifact_dir, "menu_page_1789037749564.png")
    img_orders = os.path.join(artifact_dir, "orders_page_1789037814606.png")

    if os.path.exists(img_dash) and os.path.exists(img_kds):
        doc.add_picture(img_dash, width=Inches(6.2))
        p_cap1 = doc.add_paragraph("Figure 1: Admin Analytics & Revenue Dashboard (Live KPI Counters, Charts, and Tabbed Views)")
        p_cap1.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap1.runs[0].font.size = Pt(8)
        p_cap1.runs[0].font.italic = True
        p_cap1.runs[0].font.color.rgb = RGBColor(71, 85, 105)

        doc.add_picture(img_kds, width=Inches(6.2))
        p_cap2 = doc.add_paragraph("Figure 2: Real-Time 3-Stage Kitchen Display System (KDS) Board with Status Transitions")
        p_cap2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap2.runs[0].font.size = Pt(8)
        p_cap2.runs[0].font.italic = True
        p_cap2.runs[0].font.color.rgb = RGBColor(71, 85, 105)

    doc.add_page_break()
    if os.path.exists(img_menu) and os.path.exists(img_orders):
        doc.add_picture(img_menu, width=Inches(6.2))
        p_cap3 = doc.add_paragraph("Figure 3: Interactive Food Menu Catalog with Branch Filters, Category Pills, and Live Cart Drawer")
        p_cap3.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap3.runs[0].font.size = Pt(8)
        p_cap3.runs[0].font.italic = True
        p_cap3.runs[0].font.color.rgb = RGBColor(71, 85, 105)

        doc.add_picture(img_orders, width=Inches(6.2))
        p_cap4 = doc.add_paragraph("Figure 4: Order History, Itemized Billing Invoices, and Customer Experience Feedback Modal")
        p_cap4.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap4.runs[0].font.size = Pt(8)
        p_cap4.runs[0].font.italic = True
        p_cap4.runs[0].font.color.rgb = RGBColor(71, 85, 105)

    # -------------------------------------------------------------------------
    # SECTION 8: SETUP & DEMO ACCOUNTS
    # -------------------------------------------------------------------------
    p_s8 = doc.add_paragraph()
    r_s8 = p_s8.add_run("8. Setup, Execution Guide & Pre-Configured Demo Accounts")
    r_s8.bold = True
    r_s8.font.size = Pt(13)
    r_s8.font.color.rgb = PRIMARY
    p_s8.paragraph_format.space_after = Pt(4)

    p_run = doc.add_paragraph()
    p_run.add_run("Step 1: Install Dependencies: ").bold = True
    p_run.add_run("npm install\n")
    p_run.add_run("Step 2: Seed Demo Database: ").bold = True
    p_run.add_run("npm run seed  (Populates realistic branches, tables, menu, reservations, orders, feedback)\n")
    p_run.add_run("Step 3: Start Application Server: ").bold = True
    p_run.add_run("npm start  (Live at http://localhost:5001)")
    p_run.paragraph_format.space_after = Pt(8)

    demo_tbl = doc.add_table(rows=6, cols=4)
    demo_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(demo_tbl, "CBD5E1")

    d_headers = ["Role", "Email Address", "Password", "Accessible Features & Capabilities"]
    for j, h in enumerate(d_headers):
        cell = demo_tbl.rows[0].cells[j]
        set_cell_background(cell, "0284C7")
        set_cell_margins(cell, 60, 60, 80, 80)
        p = cell.paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.size = Pt(8)
        r.font.color.rgb = RGBColor(255, 255, 255)

    demo_accounts = [
        ("Admin", "admin@dineflow.com", "admin123", "Full dashboard, branch/table CRUD, sales analytics, menu & orders"),
        ("Manager", "manager@dineflow.com", "manager123", "Sales reports, popular dishes ranking, peak hours, KDS access"),
        ("Kitchen Staff", "kitchen@dineflow.com", "kitchen123", "Live Kitchen Display System (KDS) & order queue advancement"),
        ("Customer 1", "customer@dineflow.com", "customer123", "Table reservation booking, food cart ordering, order history, reviews"),
        ("Customer 2", "priya@dineflow.com", "customer123", "Table reservation booking, food cart ordering, order history, reviews")
    ]

    for i, (role, email, pwd, caps) in enumerate(demo_accounts):
        row = demo_tbl.rows[i + 1]
        bg = "FFFFFF" if i % 2 == 0 else "F8FAFC"
        for j, text in enumerate([role, email, pwd, caps]):
            cell = row.cells[j]
            set_cell_background(cell, bg)
            set_cell_margins(cell, 40, 40, 60, 60)
            p = cell.paragraphs[0]
            r = p.add_run(text)
            if j == 0:
                r.bold = True
            if j in [1, 2]:
                r.font.name = "Courier New"
            r.font.size = Pt(8)
            r.font.color.rgb = DARK

    for row in demo_tbl.rows:
        row.cells[0].width = Inches(1.0)
        row.cells[1].width = Inches(2.0)
        row.cells[2].width = Inches(1.0)
        row.cells[3].width = Inches(3.0)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Formal Submission Sign-off Box
    so_tbl = doc.add_table(rows=1, cols=1)
    so_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    c_so = so_tbl.rows[0].cells[0]
    c_so.width = Inches(7.0)
    set_cell_background(c_so, "F8FAFC")
    set_cell_margins(c_so, 100, 100, 150, 150)
    
    p_so = c_so.paragraphs[0]
    r_so1 = p_so.add_run("Submitted for Continuous Internal Assessment - 3 (CIA-3)\n")
    r_so1.bold = True
    r_so1.font.size = Pt(9.5)
    r_so1.font.color.rgb = PRIMARY

    p_so.add_run("Department of Computer Science • Christ University • Academic Year 2026\n")
    p_so.add_run("Official GitHub Repository: https://github.com/Alan-rs-hub/L-T_Project_Restaurant_management")
    p_so.runs[1].font.size = Pt(8.5)
    p_so.runs[1].font.color.rgb = DARK
    p_so.runs[2].font.size = Pt(8.5)
    p_so.runs[2].font.color.rgb = SECONDARY

    # Save
    doc.save(filename)
    print(f"Word document successfully generated: {filename}")

if __name__ == '__main__':
    out_file = "P07_Team_Batch47.docx"
    if len(sys.argv) > 1:
        out_file = sys.argv[1]
    build_docx(out_file)
    if out_file == "P07_Team_Batch47.docx":
        build_docx("CIA3_Project_Report_DineFlow.docx")
