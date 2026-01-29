# Copyright (c) 2025, abdulla.pi@groupteampro.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class ECMembership(Document):

    def on_submit(self):

        # Appointed EC Members
        if self.appointed_ec_members:
            for row in self.appointed_ec_members:
                new_doc = frappe.new_doc('Office Bearers')
                new_doc.office_bearer = row.office_bearer
                new_doc.email = row.email
                new_doc.contact_number = row.contact_number
                new_doc.appointed = 1
                new_doc.insert(ignore_permissions=True)

        # Special Invitees EC Members
        if self.special_invitees_ec_members:
            for row in self.special_invitees_ec_members:
                new_doc = frappe.new_doc('Office Bearers')
                new_doc.office_bearer = row.office_bearer
                new_doc.email = row.email
                new_doc.contact_number = row.contact_number
                new_doc.appointed = 0
                new_doc.insert(ignore_permissions=True)

@frappe.whitelist()
def get_appointed_ec_members():
    return frappe.get_all(
        "EC Member Details",
        fields=["office_bearer", "email", "contact_number"],
        filters={
            "parentfield": ["in", ["elected_ec_office_bearers","appointed_ec_members", "special_invitees_ec_members"]],
            "parenttype": "EC Membership"
        }
    )

