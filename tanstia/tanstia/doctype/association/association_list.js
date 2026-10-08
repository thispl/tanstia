// Copyright (c) 2026, abdulla.pi@groupteampro.com and contributors
// For license information, please see license.txt

frappe.listview_settings["Association"] = {
	add_fields: ["association_category", "name_of_the_company"],

	refresh(list_view) {
		// Rename the "Association Name" column header to "Company Name"
		// when the Association Category filter is set to "Unit Member"
		const is_unit_member = (list_view.filter_area.get() || []).some(
			(f) => f[1] === "association_category" && f[2] === "=" && f[3] === "Unit Member"
		);

		const label = is_unit_member ? __("Company Name") : __("Association Name");
		list_view.$result
			.find('.list-row-head .list-row-col.association [data-sort-by="association"]')
			.text(label)
			.attr("title", __("Click to sort by {0}", [label]));
	},
	onload: function(listview) {
        if (!frappe.user.has_role("Association Export")) {
            setTimeout(() => {
                $("button").filter(function () {
                    return $(this).text().trim() === "Export";
                }).hide();
            }, 500);
        }
    },

	formatters: {
		association(value, df, doc) {
			const display =
				doc.association_category === "Unit Member" && doc.name_of_the_company
					? doc.name_of_the_company
					: value;

			return `<span class="ellipsis"
				title="${__(df.label)}: ${frappe.utils.escape_html(display)}">
				<a class="filterable ellipsis"
					data-filter="${df.fieldname},=,${frappe.utils.escape_html(value)}">
					${frappe.utils.escape_html(display)}
				</a>
			</span>`;
		},
	},
};
