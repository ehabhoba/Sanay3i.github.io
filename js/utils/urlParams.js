function getParamFromUrl(paramName) {
	const urlParams = new URLSearchParams(window.location.search);
	return urlParams.get(paramName);
}
