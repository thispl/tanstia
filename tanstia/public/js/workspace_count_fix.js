// frappe.db.count forces distinct=true when a filter references a child
// doctype, which collapses child rows back to the parent count.
// For EC Office Bearer we call reportview.get_count directly so the
// workspace shortcut badge counts office_bearers child rows correctly.
//
// The "Subscription Pending" badge counts Association.subscription_pending
// (computed in Association.before_save and refreshed daily by the scheduler),
// but clicking the shortcut should open the list filtered by
// next_subscription_payment_date (Timespan: next year) instead.
(function () {
	const original_count = frappe.db.count.bind(frappe.db);
	const original_get_filter_from_json =
		frappe.utils.get_filter_from_json.bind(frappe.utils);

	frappe.db.count = function (doctype, args = {}, cache = false) {
		const filters = args.filters || {};
		const has_child_filter =
			Array.isArray(filters) &&
			filters.some((f) => f[0] === "EC Office Bearer Details");

		if (doctype === "EC Office Bearer" && has_child_filter) {
			return frappe.xcall("frappe.desk.reportview.get_count", {
				doctype,
				filters,
				fields: [],
				distinct: false,
				limit: args.limit,
			});
		}
		return original_count(doctype, args, cache);
	};

	frappe.utils.get_filter_from_json = function (filter_json, doctype) {
		if (
			!doctype &&
			typeof filter_json === "string" &&
			filter_json.includes('"subscription_pending"')
		) {
			return {
				status: ["=", "Active"],
				next_subscription_payment_date: ["Timespan", "next year"],
			};
		}
		return original_get_filter_from_json(filter_json, doctype);
	};
})();
