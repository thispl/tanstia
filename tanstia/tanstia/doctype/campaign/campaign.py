# Copyright (c) 2025, abdulla.pi@groupteampro.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from datetime import datetime

class Campaign(Document):
	def before_insert(self):
		if self.creation1:
			self.campaign = datetime.now().strftime("%d%m%Y%H%M%S")


@frappe.whitelist()
def update_campaign_status(doc,method):
    campaign = frappe.db.get_all("Recipients", )

    sent = failed = 0

    for row in campaign.recepients:
        if not row.email_queue:
            continue

        status = frappe.db.get_value(
            "Email Queue",
            row.email_queue,
            "status"
        )

        if status == "Sent":
            row.status = "Sent"
            sent += 1
        elif status == "Error":
            row.status = "Failed"
            failed += 1

    campaign.sent_count = sent
    campaign.failed_count = failed
    campaign.in_progress_count = campaign.triggered_email_count - (sent + failed)

    campaign.save(ignore_permissions=True)
