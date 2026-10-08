import frappe

from tanstia.tanstia.page.subscription_dashboa.subscription_dashboa import (
	UNIT_MEMBER_CONDITION,
)


@frappe.whitelist()
def get_association_rows(kind, category=None):
	# Rows backing each dashboard card, rendered in-page instead of routing to
	# the Association list. Conditions mirror get_subscription_pending_summary.
	conditions = []
	values = {}

	if kind == "pending":
		conditions.append("subscription_pending = 1")
	elif kind == "paid":
		conditions.append("subscription_pending = 0")
	elif kind == "doc_pending":
		conditions.append("status = 'Active' AND document_submission = 'No'")
	else:
		frappe.throw(frappe._("Invalid detail type: {0}").format(kind))

	if kind in ("pending", "paid"):
		conditions.append(UNIT_MEMBER_CONDITION)

	if category == "Uncategorized":
		conditions.append("(association_category IS NULL OR association_category = '')")
	elif category:
		conditions.append("association_category = %(category)s")
		values["category"] = category

	return frappe.db.sql(
		f"""
		SELECT
			name,
			member_name,
			association,
			company,
			type,
			association_category,
			region,
			district,
			status,
			next_renewal_updating_date,
			next_subscription_payment_date,
			document_submission
		FROM `tabAssociation`
		WHERE {" AND ".join(conditions)}
		ORDER BY association
		""",
		values=values,
		as_dict=True,
	)
