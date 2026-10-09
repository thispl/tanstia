// ERPLocal Theme — injects the brand watermark element on every page.
(function () {
	function injectWatermark() {
		if (document.getElementById("elt-watermark")) return;
		const wm = document.createElement("div");
		wm.id = "elt-watermark";
		wm.setAttribute("aria-hidden", "true");
		document.body.appendChild(wm);
	}

	if (document.body) {
		injectWatermark();
	} else {
		document.addEventListener("DOMContentLoaded", injectWatermark);
	}
})();
