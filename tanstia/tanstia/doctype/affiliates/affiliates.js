// Copyright (c) 2025, abdulla.pi@groupteampro.com and contributors
// For license information, please see license.txt

frappe.ui.form.on("Affiliates", {
	setup: function (frm) {
        
        frm.set_query("district", function () {
            if(frm.doc.region){
                return {
                    filters: {
                        region: frm.doc.region,
                    },
                };
            }
        });
        frm.set_query("association_category", function () {
            if(frm.doc.type =="Non-Member"){
                return {
                    filters: {
                        name: "Unit Member",
                    },
                };
            }
        });
	},
    district(frm) {
        if (frm.doc.district) {
            frm.set_value("district_name", frm.doc.district);
        }
    },
    refresh(frm) {
        render_add_button(frm);
        
        // if (frm.doc.office_bearers && frm.doc.office_bearers.length > 0) {
        //     render_update_button(frm);
        // }
        

    }

});
frappe.ui.form.on("Subscription Renewal Details", {
    elected_ec_members_size: function (frm, cdt, cdn) {
        let row = locals[cdt][cdn];

        if (row.elected_ec_members_size > 4) {
            frappe.msgprint({
                title: __("Invalid Value"),
                message: __("Elected EC Members Size cannot be more than 3."),
                indicator: "red"
            });
            frappe.model.set_value(cdt, cdn, "elected_ec_members_size", "");
        }
    }
});

frappe.ui.form.on("Office Bearer Details", {
    office_bearer: function (frm, cdt, cdn) {
        let row = locals[cdt][cdn];

        setTimeout(() => {
            if (!frm.doc.from_date || !frm.doc.to_date) {
                frappe.msgprint({
                    title: __("Missing Fields"),
                    message: __("Please enter From Date and To Date before adding Office Bearers."),
                    indicator: "red"
                });
                frappe.model.clear_doc(cdt, cdn);
                frm.refresh_field("office_bearers");
            }
        }, 300);
    },
    office_bearers_add: function (frm, cdt, cdn) {
        if (!frm.doc.from_date || !frm.doc.to_date) {
            frappe.msgprint({
                title: __("Missing Fields"),
                message: __("Please enter From Date and To Date before adding Office Bearers."),
                indicator: "red"
            });
        }
    }
});
function show_missing_fields(frm) {
    if ((frm.doc.from_date && frm.doc.to_date ) && (frm.doc.office_bearers || frm.doc.office_bearers.length < 0)) {
        let fields =['Office Bearers'];
        frappe.msgprint({
            title: __("Missing Fields"),
            message: __(
                "Mandatory fields required in EC Office Bearer<br><ul>{0}</ul>",
                [fields.map(f => `<li>${f}</li>`).join("")]
            ),
            indicator: "red"
        });
        frappe.validate=false
    }
}

function render_add_button(frm) {

    /* ---------- ADD BUTTON FIELD ---------- */
    const add_wrapper = $(frm.fields_dict.add_button.wrapper);
    add_wrapper.empty();

    const addButton = $(`
        <button class="btn btn-sm btn-primary" type="button">
            <i class="fa fa-archive" style="margin-right: 5px;"></i>
            Archive
        </button>
    `);

    addButton.on("click", function () {
        open_dialog(frm);
    });

    add_wrapper.append(addButton);


    /* ---------- ARCHIVE BUTTON FIELD ---------- */
    const archive_wrapper = $(frm.fields_dict.archieve_button.wrapper);
    archive_wrapper.empty();

    const archiveButton = $(`
        <button class="btn btn-sm btn-primary" type="button">
            <i class="fa fa-archive" style="margin-right: 5px;"></i>
            Archive
        </button>
    `);

    archiveButton.on("click", function () {
        add_achive_data(frm);
    });

    archive_wrapper.append(archiveButton);
}

function render_update_button(frm) {
    if (!frm.fields_dict.update_button) {
        console.warn("HTML field 'update_button' not found");
        return;
    }

    const wrapper = $(frm.fields_dict.update_button.wrapper);
    wrapper.empty();

    const updateButton = $(`
        <div class="flex justify-center" style="margin-top: 15px;">
            <button class="btn btn-sm btn-danger" type="button"style="background-color:red">
                <i class="fa fa-edit" style="margin-right: 5px;"></i>
                Edit Office Bearer
            </button>
        </div>
    `);

    updateButton.find("button")
        .off("click")
        .on("click", function () {
            open_dialog_to_update(frm);
        });

    wrapper.append(updateButton);
}
function add_achive_data(frm){

    if (frm.doc.subscription_renewal && frm.doc.subscription_renewal.length > 0) {
        frm.doc.subscription_renewal.forEach(ob => {
            let old_row = frm.add_child("previous_subscription_renewal");

            old_row.date_and_year_of_affiliation = ob.date_and_year_of_affiliation;
            old_row.next_subscription_payment_date = ob.next_subscription_payment_date;
            old_row.next_renewal_updating_date = ob.next_renewal_updating_date;
            old_row.member_id = ob.member_id;
            old_row.elected_ec_members_size = ob.elected_ec_members_size;
            old_row.strength_of_the_association = ob.strength_of_the_association;
            old_row.disabled =1;
        });
        frm.refresh_field("previous_subscription_renewal");
    }

    frm.clear_table("subscription_renewal");
    frm.refresh_field("subscription_renewal");

}
function open_dialog(frm) {
    
    if (frm.doc.office_bearers && frm.doc.office_bearers.length > 0) {
        frm.doc.office_bearers.forEach(ob => {
            let old_row = frm.add_child("previous_office_bearers");

            old_row.office_bearer = ob.office_bearer;
            old_row.designation = ob.designation;
            old_row.contact_number = ob.contact_number;
            old_row.email = ob.email;
            old_row.from_date = ob.from_date || frm.doc.from_date;
            old_row.to_date = ob.to_date || frm.doc.to_date;
            old_row.disabled =1;
        });

        frm.refresh_field("previous_office_bearers");
    }
    frm.set_value('from_date',"")
    frm.set_value('to_date',"")
    frm.clear_table("office_bearers");
    frm.refresh_field("office_bearers");
}
function open_dialog_to_update(frm) {

    if (!frm.doc.office_bearers || frm.doc.office_bearers.length === 0) {
        frappe.msgprint("No Office Bearer found to update");
        return;
    }

    // Get first (current) office bearer
    const current = frm.doc.office_bearers[0];

    const d = new frappe.ui.Dialog({
        title: "Update Office Bearer",
        fields: [
            {
                label: "Name",
                fieldname: "office_bearer",
                fieldtype: "Data",
                reqd: 1,
                default: current.office_bearer
            },
            {
                label: "Designation",
                fieldname: "designation",
                fieldtype: "Link",
                options: "Designation",
                reqd: 1,
                default: current.designation
            },
            {
                label: "Contact Number",
                fieldname: "contact_number",
                fieldtype: "Data",
                reqd: 1,
                default: current.contact_number
            },
            {
                label: "Email",
                fieldname: "email",
                fieldtype: "Data",
                options: "Email",
                default: current.email
            }
        ],
        primary_action_label: "Update",
        primary_action(values) {

            // ✅ Update existing row (NO add_child)
            current.office_bearer = values.office_bearer;
            current.designation = values.designation;
            current.contact_number = values.contact_number;
            current.email = values.email;
            current.from_date = frm.doc.from_date;
            current.to_date = frm.doc.to_date;

            frm.refresh_field("office_bearers");
            d.hide();
        }
    });

    d.show();
}
