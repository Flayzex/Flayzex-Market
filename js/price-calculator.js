let starsQuantity = document.getElementById('stars-quantity');

starsQuantity.addEventListener('input', function() {
    let quantity = parseInt(starsQuantity.value);
    if (quantity < 50 || isNaN(quantity)) {
        document.getElementById('stars-price').innerText = `Minimum 50 stars required`;
        document.getElementById('btn-buy-stars').innerText = `Buy Telegram Stars`;
        return;
    }

    let var_price = quantity * 0.015 + 0.21;
    let price = (var_price + var_price * 0.1).toFixed(2);

    document.getElementById('stars-price').innerText = `${price} USD or ${(price * 13250).toFixed(0)} UZS`;
    document.getElementById('btn-buy-stars').innerText = `Buy ${quantity} Telegram Stars`;
});