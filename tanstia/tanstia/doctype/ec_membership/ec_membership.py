# Copyright (c) 2025, abdulla.pi@groupteampro.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class ECMembership(Document):
    def validate(self):
        priorities = [
            (self.elected_ec_office_bearers, "Elected Office Bearers"),
            (self.appointed_ec_members, "Co-Option EC Member"),
            (self.special_invitees_ec_members, "Special Invitees")
        ]
        for is_present, position_name in priorities:
            if is_present:
                self.position = position_name
                break 
    def before_insert(self):
        if self.association_category =="District":
            self.naming_series = "DST-.###."
        elif self.association_category =="Industrial Estate Manufacturers Association":
            self.naming_series = "IMA-.###."
        elif self.association_category =="Product Manufacturing Association":
            self.naming_series = "PMA-.###."
        elif self.association_category =="Other Association":
            self.naming_series = "OTH-.###."
        else:
            self.naming_series = "EC-.###."

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

# @frappe.whitelist()
# def rename_ec_memberships():
#     docs = frappe.get_all("EC Membership", fields=["name", "association_category"])

#     for doc in docs:
#         if doc.association_category == "District":
#             prefix = "DST-"
#         elif doc.association_category == "Industrial Estate Manufacturers Association":
#             prefix = "IMA-"
#         elif doc.association_category == "Product Manufacturing Association":
#             prefix = "PMA-"
#         elif doc.association_category == "Other Association":
#             prefix = "OTH-"
#         else:
#             prefix = "EC-"

#         # Generate new name using naming series
#         new_name = frappe.model.naming.make_autoname(prefix + ".###")

#         try:
#             frappe.rename_doc("EC Membership", doc.name, new_name, force=True)
#             print(f"Renamed {doc.name} → {new_name}")
#         except Exception as e:
#             print(f"Failed for {doc.name}: {str(e)}")

#     frappe.db.commit()