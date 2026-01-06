# Copyright (c) 2025, abdulla.pi@groupteampro.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Association(Document):
	def before_insert(self):
		if self.association_category and self.district:
			if self.association_category =="Unit Member":
				self.association=f"{self.district}-{self.association_category}-{self.member_name}"
			else:
				self.association=f"{self.district}-{self.association_category}"

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

