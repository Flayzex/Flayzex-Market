document.addEventListener("DOMContentLoaded", function () {
    const widgetContainer = document.querySelector(".tradingview-widget-container__widget");

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;

    script.innerHTML = JSON.stringify({
        "symbols": [
            {
                "proName": "FX_IDC:EURUSD",
                "title": "EUR to USD"
            },
            {
                "description": "USD to UZS",
                "proName": "FX_IDC:USDUZS"
            },
            {
                "description": "Bitcoin",
                "proName": "BITSTAMP:BTCUSD"
            },
            {
                "description": "Toncoin",
                "proName": "CRYPTO:TONUSD"
            }
        ],
        "showSymbolLogo": true,
        "isTransparent": true,
        "displayMode": "regular",
        "colorTheme": "dark",
        "locale": "en"
    });

    widgetContainer.parentNode.insertBefore(script, widgetContainer.nextSibling);
});