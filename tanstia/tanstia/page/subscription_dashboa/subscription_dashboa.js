frappe.pages['subscription-dashboa'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Subscription Dashboard',
		single_column: true
	});

	const CARD_PALETTE = [
		['#e74c3c', '#c0392b'],
		['#8e44ad', '#6c3483'],
		['#3498db', '#2471a3'],
		['#16a085', '#117a65'],
		['#f39c12', '#d68910'],
		['#d35400', '#a04000'],
		['#27ae60', '#1e8449'],
		['#2980b9', '#1f618d'],
		['#e84393', '#b03060'],
		['#f1c40f', '#b7950b'],
		['#00cec9', '#01938f'],
		['#6c5ce7', '#4834d4']
	];

	const style = `
		<style>
			.sub-dash-summary {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
				gap: 18px;
				margin-bottom: 24px;
			}
			.sub-dash-total {
				color: #fff;
				border-radius: 12px;
				padding: 26px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				box-shadow: 0 4px 14px rgba(0,0,0,0.18);
				cursor: pointer;
				transition: transform 0.12s ease, box-shadow 0.12s ease;
			}
			.sub-dash-total:hover {
				transform: translateY(-3px);
				box-shadow: 0 8px 20px rgba(0,0,0,0.25);
			}
			.sub-dash-total.unpaid {
				background: linear-gradient(135deg, #e74c3c, #8e1c1c);
			}
			.sub-dash-total.paid {
				background: linear-gradient(135deg, #27ae60, #145a32);
			}
			.sub-dash-total.doc-pending {
				background: linear-gradient(135deg, #f39c12, #b45309);
			}
			.sub-dash-section-title {
				font-size: 16px;
				font-weight: 700;
				margin: 28px 0 14px;
				color: var(--heading-color);
			}
			.sub-dash-total .count {
				font-size: 52px;
				font-weight: 800;
				line-height: 1;
			}
			.sub-dash-total .label {
				font-size: 18px;
				font-weight: 600;
				opacity: 0.95;
			}
			.sub-dash-total .hint {
				font-size: 12px;
				opacity: 0.8;
				margin-top: 6px;
			}
			.sub-dash-grid {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
				gap: 18px;
			}
			.sub-dash-card {
				border-radius: 12px;
				padding: 18px;
				color: #fff;
				box-shadow: 0 3px 10px rgba(0,0,0,0.15);
				transition: transform 0.12s ease, box-shadow 0.12s ease;
				position: relative;
				overflow: hidden;
			}
			.sub-dash-card:hover {
				transform: translateY(-3px);
				box-shadow: 0 8px 20px rgba(0,0,0,0.25);
			}
			.sub-dash-card .category {
				font-size: 15px;
				font-weight: 700;
				margin-bottom: 14px;
				word-break: break-word;
			}
			.sub-dash-card .stats {
				display: flex;
				gap: 10px;
			}
			.sub-dash-card .stat {
				flex: 1;
				background: rgba(255,255,255,0.15);
				border-radius: 8px;
				padding: 10px 12px;
				cursor: pointer;
			}
			.sub-dash-card .stat:hover {
				background: rgba(255,255,255,0.28);
			}
			.sub-dash-card .stat .num {
				font-size: 26px;
				font-weight: 800;
				line-height: 1.1;
			}
			.sub-dash-card .stat .lbl {
				font-size: 11px;
				font-weight: 600;
				text-transform: uppercase;
				opacity: 0.9;
				margin-top: 2px;
			}
			.sub-dash-card::after {
				content: '';
				position: absolute;
				right: -30px;
				top: -30px;
				width: 110px;
				height: 110px;
				border-radius: 50%;
				background: rgba(255,255,255,0.12);
				pointer-events: none;
			}
			.sub-dash-empty {
				padding: 60px 20px;
				text-align: center;
				color: var(--text-muted);
				font-size: 16px;
			}
		</style>
	`;

	const $container = $('<div class="sub-dash-root mt-3">').appendTo(page.main);
	$(style).appendTo($container);
	const $body = $('<div>').appendTo($container);

	page.set_primary_action(__('Refresh'), () => load_dashboard(), 'refresh');

	function load_dashboard() {
		frappe.call({
			method: 'tanstia.tanstia.page.subscription_dashboa.subscription_dashboa.get_subscription_pending_summary',
			callback: function(r) {
				render(r.message || { total_pending: 0, total_paid: 0, categories: [] });
			}
		});
	}

	function open_list(category, pending) {
		frappe.route_options = { subscription_pending: pending };
		if (category === 'Uncategorized') {
			frappe.route_options.association_category = ['is', 'not set'];
		} else if (category) {
			frappe.route_options.association_category = category;
		}
		frappe.set_route('List', 'Association');
	}

	function open_doc_list(category) {
		frappe.route_options = { status: 'Active', document_submission: 'No' };
		if (category === 'Uncategorized') {
			frappe.route_options.association_category = ['is', 'not set'];
		} else if (category) {
			frappe.route_options.association_category = category;
		}
		frappe.set_route('List', 'Association');
	}

	function render(data) {
		$body.empty();

		const $summary = $('<div class="sub-dash-summary">').appendTo($body);

		const $unpaid = $(`
			<div class="sub-dash-total unpaid">
				<div>
					<div class="label">${__('Subscription Pending')}</div>
					<div class="hint">${__('Click to view unpaid associations')}</div>
				</div>
				<div class="count">${data.total_pending}</div>
			</div>
		`).appendTo($summary);
		$unpaid.on('click', () => open_list(null, 1));

		const $paid = $(`
			<div class="sub-dash-total paid">
				<div>
					<div class="label">${__('Subscription Paid')}</div>
					<div class="hint">${__('Click to view paid associations')}</div>
				</div>
				<div class="count">${data.total_paid}</div>
			</div>
		`).appendTo($summary);
		$paid.on('click', () => open_list(null, 0));

		const $grid = $('<div class="sub-dash-grid">').appendTo($body);

		data.categories.forEach(function(row, i) {
			const [c1, c2] = CARD_PALETTE[i % CARD_PALETTE.length];
			const $card = $(`
				<div class="sub-dash-card" style="background: linear-gradient(135deg, ${c1}, ${c2});">
					<div class="category">${frappe.utils.escape_html(row.category)}</div>
					<div class="stats">
						<div class="stat stat-pending">
							<div class="num">${row.pending_count}</div>
							<div class="lbl">${__('Pending')}</div>
						</div>
						<div class="stat stat-paid">
							<div class="num">${row.paid_count}</div>
							<div class="lbl">${__('Paid')}</div>
						</div>
					</div>
				</div>
			`).appendTo($grid);
			$card.find('.stat-pending').on('click', () => open_list(row.category, 1));
			$card.find('.stat-paid').on('click', () => open_list(row.category, 0));
		});

		$('<div class="sub-dash-section-title">')
			.text(__('Document Submission Pending'))
			.appendTo($body);

		const $docSummary = $('<div class="sub-dash-summary">').appendTo($body);
		const $docTotal = $(`
			<div class="sub-dash-total doc-pending">
				<div>
					<div class="label">${__('Document Submission Pending')}</div>
					<div class="hint">${__('Click to view pending associations')}</div>
				</div>
				<div class="count">${data.doc_pending_total}</div>
			</div>
		`).appendTo($docSummary);
		$docTotal.on('click', () => open_doc_list(null));

		const $docGrid = $('<div class="sub-dash-grid">').appendTo($body);

		data.doc_categories.forEach(function(row, i) {
			const [c1, c2] = CARD_PALETTE[i % CARD_PALETTE.length];
			const $card = $(`
				<div class="sub-dash-card" style="background: linear-gradient(135deg, ${c1}, ${c2});">
					<div class="category">${frappe.utils.escape_html(row.category)}</div>
					<div class="stats">
						<div class="stat">
							<div class="num">${row.pending_count}</div>
							<div class="lbl">${__('Pending')}</div>
						</div>
					</div>
				</div>
			`).appendTo($docGrid);
			$card.find('.stat').on('click', () => open_doc_list(row.category));
		});
	}

	load_dashboard();
};
