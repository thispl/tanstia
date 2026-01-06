// Copyright (c) 2025, abdulla.pi@groupteampro.com and contributors
// For license information, please see license.txt

frappe.ui.form.on("EC Membership", {
    setup(frm) {
       frm.set_query("association_category", function () {
            return {
                filters: {
                    name: ["!=", "Unit Member"]
                }
            };
        });

        set_association_query(frm);
        
    },
   refresh(frm) {
    if (!frm.doc.__islocal) {
        // frm.add_custom_button(__("Create EC-OB"), () => {
        //     const docname = frappe.model.make_new_doc_and_get_name("EC Office Bearer");
        //     const new_doc = locals["EC Office Bearer"][docname];
        //     new_doc.ec_membership = frm.doc.name;
        //     if (frm.doc.elected_ec_office_bearers?.length) {
        //         frm.doc.elected_ec_office_bearers.forEach(row => {
        //             let child = frappe.model.add_child(
        //                 new_doc,
        //                 "office_bearers",
        //                 "Office Bearer Details"
        //             );

        //             child.office_bearer = row.office_bearer;
        //             child.email = row.email;
        //             child.contact_number = row.contact_number;
        //         });
        //     }

        //     // Navigate to new document
        //     frappe.set_route("Form", "EC Office Bearer", docname);
        // });
    }
},



    region(frm) {
        set_association_query(frm);
    },

    association_category(frm) {
        set_association_query(frm);
    },
    elected_ec_member(frm) {

        if (frm.doc.elected_ec_member > 4) {
            frappe.msgprint({
                title: __("Invalid Value"),
                message: __("Elected EC Members cannot be more than 3."),
                indicator: "red"
            });
            frm.set_value( "elected_ec_member", "");
        }
    }
});

function set_association_query(frm) {
    frm.set_query("association_name", function () {
        let filters = {};

        if (frm.doc.region) {
            filters.region = frm.doc.region;
        }

        if (frm.doc.association_category) {
            filters.association_category = frm.doc.association_category;
        }

        return { filters };
    });
}

frappe.ui.form.on("EC Member Details", {
    // office_bearer: function (frm, cdt, cdn) {
    //     let row = locals[cdt][cdn];

    //     setTimeout(() => {
    //         if (!frm.doc.from_date || !frm.doc.to_date) {
    //             frappe.msgprint({
    //                 title: __("Missing Fields"),
    //                 message: __("Please enter From Date and To Date before adding Office Bearers."),
    //                 indicator: "red"
    //             });
    //             frappe.model.clear_doc(cdt, cdn);
    //             frm.refresh_field("office_bearers");
    //         }
    //     }, 300);
    // },
    elected_ec_office_bearers_add: function (frm, cdt, cdn) {
        if (frm.doc.elected_ec_office_bearers.length > frm.doc.elected_ec_member) {
            let row = locals[cdt][cdn];
            frappe.msgprint({
                title: __("Invalid Value"),
                message: __("Elected EC Office Bearers cannot be more than "+frm.doc.elected_ec_member),
                indicator: "red"
            });
            frappe.model.clear_doc(cdt, cdn);
            frm.refresh_field("elected_ec_office_bearers");
        }
    },
    appointed_ec_members_add: function (frm, cdt, cdn) {
        if (frm.doc.appointed_ec_members.length > 3) {
            let row = locals[cdt][cdn];
            frappe.msgprint({
                title: __("Invalid Value"),
                message: __("Appointed EC Members cannot be more than 3.."),
                indicator: "red"
            });
            frappe.model.clear_doc(cdt, cdn);
            frm.refresh_field("appointed_ec_members");
        }
    }
});