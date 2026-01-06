# Copyright (c) 2025, abdulla.pi@groupteampro.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe import _

class ECOfficeBearer(Document):
	def validate(self):
		missing_fields = []

		if not self.from_date or not self.to_date:
			missing_fields.append(_("From Date / To Date"))

		if not self.office_bearers:
			missing_fields.append(_("Office Bearers"))
		else:
			if self.from_date and self.to_date:
				for row in self.office_bearers:
					if not row.from_date:
						row.from_date = self.from_date
					if not row.to_date:
						row.to_date = self.to_date


		if missing_fields:
			frappe.throw(
				title=_("Missing Fields"),
				msg=_(
					"Mandatory fields required in EC Office Bearer<br><ul>{0}</ul>"
				).format(
					"".join(f"<li>{f}</li>" for f in missing_fields)
				)
			)

