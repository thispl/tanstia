# Copyright (c) 2025, abdulla.pi@groupteampro.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import getdate, now, today
from frappe.model.naming import getseries
from datetime import date


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
		self.subscription_pending = self.get_subscription_pending()

	def get_subscription_pending(self):
		today_date = getdate(today())
		renewal_due = (
			self.next_renewal_updating_date
			and getdate(self.next_renewal_updating_date) < date(today_date.year, 1, 1)
		)
		paid_in_advance = (
			self.next_subscription_payment_date
			and getdate(self.next_subscription_payment_date) > today_date
		)
		unit_member_ok = (
			self.association_category != "Unit Member" or self.position == "Individual"
		)
		return bool(renewal_due and not paid_in_advance and unit_member_ok)
	

	def validate(self):
		# parts = []
		# if self.address_line_1:
		# 	parts.append(self.address_line_1)

		# if self.address_line_2:
		# 	parts.append(self.address_line_2)

		# if self.district:
		# 	parts.append(self.district)

		# if self.pin_code:
		# 	parts.append(self.pin_code)

		# self.address = "\n".join(parts)
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


def update_subscription_pending_flags():
	# Recalculate Subscription Pending for every Association.
	# Runs daily via the scheduler since the result depends on the current date,
	# and is also recomputed in Association.before_save when a document changes.
	frappe.db.sql(
		"""
		UPDATE `tabAssociation`
		SET `subscription_pending` = (
			`next_renewal_updating_date` IS NOT NULL
			AND DATE(`next_renewal_updating_date`) < DATE(CONCAT(YEAR(CURDATE()), '-01-01'))
			AND (`next_subscription_payment_date` IS NULL OR `next_subscription_payment_date` <= CURDATE())
			AND (
				`association_category` IS NULL
				OR `association_category` != 'Unit Member'
				OR `position` = 'Individual'
			)
		)
		"""
	)
	frappe.db.commit()


def update_nick_name_all():

	records = frappe.get_all("Association", filters={ "association_category": ["not in", ["Industrial Estate Manufacturers Association", "District"]],},fields=["name", "company"])
	for r in records:
		if r.company:
			doc = frappe.get_doc("Association", r.name)
			doc.company = ""
			doc.save(ignore_permissions=True)

	frappe.db.commit()

	return f"{len(records)} records checked and updated"