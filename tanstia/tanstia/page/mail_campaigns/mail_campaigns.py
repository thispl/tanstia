import frappe
from frappe import _

TABLE_HEAD_STYLE = """
    <style>
        .scrollable-table-container {
            max-height: 600px;
            overflow: auto;
            border: 1px solid #ccc;
        }
        .scrollable-table-container table {
            width: 100%;
            border-collapse: collapse !important;
            table-layout: fixed;
        }
        .scrollable-table-container th,
        .scrollable-table-container td {
            border: 1px solid black !important;
            padding: 6px 10px;
            vertical-align: middle;
            font-size: 13px;
            overflow-wrap: anywhere;
        }
        .scrollable-table-container thead th {
            background-color: #0F1568 !important;
            color: white !important;
            text-align: center;
            font-size: 14px;
            position: sticky;
            top: 0;
            z-index: 2;
        }
        .scrollable-table-container tbody td {
            text-align: left;
        }
    </style>
"""

TABLE_CLOSE = """
            </tbody>
        </table>
    </div>

    <script>
        (function () {
            const selectAll = document.getElementById("select-all");
            const rowCheckboxes = document.querySelectorAll(".row-checkbox");

            selectAll.addEventListener("change", function () {
                rowCheckboxes.forEach(cb => cb.checked = selectAll.checked);
            });

            rowCheckboxes.forEach(cb => {
                cb.addEventListener("change", function () {
                    selectAll.checked =
                        document.querySelectorAll(".row-checkbox:checked").length === rowCheckboxes.length;
                });
            });
        })();
    </script>
"""

@frappe.whitelist()
def get_data(type_new=None, region=None, district=None, association_category=None, association_name=None):
    if type_new == "EC Member":
        return get_ec_member_data(region, district, association_category, association_name)
    if type_new == "Office Bearer":
        return get_office_bearer_data()

    filters = {'docstatus':['!=',2]}
    if type_new:
        filters["type"] = type_new
    if region:
        filters["region"] = region
    if district:
        filters["district"] = district
    if association_category:
        filters["association_category"] = association_category
    if association_name:
        filters["name"] = association_name
    records = frappe.db.get_all(
        "Association",
        filters=filters,
        fields=["name", "association", "member_id", "district"]
    )

    if not records:
        return "<p class='text-muted'>No records found</p>"

    contacts = frappe.db.get_all(
        'Contact Details',
        {
            'parent': ['in', [r.name for r in records]],
            'parentfield': 'contact_details',
            'parenttype': 'Association'
        },
        ['parent', 'contact_number', 'email'],
        order_by='idx'
    )
    contacts_by_parent = {}
    for contact in contacts:
        contacts_by_parent.setdefault(contact.parent, []).append(contact)

    html = TABLE_HEAD_STYLE + """
    <div class="scrollable-table-container">
        <table class="table-hover mb-0" id="members-table">
            <colgroup>
                <col style="width:36px">
                <col style="width:55px">
                <col style="width:135px">
                <col>
                <col style="width:100px">
                <col style="width:140px">
                <col style="width:130px">
                <col style="width:120px">
                <col style="width:180px">
                <col style="width:120px">
                <col>
            </colgroup>
            <thead>
                <tr>
                    <th>
                        <input type="checkbox" id="select-all">
                    </th>
                    <th>S.No</th>
                    <th>Member ID</th>
                    <th>Association Name</th>
                    <th>District Name</th>
                    <th>Office Bearer</th>
                    <th>Position</th>
                    <th>OB Contact Number</th>
                    <th>OB Mail</th>
                    <th>Contact Number</th>
                    <th>Mail</th>
                </tr>
            </thead>
            <tbody>
    """

    sno = 1
    for parent in records:
        child_doc = frappe.db.get_all(
            'Office Bearer Details',
            {
                'parent': parent.name,
                'parentfield': 'office_bearers',
                'parenttype': 'Association'
            },
            ['office_bearer', 'designation', 'email', 'contact_number']
        )

        contact_rows = contacts_by_parent.get(parent.name, [])
        contact_numbers = "<br>".join(c.contact_number for c in contact_rows if c.contact_number)
        contact_emails = "<br>".join(c.email for c in contact_rows if c.email)
        contact_mail = next((c.email for c in contact_rows if c.email), "")

        if not child_doc and not contact_mail:
            continue

        for row in child_doc or [frappe._dict()]:
            send_to = contact_mail or row.email or ""
            html += f"""
                <tr>
                    <td style="text-align:center;">
                        <input type="checkbox" class="row-checkbox"
                               data-email="{send_to}">
                    </td>
                    <td style="text-align:center;">{sno}</td>
                    <td>{parent.member_id or ''}</td>
                    <td> <a href="/app/association/{parent.name or '' }">
                        { parent.association or parent.name or '' }
                    </a></td>
                    <td>{parent.district or ''}</td>
                    <td>{row.office_bearer or ''}</td>
                    <td>{row.designation or ''}</td>
                    <td>{row.contact_number or ''}</td>
                    <td>{row.email or ''}</td>
                    <td>{contact_numbers}</td>
                    <td>{contact_emails}</td>
                </tr>
            """
            sno += 1

    html += """
            </tbody>
        </table>
    </div>

    <script>
        (function () {
            const selectAll = document.getElementById("select-all");
            const rowCheckboxes = document.querySelectorAll(".row-checkbox");

            selectAll.addEventListener("change", function () {
                rowCheckboxes.forEach(cb => cb.checked = selectAll.checked);
            });

            rowCheckboxes.forEach(cb => {
                cb.addEventListener("change", function () {
                    selectAll.checked =
                        document.querySelectorAll(".row-checkbox:checked").length === rowCheckboxes.length;
                });
            });
        })();
    </script>
    """

    return html


def get_ec_member_data(region=None, district=None, association_category=None, association_name=None):
    filters = {'docstatus': ['!=', 2]}
    if region:
        filters["region"] = region
    if district:
        filters["district"] = district
    if association_category:
        filters["association_category"] = association_category
    if association_name:
        filters["association_name"] = association_name

    records = frappe.db.get_all(
        "EC Membership",
        filters=filters,
        fields=["name", "association_name", "association", "association_category", "region", "district"]
    )

    if not records:
        return "<p class='text-muted'>No records found</p>"

    html = TABLE_HEAD_STYLE + """
    <div class="scrollable-table-container">
        <table class="table-hover mb-0" id="members-table">
            <colgroup>
                <col style="width:36px">
                <col style="width:55px">
                <col style="width:130px">
                <col>
                <col style="width:140px">
                <col>
                <col style="width:120px">
                <col style="width:110px">
                <col style="width:110px">
                <col style="width:190px">
            </colgroup>
            <thead>
                <tr>
                    <th>
                        <input type="checkbox" id="select-all">
                    </th>
                    <th>S.No</th>
                    <th>EC Membership</th>
                    <th>Association</th>
                    <th>Name</th>
                    <th>Company Name</th>
                    <th>Contact Number</th>
                    <th>Region</th>
                    <th>District</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
    """

    ec_members = frappe.db.get_all(
        'EC Member Details',
        {
            'parent': ['in', [r.name for r in records]],
            'parentfield': 'elected_ec_office_bearers',
            'parenttype': 'EC Membership',
            'disabled': 0
        },
        ['parent', 'office_bearer', 'email', 'contact_number', 'company_name'],
        order_by='idx'
    )
    member_by_parent = {}
    for row in ec_members:
        member_by_parent.setdefault(row.parent, row)

    sno = 1
    for parent in records:
        row = member_by_parent.get(parent.name)
        if not row:
            continue
        html += f"""
            <tr>
                <td style="text-align:center;">
                    <input type="checkbox" class="row-checkbox"
                           data-email="{row.email or ''}">
                </td>
                <td style="text-align:center;">{sno}</td>
                <td><a href="/app/ec-membership/{parent.name or ''}">
                    {parent.name or ''}
                </a></td>
                <td>{parent.association or parent.association_name or ''}</td>
                <td>{row.office_bearer or ''}</td>
                <td>{row.company_name or ''}</td>
                <td>{row.contact_number or ''}</td>
                <td>{parent.region or ''}</td>
                <td>{parent.district or ''}</td>
                <td>{row.email or ''}</td>
            </tr>
        """
        sno += 1

    html += TABLE_CLOSE
    return html


def get_office_bearer_data():
    records = frappe.db.get_all(
        "EC Office Bearer",
        filters={'docstatus': ['!=', 2]},
        fields=["name", "tenure", "from_date", "to_date"]
    )

    if not records:
        return "<p class='text-muted'>No records found</p>"

    html = TABLE_HEAD_STYLE + """
    <div class="scrollable-table-container">
        <table class="table-hover mb-0" id="members-table">
            <colgroup>
                <col style="width:36px">
                <col style="width:55px">
                <col style="width:140px">
                <col>
                <col style="width:140px">
                <col style="width:130px">
                <col style="width:110px">
                <col style="width:190px">
            </colgroup>
            <thead>
                <tr>
                    <th>
                        <input type="checkbox" id="select-all">
                    </th>
                    <th>S.No</th>
                    <th>EC Office Bearer</th>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Contact Number</th>
                    <th>Tenure</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
    """

    sno = 1
    for parent in records:
        office_bearers = frappe.db.get_all(
            'EC Office Bearer Details',
            {
                'parent': parent.name,
                'parentfield': 'office_bearers',
                'parenttype': 'EC Office Bearer',
                'disabled': 0
            },
            ['office_bearer', 'designation', 'email', 'contact_number', 'tenure']
        )

        for row in office_bearers:
            html += f"""
                <tr>
                    <td style="text-align:center;">
                        <input type="checkbox" class="row-checkbox"
                               data-email="{row.email or ''}">
                    </td>
                    <td style="text-align:center;">{sno}</td>
                    <td><a href="/app/ec-office-bearer/{parent.name or ''}">
                        {parent.name or ''}
                    </a></td>
                    <td>{row.office_bearer or ''}</td>
                    <td>{row.designation or ''}</td>
                    <td>{row.contact_number or ''}</td>
                    <td>{row.tenure or parent.tenure or ''}</td>
                    <td>{row.email or ''}</td>
                </tr>
            """
            sno += 1

    html += TABLE_CLOSE
    return html


# @frappe.whitelist()
# def send_mail_campaign(subject, content, recipients, attachments=None):

#     if isinstance(recipients, str):
#         recipients = frappe.parse_json(recipients)

#     if isinstance(attachments, str):
#         attachments = frappe.parse_json(attachments)

#     # ✅ Build proper attachment list
#     email_attachments = []

#     if attachments:
#         for file_name in attachments:
#             file_doc = frappe.get_doc("File", file_name)

#             email_attachments.append({
#                 "fname": file_doc.file_name,
#                 "fcontent": file_doc.get_content()
#             })

#     MAX_SIZE = 500

#     unique_recipients = list(
#         {email.strip().lower() for email in recipients if email}
#     )

#     campaign = frappe.new_doc("Campaign")
#     campaign.created_by = frappe.session.user
#     campaign.triggered_email_count = len(unique_recipients)
#     campaign.in_progress_count = len(unique_recipients)

#     for i in range(0, len(unique_recipients), MAX_SIZE):
#         batch = unique_recipients[i:i + MAX_SIZE]
#         frappe.errprint(email_attachments)
#         email_queue = frappe.sendmail(
#             recipients=batch,
#             subject=subject,
#             message=content,
#             attachments=email_attachments,  
#             delayed=True
#         )

#         for email in batch:
#             campaign.append("recepients", {
#                 "email": email,
#                 "status": "Sending",
#                 "email_queue": email_queue.name
#             })

#     campaign.insert(ignore_permissions=True)
#     return campaign.name



@frappe.whitelist()
def send_mail_campaign(subject, content, recipients, attachments=None):

    # ----------------------------
    # Normalize inputs
    # ----------------------------
    if isinstance(recipients, str):
        recipients = frappe.parse_json(recipients)

    if isinstance(attachments, str):
        attachments = frappe.parse_json(attachments)

    recipients = list({e.strip().lower() for e in recipients if e})

    if not recipients:
        frappe.throw("No valid recipients found")

    # ----------------------------
    # Prepare attachments
    # ----------------------------
    mail_attachments = []

    if attachments:
        for file_name in attachments:
            file_doc = frappe.get_doc("File", file_name)

            mail_attachments.append({
                "fname": file_doc.file_name,
                "fcontent": file_doc.get_content()
            })

    # ----------------------------
    # Send in batches
    # ----------------------------
    MAX_SIZE = 500
    frappe.errprint(attachments)
    for i in range(0, len(recipients), MAX_SIZE):
        batch = recipients[i:i + MAX_SIZE]

        frappe.sendmail(
            recipients=batch,
            subject=subject,
            message=content,
            attachments=mail_attachments,
            delayed=False   
        )

    return "Email sent successfully"
