# Copyright (c) 2025, abdulla.pi@groupteampro.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now


class Association(Document):
	def before_insert(self):
		if self.association_category and self.district:
			if self.association_category =="Unit Member":
				self.association=f"{self.district}-{self.association_category}-{self.member_name}"
			else:
				self.association=f"{self.district}-{self.association_category}"
	def before_save(self):
		if self.status and self.has_value_changed("status"):
			self.status_updated_on = now()
	

	def validate(self):
		parts = []
		if self.address_line_1:
			parts.append(self.address_line_1)

		if self.address_line_2:
			parts.append(self.address_line_2)

		if self.district:
			parts.append(self.district)

		if self.pin_code:
			parts.append(self.pin_code)

		self.address = "\n".join(parts)
		if self.office_bearers and self.archived ==1:
			self.archived =0
			# Create EC Membership document
			ec_mem_doc = frappe.new_doc("EC Membership")
			ec_mem_doc.association_category = self.association_category
			ec_mem_doc.association_status = "Live"
			ec_mem_doc.region = self.region
			ec_mem_doc.association_name = self.name
			ec_mem_doc.association = self.association
			ec_mem_doc.elected_ec_member = self.elected_ec_members_size

			# Check if EC Office Bearer exists
			ec_ob_doc = None
			is_ec = False
			new_row = False
			is_new_ob = False
			if not frappe.db.exists("EC Office Bearer", {"tenure": self.tenure}):
				ec_ob_doc = frappe.new_doc("EC Office Bearer")
				ec_ob_doc.from_date = self.from_date
				ec_ob_doc.to_date = self.to_date
				ec_ob_doc.tenure = self.tenure
				
				
			else:
				ec_ob_doc = frappe.get_doc("EC Office Bearer", {"tenure": self.tenure})

			# Loop through office bearers
			for row in self.office_bearers:

				if row.type == "EC":
					is_ec = True
					ec_mem_doc.append("elected_ec_office_bearers", {
						"office_bearer": row.office_bearer,
						"contact_number": row.contact_number,
						"email": row.email,
						"from_date": row.from_date,
						"to_date": row.to_date,
					})

				elif row.type == "OB":
					is_new_ob = True
					ec_ob_doc.append("office_bearers", {
						"office_bearer": row.office_bearer,
						"designation": row.designation,
						"contact_number": row.contact_number,
						"email": row.email,
						"from_date": row.from_date,
						"to_date": row.to_date,
						"tenure": row.tenure
					})

			# Insert EC Membership
			if is_ec:
				ec_mem_doc.insert(ignore_permissions=True)

			# Insert EC Office Bearer only if new
			if is_new_ob:
				ec_ob_doc.save(ignore_permissions=True)