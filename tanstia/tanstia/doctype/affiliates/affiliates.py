# Copyright (c) 2025, abdulla.pi@groupteampro.com and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Affiliates(Document):
	pass

import frappe
from frappe.utils import getdate, today
from datetime import date

@frappe.whitelist()
def trigger_notification_for_subscription_renewal():
    today_date = getdate(today())
    current_year = today_date.year

    renewal_start = date(current_year, 4, 1)  
    renewal_end = date(current_year, 6, 30)    

    affiliates = frappe.db.get_all(
        "Affiliates",
        filters={"docstatus": ["!=", 2]},
        fields=["name", "status"]
    )

    for affiliate in affiliates:
        renewals = frappe.db.get_all(
            "Subscription Renewal Details",
            filters={
                "parent": affiliate.name,
                "parenttype": "Affiliates",
                "parentfield": "subscription_renewal",
                "next_renewal_updating_date": ["<=", renewal_end]
            },
            fields=["name", "next_renewal_updating_date"]
        )

        for renewal in renewals:
            renewal_date = getdate(renewal.next_renewal_updating_date)

            if renewal_start <= today_date <= renewal_end:
                send_weekly_alert(affiliate.name, renewal_date)

            if today_date > renewal_end:
                frappe.db.set_value(
                    "Affiliates",
                    affiliate.name,
                    "status",
                    "Deactivated"
                )

    frappe.db.commit()

def send_weekly_alert(affiliate_name, renewal_date):
    frappe.sendmail(
        recipients=["jothi.m@groupteampro.com"],  
        subject="Subscription Renewal Pending",
        message=f"""
            <p>The subscription for <b>{affiliate_name}</b> is pending renewal.</p>
            <p>Renewal Due Date: <b>{renewal_date}</b></p>
            <p>Please renew before 30th June to avoid deactivation.</p>
        """
    )
