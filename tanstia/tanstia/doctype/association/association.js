// Copyright (c) 2025, abdulla.pi@groupteampro.com and contributors
// For license information, please see license.txt

frappe.ui.form.on("Association", {
    status(frm){
        if(frm.doc.status){
            frm.set_value('status_updated_date', frappe.datetime.now_date()); 
        }
    },
    onload(frm){

        if (frm.doc.__islocal) {
            let today = new Date();
            let currentYear = today.getFullYear();

            // April is month 3 (0-based index)
            let renewalYear = (today.getMonth() >= 3) ? currentYear + 1 : currentYear;

            // March = 2 (0-based), 31 = day
            let renewalDate = new Date(renewalYear, 2, 31);

            frm.set_value('next_renewal_updating_date', renewalDate);


            frm.clear_table("office_bearers");
            let ob_row = frm.add_child("office_bearers");

            ob_row.designation = "President";
            frm.refresh_field("office_bearers");
        }

    },
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
        // Actions menu
        if (!frm.doc.__islocal) {
            let status_btn = frm.add_custom_button(__('Executive Committee'), () => {
                    null
                }, __('Actions'));
                status_btn.css({
                'background-color': '#C3E2E6',  // Bootstrap success green
                'font-weight': 'bold'
            });
            status_btn.addClass('disabled-button');
            frm.add_custom_button(__('Create'), () => {
                const docname = frappe.model.make_new_doc_and_get_name("EC Membership");
                    const new_doc = locals["EC Membership"][docname];
                    new_doc.ec_membership = frm.doc.name;
                    new_doc.association_category = frm.doc.association_category;
                    new_doc.region = frm.doc.region;
                    new_doc.association_name = frm.doc.name;
                    new_doc.elected_ec_member = frm.doc.elected_ec_members_size;
                    new_doc.type=frm.doc.type;
                    if (frm.doc.elected_ec_office_bearers?.length) {
                        frm.doc.elected_ec_office_bearers.forEach(row => {
                            let child = frappe.model.add_child(
                                new_doc,
                                "office_bearers",
                                "Office Bearer Details"
                            );

                            child.office_bearer = row.office_bearer;
                            child.email = row.email;
                            child.contact_number = row.contact_number;
                        });
                    }

                    // Navigate to new document
                    frappe.set_route("Form", "EC Membership", docname);
            }, __('Actions')).css({
                'background-color': '#F7DAE5', 
                'font-weight': 'bold'
            });

            frm.add_custom_button(__('View'), () => {
                frappe.set_route("List", "EC Membership", {
                    association_name: frm.doc.name
                });
            }, __('Actions')).css({
                'background-color': '#F7DAE5',
                'font-weight': 'bold'
            });


            frm.add_custom_button(__('Archive'), () => {
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
                    old_row.tenure = frm.doc.tenure;
                });

                frm.refresh_field("previous_office_bearers");
            }
            let old_row = frm.add_child("previous_subscription_renewal");
                // old_row.date_and_year_of_affiliation = frm.doc.date_and_year_of_affiliation;
                old_row.next_subscription_payment_date = frm.doc.next_subscription_payment_date;
                old_row.next_renewal_updating_date = frm.doc.next_renewal_updating_date;
                // old_row.member_id = frm.doc.member_id;
                old_row.elected_ec_members_size = frm.doc.elected_ec_members_size;
                old_row.strength_of_the_association = frm.doc.strength_of_the_association;
                old_row.tenure = frm.doc.tenure;
                old_row.disabled =1;
            
            frm.refresh_field("previous_subscription_renewal");
            frm.set_value('from_date',"")
            frm.set_value('archived',1)
            frm.set_value('to_date',"")
            frm.set_value('tenure',"")
            // frm.set_value('date_and_year_of_affiliation',"")
            frm.set_value('next_subscription_payment_date',"")
            frm.set_value('next_renewal_updating_date',"")
            // frm.set_value('member_id',"")
            frm.set_value('elected_ec_members_size',"")
            frm.set_value('strength_of_the_association',"")
            frm.clear_table("office_bearers");
            let ob_row = frm.add_child("office_bearers");

            ob_row.designation = "President";
            frm.refresh_field("office_bearers");


            }, __('Actions')).css({
                'font-weight': 'bold',
                'background-color': '#C3E2E6',
            });
        }

        // if (frm.doc.office_bearers && frm.doc.office_bearers.length > 0) {
        //     render_update_button(frm);
        // }
        

    },
    from_date(frm) {
        calculate_tenure(frm);
    },
    to_date(frm) {
        calculate_tenure(frm);
    },
    before_save: function(frm) {

        let parts = [];

        if (frm.doc.address_line_1)
            parts.push(frm.doc.address_line_1);

        if (frm.doc.address_line_2)
            parts.push(frm.doc.address_line_2);

        if (frm.doc.district)
            parts.push(frm.doc.district);

        if (frm.doc.pin_code)
            parts.push(frm.doc.pin_code);

        frm.set_value("address", parts.join("\n"));
    },
    add_achive_data(frm){
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
                old_row.tenure = frm.doc.tenure;
            });

            frm.refresh_field("previous_office_bearers");
        }
        let old_row = frm.add_child("previous_subscription_renewal");
            old_row.date_and_year_of_affiliation = frm.doc.date_and_year_of_affiliation;
            old_row.next_subscription_payment_date = frm.doc.next_subscription_payment_date;
            old_row.next_renewal_updating_date = frm.doc.next_renewal_updating_date;
            old_row.member_id = frm.doc.member_id;
            old_row.elected_ec_members_size = frm.doc.elected_ec_members_size;
            old_row.strength_of_the_association = frm.doc.strength_of_the_association;
            old_row.tenure = frm.doc.tenure;
            old_row.disabled =1;
        
        frm.refresh_field("previous_subscription_renewal");
        frm.set_value('from_date',"")
        frm.set_value('to_date',"")
        frm.set_value('tenure',"")
        frm.set_value('date_and_year_of_affiliation',"")
        frm.set_value('next_subscription_payment_date',"")
        frm.set_value('next_renewal_updating_date',"")
        frm.set_value('member_id',"")
        frm.set_value('elected_ec_members_size',"")
        frm.set_value('strength_of_the_association',"")
        frm.clear_table("office_bearers");
        let ob_row = frm.add_child("office_bearers");

        ob_row.designation = "President";
        frm.refresh_field("office_bearers");

}

});

function calculate_tenure(frm) {
    if (frm.doc.from_date && frm.doc.to_date) {
        let from_date = new Date(frm.doc.from_date);
        let to_date = new Date(frm.doc.to_date);

        let tenure = from_date.getFullYear() + " - " + to_date.getFullYear();
        if (from_date.getFullYear() == to_date.getFullYear()){
            tenure = from_date.getFullYear()
        }
        frm.set_value("tenure", tenure);
    }
}

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

// frappe.ui.form.on("Office Bearer Details", {
//     office_bearer: function (frm, cdt, cdn) {
//         let row = locals[cdt][cdn];

//         setTimeout(() => {
//             if (!frm.doc.from_date || !frm.doc.to_date) {
//                 frappe.msgprint({
//                     title: __("Missing Fields"),
//                     message: __("Please enter From Date and To Date before adding Office Bearers."),
//                     indicator: "red"
//                 });
//                 frappe.model.clear_doc(cdt, cdn);
//                 frm.refresh_field("office_bearers");
//             }
//         }, 300);
//     },
//     designation: function (frm, cdt, cdn) {
//         let row = locals[cdt][cdn];

//         setTimeout(() => {
//             if (!frm.doc.from_date || !frm.doc.to_date) {
//                 frappe.msgprint({
//                     title: __("Missing Fields"),
//                     message: __("Please enter From Date and To Date before adding Office Bearers."),
//                     indicator: "red"
//                 });
//                 frappe.model.clear_doc(cdt, cdn);
//                 frm.refresh_field("office_bearers");
//             }
//         }, 300);
//     },
//     office_bearers_add: function (frm, cdt, cdn) {
//         if (!frm.doc.from_date || !frm.doc.to_date) {
//             frappe.msgprint({
//                 title: __("Missing Fields"),
//                 message: __("Please enter From Date and To Date before adding Office Bearers."),
//                 indicator: "red"
//             });
//         }
//     },
    
// });
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
            old_row.tenure = frm.doc.tenure;
        });

        frm.refresh_field("previous_office_bearers");
    }
    let old_row = frm.add_child("previous_subscription_renewal");
        old_row.date_and_year_of_affiliation = frm.doc.date_and_year_of_affiliation;
        old_row.next_subscription_payment_date = frm.doc.next_subscription_payment_date;
        old_row.next_renewal_updating_date = frm.doc.next_renewal_updating_date;
        old_row.member_id = frm.doc.member_id;
        old_row.elected_ec_members_size = frm.doc.elected_ec_members_size;
        old_row.strength_of_the_association = frm.doc.strength_of_the_association;
        old_row.tenure = frm.doc.tenure;
        old_row.disabled =1;
    
    frm.refresh_field("previous_subscription_renewal");
    frm.set_value('from_date',"")
    frm.set_value('to_date',"")
    frm.set_value('tenure',"")
    frm.set_value('date_and_year_of_affiliation',"")
    frm.set_value('next_subscription_payment_date',"")
    frm.set_value('next_renewal_updating_date',"")
    frm.set_value('member_id',"")
    frm.set_value('elected_ec_members_size',"")
    frm.set_value('strength_of_the_association',"")
    frm.clear_table("office_bearers");
    let ob_row = frm.add_child("office_bearers");

    ob_row.designation = "President";
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

