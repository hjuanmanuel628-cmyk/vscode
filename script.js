document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('sales-form');
    const photoInput = document.getElementById('item-photo');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const salesList = document.getElementById('sales-list');
    const clearAllBtn = document.getElementById('clear-all');

    let currentImageDataUrl = '';

    // Load sales from local storage
    loadSales();

    // Handle image preview
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                currentImageDataUrl = e.target.result;
                imagePreview.src = currentImageDataUrl;
                imagePreviewContainer.classList.remove('hidden');
            }
            reader.readAsDataURL(file);
        } else {
            currentImageDataUrl = '';
            imagePreview.src = '';
            imagePreviewContainer.classList.add('hidden');
        }
    });

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('item-name').value;
        const cost = parseFloat(document.getElementById('cost-price').value);
        const sale = parseFloat(document.getElementById('sale-price').value);

        if (!currentImageDataUrl) {
            alert('Por favor, toma o selecciona una foto de la prenda.');
            return;
        }

        const profit = sale - cost;
        const profitPercentage = cost > 0 ? ((profit / cost) * 100).toFixed(2) : 100; // avoid division by zero

        const saleData = {
            id: Date.now().toString(),
            name,
            cost,
            sale,
            profit,
            profitPercentage,
            image: currentImageDataUrl,
            date: new Date().toLocaleDateString()
        };

        saveSale(saleData);
        renderSale(saleData);

        // Reset form
        form.reset();
        currentImageDataUrl = '';
        imagePreview.src = '';
        imagePreviewContainer.classList.add('hidden');
    });

    // Handle clear all
    clearAllBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar todos los registros?')) {
            localStorage.removeItem('joyeriaSales');
            salesList.innerHTML = '';
        }
    });

    // Delete single item
    salesList.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.getAttribute('data-id');
            deleteSale(id);
            e.target.closest('.sale-card').remove();
        }
    });

    function saveSale(saleData) {
        let sales = getSales();
        sales.push(saleData);
        localStorage.setItem('joyeriaSales', JSON.stringify(sales));
    }

    function getSales() {
        return JSON.parse(localStorage.getItem('joyeriaSales')) || [];
    }

    function loadSales() {
        const sales = getSales();
        sales.forEach(renderSale);
    }

    function deleteSale(id) {
        let sales = getSales();
        sales = sales.filter(sale => sale.id !== id);
        localStorage.setItem('joyeriaSales', JSON.stringify(sales));
    }

    function renderSale(sale) {
        const card = document.createElement('div');
        card.className = 'sale-card';
        
        const profitClass = sale.profit >= 0 ? 'profit-positive' : 'profit-negative';
        const profitSign = sale.profit >= 0 ? '+' : '';

        card.innerHTML = `
            <img src="${sale.image}" alt="${sale.name}" class="sale-image">
            <div class="sale-details">
                <div class="sale-title">${sale.name}</div>
                <div class="sale-price-info">
                    <span>Costo:</span>
                    <span>$${sale.cost.toFixed(2)}</span>
                </div>
                <div class="sale-price-info">
                    <span>Venta:</span>
                    <span>$${sale.sale.toFixed(2)}</span>
                </div>
                <div class="profit-info ${profitClass}">
                    <span>Ganancia:</span>
                    <span>${profitSign}$${sale.profit.toFixed(2)} (${profitSign}${sale.profitPercentage}%)</span>
                </div>
            </div>
            <button class="delete-btn" data-id="${sale.id}">Eliminar</button>
        `;

        // Add to top of list
        salesList.prepend(card);
    }
});
