// Global variables
let type_new, region, district, association_category, association_name;

frappe.pages['mail-campaigns'].on_page_load = function(wrapper) {
    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Mail Campaigns',
        single_column: true
    });

    let $headerContainer = $('<div class="form-group d-flex justify-content-between align-items-end mb-3" style="gap: 20px;">')
        .appendTo(page.main);

    let $filtersSection = $('<div class="d-flex" style="gap: 15px; flex-wrap: wrap;">')
        .appendTo($headerContainer);

    let $buttonsSection = $('<div class="d-flex" style="gap: 10px;">')
        .appendTo($headerContainer);

    // Type
    type_new = frappe.ui.form.make_control({
        df: {
            fieldtype: 'Select',
            label: 'Type',
            fieldname: 'type',
            options: ['', 'Member', 'Non-Member']
        },
        parent: $filtersSection,
        render_input: true
    });

    // Region
    region = frappe.ui.form.make_control({
        df: {
            fieldtype: 'Link',
            label: 'Region',
            options: 'Region',
            fieldname: 'region'
        },
        parent: $filtersSection,
        render_input: true
    });

    // District
    district = frappe.ui.form.make_control({
        df: {
            fieldtype: 'Link',
            label: 'District',
            options: 'District',
            fieldname: 'district'
        },
        parent: $filtersSection,
        render_input: true
    });

    // Association Category
    association_category = frappe.ui.form.make_control({
        df: {
            fieldtype: 'Link',
            label: 'Association Category',
            options: 'Association Category',
            fieldname: 'association_category'
        },
        parent: $filtersSection,
        render_input: true
    });

    // Association
    association_name = frappe.ui.form.make_control({
        df: {
            fieldtype: 'Link',
            label: 'Association',
            options: 'Association',
            fieldname: 'association_name'
        },
        parent: $filtersSection,
        render_input: true
    });

    // Send Button
    let send = frappe.ui.form.make_control({
        df: {
            fieldtype: 'Button',
            label: 'Send Email',
            fieldname: 'send'
        },
        parent: $filtersSection,
        render_input: true
    });
    $(send.wrapper).css('margin-top', '25px');
    // Queries
    district.df.get_query = () => {
        if (region.get_value()) {
            return { filters: { region: region.get_value() } };
        }
    };

    association_name.df.get_query = () => {
        let filters = {};
        if (region.get_value()) filters.region = region.get_value();
        if (association_category.get_value()) filters.association_category = association_category.get_value();
        return { filters };
    };

    region.$input.on("change", () => {
        district.set_value("");
    });
    let $btnWrapper = $('<div style="margin-top:25px; display:flex; gap:10px;">')
    .appendTo($buttonsSection);

    let applyBtn = $(
        `<button class="btn btn-primary" style="margin-top:25px;">
            <i class="fa fa-filter"></i> Filter
        </button>`
    ).appendTo($btnWrapper);

    let clearBtn = $(
        `<button class="btn btn-secondary" style="margin-top:25px;">
            &#x2715;
        </button>`
    ).appendTo($btnWrapper);


    // Buttons
    // let applyBtn = $(`<button class="btn btn-primary"><i class="fa fa-filter"></i> Filter</button>`)
    //     .appendTo($buttonsSection);
    //     $(applyBtn.wrapper).css('margin-top', '20px');

    // let clearBtn = $(`<button class="btn btn-secondary">&#x2715;</button>`)
    //     .appendTo($buttonsSection);
    $(clearBtn.wrapper).css('margin-top', '25px');
    let $container = $('<div class="mt-4">').appendTo(page.main);

    // Apply
    applyBtn.on("click", function () {
        get_data();
    });

    // Clear
    clearBtn.on("click", function () {
        type_new.set_value("");
        region.set_value("");
        district.set_value("");
        association_category.set_value("");
        association_name.set_value("");
        $container.empty();
        frappe.call({
            method: "tanstia.tanstia.page.mail_campaigns.mail_campaigns.get_data",
            args: {
            },
            callback: function (r) {
                if (r.message) {
                    $(".mt-4").html(r.message);
                }
            }
        });
    });

    // Send Email
    send.$input.on("click", function () {
        open_send_email_dialog();
    });

    // Initial load
    get_data();
};

// Fetch data
function get_data() {
    frappe.call({
        method: "tanstia.tanstia.page.mail_campaigns.mail_campaigns.get_data",
        args: {
            type_new: type_new.get_value(),
            region: region.get_value(),
            district: district.get_value(),
            association_category: association_category.get_value(),
            association_name: association_name.get_value()
        },
        callback: function (r) {
            if (r.message) {
                $(".mt-4").html(r.message);
            }
        }
    });
}


// // Send email dialog
// function open_send_email_dialog() {

//     /* ---------------------------
//        Collect emails
//     ---------------------------- */
//     let selectedEmails = [];

//     document.querySelectorAll(".row-checkbox:checked").forEach(cb => {
//         if (cb.dataset.email) selectedEmails.push(cb.dataset.email);
//     });

//     if (!selectedEmails.length) {
//         document.querySelectorAll(".row-checkbox").forEach(cb => {
//             if (cb.dataset.email) selectedEmails.push(cb.dataset.email);
//         });
//     }

//     /* ---------------------------
//        "Child table" storage
//     ---------------------------- */
//     let attachment_rows = [];

//     function render_attachments(dialog) {
//         let html = attachment_rows.map((f, i) => `
//             <div style="margin-bottom:6px">
//                 📎 <a href="${f.file_url}" target="_blank">
//                     ${f.file_name}
//                 </a>
//                 <span style="cursor:pointer;color:red;margin-left:8px"
//                     onclick="remove_page_attachment(${i})">✖</span>
//             </div>
//         `).join("");

//         dialog.fields_dict.attached_files.$wrapper.html(
//             html || "<i>No attachments</i>"
//         );
//     }

//     window.remove_page_attachment = function (idx) {
//         attachment_rows.splice(idx, 1);
//         render_attachments(dialog);
//     };

//     let dialog = new frappe.ui.Dialog({
//         title: 'Send Email',
//         size: 'large',
//         fields: [
//             { fieldtype: 'Data', fieldname: 'subject', label: 'Subject', reqd: 1 },
//             { fieldtype: 'Text Editor', fieldname: 'content', label: 'Content', reqd: 1 },

//             // 👇 Attach used only as trigger
//             { fieldtype: 'Attach', fieldname: 'attachment', label: 'Attach File' },

//             // 👇 Multi-file preview
//             { fieldtype: 'HTML', fieldname: 'attached_files' }
//         ],

//         primary_action_label: 'Send',
//         primary_action(values) {
//             console.log(attachment_rows)
//             frappe.call({
//                 method: "tanstia.tanstia.page.mail_campaigns.mail_campaigns.send_mail_campaign",
//                 args: {
//                     subject: values.subject,
//                     content: values.content,
//                     recipients: selectedEmails,
//                     attachments: attachment_rows.map(f => f.name)
//                 },
//                 callback() {
//                     frappe.msgprint("Email sent successfully");
//                     dialog.hide();
//                 }
//             });
//         }

//     });

//     dialog.show();

//     /* ---------------------------
//        Attach onchange handler
//     ---------------------------- */
//     dialog.fields_dict.attachment.df.onchange = () => {

//         let file_url = dialog.get_value('attachment');
//         if (!file_url) return;

//         // Get File doc using file_url
//         frappe.call({
//             method: "frappe.client.get_list",
//             args: {
//                 doctype: "File",
//                 filters: { file_url },
//                 fields: ["name", "file_name", "file_url"],
//                 limit_page_length: 1
//             },
//             callback(r) {
//                 if (!r.message || !r.message.length) return;

//                 let file = r.message[0];

//                 // ✅ Append to "child table"
//                 attachment_rows.push({
//                     name: file.name,          // File docname
//                     file_name: file.file_name,
//                     file_url: file.file_url   // Correct private/public URL
//                 });

//                 // ✅ Clear Attach field
//                 dialog.set_value('attachment', null);

//                 // ✅ Refresh UI
//                 render_attachments(dialog);
//             }
//         });
//     };
// }


function open_send_email_dialog() {

    /* ---------------------------
       Collect emails
    ---------------------------- */
    let selectedEmails = [];

    document.querySelectorAll(".row-checkbox:checked").forEach(cb => {
        if (cb.dataset.email) selectedEmails.push(cb.dataset.email);
    });

    if (!selectedEmails.length) {
        document.querySelectorAll(".row-checkbox").forEach(cb => {
            if (cb.dataset.email) selectedEmails.push(cb.dataset.email);
        });
    }

    /* ---------------------------
       Attachment storage
    ---------------------------- */
    let attachment_rows = [];

    function render_attachments(dialog) {
        let html = attachment_rows.map((f, i) => `
            <div style="margin-bottom:6px">
                📎 <a href="${f.file_url}" target="_blank">${f.file_name}</a>
                <span style="cursor:pointer;color:red;margin-left:8px"
                    data-idx="${i}" class="remove-attachment">✖</span>
            </div>
        `).join("");

        dialog.fields_dict.attached_files.$wrapper.html(
            html || "<i>No attachments</i>"
        );
    }

    /* ---------------------------
       Dialog
    ---------------------------- */
    let dialog = new frappe.ui.Dialog({
        title: 'Send Email',
        size: 'large',
        fields: [
            { fieldtype: 'Data', fieldname: 'subject', label: 'Subject', reqd: 1 },
            { fieldtype: 'Text Editor', fieldname: 'content', label: 'Content', reqd: 1 },

            { fieldtype: 'Button', fieldname: 'upload_files', label: 'Add Attachments' },
            { fieldtype: 'HTML', fieldname: 'attached_files' }
        ],

        primary_action_label: 'Send',
        primary_action(values) {
            frappe.call({
                method: "tanstia.tanstia.page.mail_campaigns.mail_campaigns.send_mail_campaign",
                args: {
                    subject: values.subject,
                    content: values.content,
                    recipients: selectedEmails,
                    attachments: attachment_rows.map(f => f.name)
                },
                callback() {
                    frappe.msgprint("Email sent successfully");
                    dialog.hide();
                }
            });
        }
    });

    dialog.show();

    /* ---------------------------
       Remove attachment
    ---------------------------- */
    dialog.fields_dict.attached_files.$wrapper.on(
        'click',
        '.remove-attachment',
        function () {
            attachment_rows.splice($(this).data('idx'), 1);
            render_attachments(dialog);
        }
    );

    /* ---------------------------
       Multi-file uploader
    ---------------------------- */
    dialog.fields_dict.upload_files.$input.on('click', () => {
        new frappe.ui.FileUploader({
            allow_multiple: true,
            on_success(file) {
                attachment_rows.push({
                    name: file.name,
                    file_name: file.file_name,
                    file_url: file.file_url
                });
                render_attachments(dialog);
            }
        });
    });
}


