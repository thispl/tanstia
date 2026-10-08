import frappe

CATEGORY_ORDER = [
	"District",
	"Industrial Estate Manufacturers Association",
	"Product Manufacturing Association",
	"Other Association",
	"Associated Member",
	"Unit Member",
	"Uncategorized",
]

# Unit Members count towards the subscription figures only when their position
# is Individual - same rule used by Association.get_subscription_pending.
UNIT_MEMBER_CONDITION = """
	(association_category IS NULL OR association_category != 'Unit Member' OR position = 'Individual')
"""


def _category_order(row):
	try:
		return CATEGORY_ORDER.index(row.category)
	except ValueError:
		return len(CATEGORY_ORDER)


@frappe.whitelist()
def get_subscription_pending_summary():
	# Unpaid uses the same flag as the "Subscription Pending" shortcut badge on
	# the Home workspace. Association.subscription_pending is maintained by
	# Association.before_save and the daily update_subscription_pending_flags
	# scheduled job. Paid is the complement (subscription_pending = 0).
	rows = frappe.db.sql(
		f"""
		SELECT
			COALESCE(NULLIF(association_category, ''), 'Uncategorized') AS category,
			COUNT(IF(subscription_pending = 1, 1, NULL)) AS pending_count,
			COUNT(IF(subscription_pending = 0, 1, NULL)) AS paid_count
		FROM `tabAssociation`
		WHERE {UNIT_MEMBER_CONDITION}
		GROUP BY category
		""",
		as_dict=True,
	)

	# Same filter as the "Document Submission Pending" shortcut badge on the
	# Home workspace: Active associations with document_submission = "No".
	doc_rows = frappe.db.sql(
		"""
		SELECT
			COALESCE(NULLIF(association_category, ''), 'Uncategorized') AS category,
			COUNT(*) AS pending_count
		FROM `tabAssociation`
		WHERE status = 'Active' AND document_submission = 'No'
		GROUP BY category
		""",
		as_dict=True,
	)

	rows.sort(key=_category_order)
	doc_rows.sort(key=_category_order)

	return {
		"total_pending": sum(r.pending_count for r in rows),
		"total_paid": sum(r.paid_count for r in rows),
		"categories": rows,
		"doc_pending_total": sum(r.pending_count for r in doc_rows),
		"doc_categories": doc_rows,
	}
