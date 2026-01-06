// Copyright (c) 2025, abdulla.pi@groupteampro.com
// For license information, please see license.txt
frappe.ui.form.on("EC Office Bearer", {
    refresh(frm) {
        let ec_member_map = {};

        frappe.call({
            method: "tanstia.tanstia.doctype.ec_membership.ec_membership.get_appointed_ec_members",
            callback: function (r) {
                if (r.message) {

                    // Attach map to frm
                    frm.ec_member_map = {};

                    r.message.forEach(d => {
                        frm.ec_member_map[d.office_bearer] = {
                            email: d.email,
                            contact_number: d.contact_number
                        };
                    });

                    let options = Object.keys(frm.ec_member_map);

                    frm.fields_dict['office_bearers']
                        .grid.update_docfield_property(
                            'office_bearer',
                            'options',
                            options.join('\n')
                        );
                }
            }
        });


        if (!frm.doc.__islocal) {
            frm.add_custom_button(__("Archive"), function() {
                open_dialog(frm);
            }, __("Actions"));
        }
    },
    from_date(frm) {
        calculate_tenure(frm);
        if (frm.doc.from_date && frm.doc.to_date && frm.doc.office_bearers) {
            frm.doc.office_bearers.forEach(row => {
                row.from_date = frm.doc.from_date;
                row.to_date = frm.doc.to_date;
                row.tenure = frm.doc.tenure;
            });
            frm.refresh_field("office_bearers");
        }
    },
    to_date(frm) {
        calculate_tenure(frm);
        if (frm.doc.from_date && frm.doc.to_date && frm.doc.office_bearers) {
            frm.doc.office_bearers.forEach(row => {
                row.from_date = frm.doc.from_date;
                row.to_date = frm.doc.to_date;
                row.tenure = frm.doc.tenure;
            });
            frm.refresh_field("office_bearers");
        }
    },
//     add_achive_data(frm){
//         if (frm.doc.office_bearers && frm.doc.office_bearers.length > 0) {
//             frm.doc.office_bearers.forEach(ob => {
//                 let old_row = frm.add_child("previous_office_bearers");

//                 old_row.office_bearer = ob.office_bearer;
//                 old_row.designation = ob.designation;
//                 old_row.contact_number = ob.contact_number;
//                 old_row.email = ob.email;
//                 old_row.from_date = ob.from_date || frm.doc.from_date;
//                 old_row.to_date = ob.to_date || frm.doc.to_date;
//                 old_row.disabled =1;
//                 old_row.tenure = frm.doc.tenure;
//             });

//             frm.refresh_field("previous_office_bearers");
//         }
        
//         frm.set_value('from_date',"")
//         frm.set_value('to_date',"")
//         frm.set_value('tenure',"")
        
//         frm.clear_table("office_bearers");
//         let ob_row = frm.add_child("office_bearers");

//         ob_row.designation = "President";
//         frm.refresh_field("office_bearers");

// },
    onload: function(frm) {
        if (frm.doc.__islocal) {
            frm.clear_table("office_bearers");
            office_bearers =['President','General Secretory','Treasurer','H.Q Joint Secretary',
                'Regional Vice President','Regional Vice President','Regional Vice President','Regional Vice President',
                'Regional Joint Secretary','Regional Joint Secretary','Regional Joint Secretary','Regional Joint Secretary','IPP'
            ]
            office_bearers.forEach(ob => {
            let ob_row = frm.add_child("office_bearers");
                ob_row.designation = ob;
            });
            frm.refresh_field("office_bearers");
        }
        if (!frm.doc.__islocal) {
            frm.add_custom_button(__("Archive"), function() {
                open_dialog(frm);
            }, __("Actions"));
        }
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

frappe.ui.form.on("EC Office Bearer Details", {
    office_bearer: function (frm, cdt, cdn) {
        let row = locals[cdt][cdn];

        if (
            row.office_bearer &&
            frm.ec_member_map &&
            frm.ec_member_map[row.office_bearer]
        ) {
            row.email = frm.ec_member_map[row.office_bearer].email;
            row.contact_number = frm.ec_member_map[row.office_bearer].contact_number;

            frm.refresh_field('office_bearers');
        }


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
    const wrapper = $(frm.fields_dict.add_button.wrapper);
    wrapper.empty();

    const addButton = $(`
        <div class="flex justify-center" style="margin-top: 1px;margin-bottom: 5px;">
            <button class="btn btn-sm btn-primary" type="button">
                <i class="fa fa-archive" style="margin-right: 5px;"></i>
                Archive
            </button>
        </div>
    `);


    addButton.find("button").on("click", function () {
        open_dialog(frm);
    });

    wrapper.append(addButton);
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
            old_row.tenure =ob.tenure;
        });

        frm.refresh_field("previous_office_bearers");
    }
    frm.set_value('from_date',"")
    frm.set_value('to_date',"")
    frm.set_value('tenure',"")
    frm.clear_table("office_bearers");
    office_bearers =['President','General Secretory','Treasurer','H.Q Joint Secretary',
        'Regional Vice President','Regional Vice President','Regional Vice President','Regional Vice President',
        'Regional Joint Secretary','Regional Joint Secretary','Regional Joint Secretary','Regional Joint Secretary','IPP'
    ]
    office_bearers.forEach(ob => {
    let ob_row = frm.add_child("office_bearers");
        ob_row.designation = ob;
    });
    frm.refresh_field("office_bearers");

}
function open_dialog_to_update(frm) {

    if (!frm.doc.office_bearers || frm.doc.office_bearers.length === 0) {
        frappe.msgprint("No Office Bearer found to update");
        return;
    }

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
