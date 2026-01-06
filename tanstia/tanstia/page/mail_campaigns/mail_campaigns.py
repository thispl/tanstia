import frappe
from frappe import _

@frappe.whitelist()
def get_data(type_new=None, region=None, district=None, association_category=None, association_name=None):
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
        fields=["name","type","association_category","region","status","member_id",'status','member_name','type','date_and_year_of_affiliation']
    )

    if not records:
        return "<p class='text-muted'>No records found</p>"

    html = """
    <style>
        .scrollable-table-container {
            max-height: 600px;
            overflow-y: auto;
            border: 1px solid #ccc;
        }
        table {
            width: 100%;
            border-collapse: collapse !important;
        }
        table, th, td {
            border: 1px solid black !important;
        }
        thead th {
            background-color: #0F1568 !important;
            color: white !important;
            text-align: center;
            font-size: 14px;
            position: sticky;
            top: 0;
            z-index: 2;
        }
        
    </style>

    <div class="scrollable-table-container">
        <table class="table-hover mb-0" id="members-table">
            <thead>
                <tr>
                    <th>
                        <input type="checkbox" id="select-all">
                    </th>
                    <th>S.No</th>
                    <th>Member ID</th>
                    <th>Member Name</th>
                    <th>Association</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Type</th>
                    <th>Region</th>
                    <th>Office Bearer</th>
                    <th>Elected <br>EC Members</th>
                    <th>Email</th>
                    
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

        for row in child_doc:
            html += f"""
                <tr>
                    <td style="text-align:center;">
                        <input type="checkbox" class="row-checkbox"
                               data-email="{row.email or ''}">
                    </td>
                    <td style="text-align:center;">{sno}</td>
                    <td>{parent.member_id or ''}</td>
                    <td>{parent.member_name or ''}</td>
                    <td> <a href="/app/association/{parent.name or '' }">
                        { parent.name or '' }
                    </a></td>
                    
                    <td>{row.designation or ''}</td>
                    <td>{parent.status or ''}</td>
                    <td>{parent.type or ''}</td>
                    <td>{parent.region or ''}</td>
                    <td>{row.office_bearer or ''}</td>
                    
                    <td>{parent.elected_ec_members_size or ''}</td>
                    <td>{row.email or ''}</td>
                </tr>
            """
            sno += 1
    
        office_bearers = frappe.db.get_all(
            'Office Bearer Details',
            {
                'parentfield': 'office_bearers',
                'parenttype': 'EC Office Bearer'
            },
            ['office_bearer', 'designation', 'email', 'contact_number']
        )

        for row in office_bearers:
            html += f"""
                <tr>
                    <td style="text-align:center;">
                        <input type="checkbox" class="row-checkbox"
                               data-email="{row.email or ''}">
                    </td>
                    <td style="text-align:center;">{sno}</td>
                    <td></td>
                    <td>{parent.member_name or ''}</td>
                    <td></td>
                    
                    <td>{row.designation or ''}</td>
                    <td></td>
                    <td></td>
                    <td>{row.office_bearer or ''}</td>
                    <td></td>
                    <td></td>
                    <td>{row.email or ''}</td>

                </tr>
            """
            sno += 1
    
        records = frappe.db.get_all(
        "Association",
        filters=filters,
        fields=["name"]
    )
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
