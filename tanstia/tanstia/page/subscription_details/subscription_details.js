frappe.pages['subscription-details'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Subscription Details',
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
			@keyframes subDashIn {
				from { opacity: 0; transform: translateY(14px); }
				to { opacity: 1; transform: translateY(0); }
			}
			.sub-dash-summary {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
				gap: 20px;
				margin-bottom: 26px;
			}
			.sub-dash-total {
				color: #fff;
				border-radius: 16px;
				padding: 30px 28px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				cursor: pointer;
				position: relative;
				overflow: hidden;
				box-shadow: 0 6px 20px rgba(0,0,0,0.22);
				transition: transform 0.18s ease, box-shadow 0.18s ease;
				animation: subDashIn 0.4s ease both;
			}
			.sub-dash-total::before {
				content: '';
				position: absolute;
				inset: 0;
				background: radial-gradient(circle at 85% 15%, rgba(255,255,255,0.28), transparent 55%);
				pointer-events: none;
			}
			.sub-dash-total::after {
				content: '';
				position: absolute;
				right: -40px;
				bottom: -60px;
				width: 170px;
				height: 170px;
				border-radius: 50%;
				border: 26px solid rgba(255,255,255,0.10);
				pointer-events: none;
			}
			.sub-dash-total:hover {
				transform: translateY(-4px) scale(1.01);
			}
			.sub-dash-total.unpaid {
				background: linear-gradient(135deg, #ff6b5e 0%, #e74c3c 45%, #a01608 100%);
			}
			.sub-dash-total.unpaid:hover {
				box-shadow: 0 14px 34px rgba(231,76,60,0.45);
			}
			.sub-dash-total.paid {
				background: linear-gradient(135deg, #3ddc84 0%, #27ae60 45%, #0e5c2e 100%);
			}
			.sub-dash-total.paid:hover {
				box-shadow: 0 14px 34px rgba(39,174,96,0.45);
			}
			.sub-dash-total.doc-pending {
				background: linear-gradient(135deg, #ffbe4f 0%, #f39c12 45%, #b45309 100%);
			}
			.sub-dash-total.doc-pending:hover {
				box-shadow: 0 14px 34px rgba(243,156,18,0.45);
			}
			.sub-dash-total .count {
				font-size: 58px;
				font-weight: 800;
				line-height: 1;
				text-shadow: 0 2px 10px rgba(0,0,0,0.25);
			}
			.sub-dash-total .label {
				font-size: 18px;
				font-weight: 700;
				letter-spacing: 0.3px;
			}
			.sub-dash-total .hint {
				font-size: 12px;
				opacity: 0.85;
				margin-top: 8px;
			}
			.sub-dash-section-title {
				font-size: 17px;
				font-weight: 700;
				margin: 30px 0 16px;
				color: var(--heading-color);
				display: flex;
				align-items: center;
				gap: 10px;
			}
			.sub-dash-section-title::after {
				content: '';
				flex: 1;
				height: 1px;
				background: linear-gradient(90deg, rgba(0,0,0,0.15), transparent);
			}
			.sub-dash-grid {
				display: grid;
				grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
				gap: 20px;
			}
			.sub-dash-card {
				border-radius: 16px;
				padding: 20px;
				color: #fff;
				box-shadow: 0 4px 14px rgba(0,0,0,0.16);
				transition: transform 0.18s ease, box-shadow 0.18s ease;
				position: relative;
				overflow: hidden;
				animation: subDashIn 0.4s ease both;
			}
			.sub-dash-card::before {
				content: '';
				position: absolute;
				inset: 0;
				background: radial-gradient(circle at 85% 10%, rgba(255,255,255,0.22), transparent 50%);
				pointer-events: none;
			}
			.sub-dash-card:hover {
				transform: translateY(-4px) scale(1.015);
				box-shadow: 0 14px 30px rgba(0,0,0,0.28);
			}
			.sub-dash-card .category {
				font-size: 15px;
				font-weight: 700;
				margin-bottom: 14px;
				word-break: break-word;
				letter-spacing: 0.2px;
				display: flex;
				align-items: center;
				gap: 8px;
			}
			.sub-dash-card .category::before {
				content: '';
				width: 8px;
				height: 8px;
				border-radius: 50%;
				background: rgba(255,255,255,0.85);
				flex-shrink: 0;
				box-shadow: 0 0 0 4px rgba(255,255,255,0.2);
			}
			.sub-dash-card .stats {
				display: flex;
				gap: 10px;
			}
			.sub-dash-card .stat {
				flex: 1;
				background: rgba(255,255,255,0.16);
				backdrop-filter: blur(8px);
				-webkit-backdrop-filter: blur(8px);
				border: 1px solid rgba(255,255,255,0.25);
				border-radius: 12px;
				padding: 12px;
				cursor: pointer;
				transition: background 0.15s ease, transform 0.15s ease;
			}
			.sub-dash-card .stat:hover {
				background: rgba(255,255,255,0.32);
				transform: translateY(-2px);
			}
			.sub-dash-card .stat .num {
				font-size: 28px;
				font-weight: 800;
				line-height: 1.1;
				text-shadow: 0 1px 6px rgba(0,0,0,0.2);
			}
			.sub-dash-card .stat .lbl {
				font-size: 11px;
				font-weight: 700;
				text-transform: uppercase;
				letter-spacing: 0.8px;
				opacity: 0.9;
				margin-top: 3px;
			}
			.sub-dash-card::after {
				content: '';
				position: absolute;
				right: -30px;
				top: -30px;
				width: 110px;
				height: 110px;
				border-radius: 50%;
				background: rgba(255,255,255,0.10);
				pointer-events: none;
			}
			.sub-dash-details {
				margin-top: 24px;
				background: var(--card-bg, #fff);
				border-radius: 16px;
				padding: 22px;
				box-shadow: 0 4px 18px rgba(0,0,0,0.10);
				border-top: 4px solid var(--accent, #6c5ce7);
				animation: subDashIn 0.3s ease both;
			}
			.sub-dash-details .details-head {
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 14px;
			}
			.sub-dash-details .details-title {
				font-size: 16px;
				font-weight: 700;
				color: var(--accent, #6c5ce7);
			}
			.sub-dash-details .table-wrap {
				max-height: 480px;
				overflow: auto;
				border-radius: 10px;
			}
			.sub-dash-details table {
				width: 100%;
				border-collapse: separate;
				border-spacing: 0;
			}
			.sub-dash-details thead th {
				position: sticky;
				top: 0;
				background: var(--accent, #6c5ce7);
				color: #fff;
				z-index: 1;
				white-space: nowrap;
				border: none;
				padding: 11px 12px;
				font-size: 12px;
				text-transform: uppercase;
				letter-spacing: 0.5px;
			}
			.sub-dash-details tbody td {
				padding: 9px 12px;
				border-bottom: 1px solid rgba(0,0,0,0.06);
			}
			.sub-dash-details tbody tr:nth-child(even) {
				background: var(--accent-light, #f6f3ff);
			}
			.sub-dash-details tbody tr:hover {
				background: var(--accent-hover, #e9e4ff);
			}
			.sub-dash-pill {
				display: inline-block;
				padding: 3px 12px;
				border-radius: 999px;
				font-size: 11px;
				font-weight: 700;
				color: #fff;
				box-shadow: 0 2px 6px rgba(0,0,0,0.15);
			}
			.pill-green { background: linear-gradient(135deg, #2ecc71, #1e8449); }
			.pill-red { background: linear-gradient(135deg, #e74c3c, #c0392b); }
			.pill-orange { background: linear-gradient(135deg, #f39c12, #d68910); }
			.pill-grey { background: linear-gradient(135deg, #95a5a6, #7f8c8d); }
			.pill-blue { background: linear-gradient(135deg, #3498db, #2471a3); }
		</style>
	`;

	const $container = $('<div class="sub-dash-root mt-3">').appendTo(page.main);
	$(style).appendTo($container);
	const $body = $('<div>').appendTo($container);
	let $subDetails, $docDetails;

	page.set_primary_action(__('Refresh'), () => load_dashboard(), 'refresh');
	page.set_secondary_action(__('Home'), () => frappe.set_route('/desk/home'), 'home');

	function load_dashboard() {
		frappe.call({
			method: 'tanstia.tanstia.page.subscription_dashboa.subscription_dashboa.get_subscription_pending_summary',
			callback: function(r) {
				render(r.message || { total_pending: 0, total_paid: 0, categories: [], doc_categories: [] });
			}
		});
	}

	function hex_to_rgba(hex, alpha) {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}

	function show_details(kind, category, title, accent, $slot, $other) {
		$other && $other.empty();
		$slot.empty();
		const $box = $('<div class="sub-dash-details">').appendTo($slot);
		$box[0].style.setProperty('--accent', accent);
		$box[0].style.setProperty('--accent-light', hex_to_rgba(accent, 0.07));
		$box[0].style.setProperty('--accent-hover', hex_to_rgba(accent, 0.16));
		$(`
			<div class="details-head">
				<div class="details-title">${frappe.utils.escape_html(title)}</div>
				<button class="btn btn-default btn-xs details-close">${__('Close')}</button>
			</div>
			<div class="details-body text-muted">${__('Loading...')}</div>
		`).appendTo($box);
		$box.find('.details-close').on('click', () => $slot.empty());
		$box[0].scrollIntoView({ behavior: 'smooth', block: 'start' });

		frappe.call({
			method: 'tanstia.tanstia.page.subscription_details.subscription_details.get_association_rows',
			args: { kind: kind, category: category },
			callback: function(r) {
				render_rows($box.find('.details-body'), r.message || []);
			}
		});
	}

	function render_rows($target, rows) {
		$target.empty();
		if (!rows.length) {
			$target.html('<div class="text-muted" style="padding:20px 0;">' + __('No records found.') + '</div>');
			return;
		}

		const esc = frappe.utils.escape_html;
		const STATUS_COLORS = {
			'Active': 'pill-green',
			'Inactive': 'pill-orange',
			'Disabled': 'pill-grey',
			'Removed': 'pill-grey',
			'Deleted': 'pill-red'
		};
		const pill = (val, cls) => `<span class="sub-dash-pill ${cls}">${esc(val)}</span>`;

		const body = rows.map(function(row, i) {
			return `<tr>
				<td>${i + 1}</td>
				<td><b><a href="/desk/association/${encodeURIComponent(row.name)}" style="color: var(--accent, #6c5ce7);">${esc(row.name || '')}</a></b></td>
				<td>${esc(row.member_name || row.association || '')}</td>
				<td>${row.association_category ? pill(row.association_category, 'pill-blue') : ''}</td>
				<td>${esc(row.district || '')}</td>
				<td>${row.next_subscription_payment_date ? frappe.datetime.str_to_user(row.next_subscription_payment_date) : ''}</td>
				<td>${row.document_submission ? pill(row.document_submission, row.document_submission === 'Yes' ? 'pill-green' : 'pill-red') : ''}</td>
				<td>${row.status ? pill(row.status, STATUS_COLORS[row.status] || 'pill-grey') : ''}</td>
			</tr>`;
		}).join('');

		$target.html(`
			<div class="text-muted mb-2">${rows.length} ${__('record(s)')}</div>
			<div class="table-wrap">
				<table class="table table-bordered table-hover">
					<thead>
						<tr>
							<th>${__('#')}</th>
							<th>${__('Member ID')}</th>
							<th>${__('Association / Member')}</th>
							<th>${__('Category')}</th>
							<th>${__('District')}</th>
							<th>${__('Next Payment Date')}</th>
							<th>${__('Doc Submission')}</th>
							<th>${__('Status')}</th>
						</tr>
					</thead>
					<tbody>${body}</tbody>
				</table>
			</div>
		`);
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
		$unpaid.on('click', () => show_details('pending', null, __('Subscription Pending'), '#e74c3c', $subDetails, $docDetails));

		const $paid = $(`
			<div class="sub-dash-total paid">
				<div>
					<div class="label">${__('Subscription Paid')}</div>
					<div class="hint">${__('Click to view paid associations')}</div>
				</div>
				<div class="count">${data.total_paid}</div>
			</div>
		`).appendTo($summary);
		$paid.on('click', () => show_details('paid', null, __('Subscription Paid'), '#27ae60', $subDetails, $docDetails));

		const $grid = $('<div class="sub-dash-grid">').appendTo($body);

		data.categories.forEach(function(row, i) {
			const [c1, c2] = CARD_PALETTE[i % CARD_PALETTE.length];
			const $card = $(`
				<div class="sub-dash-card" style="background: linear-gradient(135deg, ${c1}, ${c2}); animation-delay: ${i * 60}ms;">
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
			$card.find('.stat-pending').on('click', () => show_details('pending', row.category, row.category + ' - ' + __('Pending'), c1, $subDetails, $docDetails));
			$card.find('.stat-paid').on('click', () => show_details('paid', row.category, row.category + ' - ' + __('Paid'), c1, $subDetails, $docDetails));
		});

		$subDetails = $('<div>').appendTo($body);

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
		$docTotal.on('click', () => show_details('doc_pending', null, __('Document Submission Pending'), '#f39c12', $docDetails, $subDetails));

		const $docGrid = $('<div class="sub-dash-grid">').appendTo($body);

		data.doc_categories.forEach(function(row, i) {
			const [c1, c2] = CARD_PALETTE[i % CARD_PALETTE.length];
			const $card = $(`
				<div class="sub-dash-card" style="background: linear-gradient(135deg, ${c1}, ${c2}); animation-delay: ${i * 60}ms;">
					<div class="category">${frappe.utils.escape_html(row.category)}</div>
					<div class="stats">
						<div class="stat">
							<div class="num">${row.pending_count}</div>
							<div class="lbl">${__('Pending')}</div>
						</div>
					</div>
				</div>
			`).appendTo($docGrid);
			$card.find('.stat').on('click', () => show_details('doc_pending', row.category, row.category + ' - ' + __('Doc Submission Pending'), c1, $docDetails, $subDetails));
		});

		$docDetails = $('<div>').appendTo($body);
	}

	load_dashboard();
};

frappe.pages['subscription-details'].on_page_show = function(wrapper) {
	// frappe.breadcrumbs.update() runs synchronously AFTER the show event and
	// rebuilds every .navbar-breadcrumbs, so defer past it. Each rendered page
	// also has its own .navbar-breadcrumbs, so scope to this page's wrapper.
	setTimeout(function() {
		const $crumbs = $(wrapper).find('.navbar-breadcrumbs');
		$crumbs.find('li a').first().attr('href', '/desk/home');

		// Insert a "Home" crumb before the page title if it isn't there already.
		if (!$crumbs.find('a.home-crumb').length) {
			$crumbs.find('li').first().after(
				`<li><a class="home-crumb" href="/desk/home">${__('Home')}</a></li>`
			);
		}
	}, 0);
};
