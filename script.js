document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('sales-form');
    const photoInput = document.getElementById('item-photo');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const removePhotoBtn = document.getElementById('remove-photo');
    const photoLabel = document.querySelector('.photo-label');

    const salesList = document.getElementById('sales-list');
    const reportsContainer = document.getElementById('reports-container');
    const clearAllBtn = document.getElementById('clear-all');
    const searchInput = document.getElementById('search-history');

    const emptyHistory = document.getElementById('empty-history');
    const emptyReports = document.getElementById('empty-reports');

    const tabBtns = document.querySelectorAll('.tab-btn');
    const views = document.querySelectorAll('.view');

    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const closeModal = document.querySelector('.close-modal');

    let currentImageDataUrl = '';

    // Initialize
    setDefaultDate();
    loadSales();
    generateReports();

    // --- Tab Navigation ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            tabBtns.forEach(b => b.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));

            // Add active class to clicked tab and corresponding view
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            // Refresh data if needed
            if(targetId === 'view-history') loadSales(searchInput.value);
            if(targetId === 'view-reports') generateReports();
        });
    });

    // --- Utility: Set default date to today ---
    function setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('sale-date').value = today;
    }

    // --- Image Handling (with Compression) ---
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Set maximum dimensions
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.7 quality
                    currentImageDataUrl = canvas.toDataURL('image/jpeg', 0.7);

                    imagePreview.src = currentImageDataUrl;
                    imagePreviewContainer.classList.remove('hidden');
                    photoLabel.style.display = 'none';
                };
                img.src = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    removePhotoBtn.addEventListener('click', () => {
        resetImageInput();
    });

    function resetImageInput() {
        currentImageDataUrl = '';
        imagePreview.src = '';
        photoInput.value = '';
        imagePreviewContainer.classList.add('hidden');
        photoLabel.style.display = 'flex';
    }

    // --- Form Submission ---
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('item-name').value.trim();
        const karat = document.getElementById('item-karat').value;
        const weight = parseFloat(document.getElementById('item-weight').value);
        const cost = parseFloat(document.getElementById('cost-price').value);
        const sale = parseFloat(document.getElementById('sale-price').value);
        const date = document.getElementById('sale-date').value;

        if (!currentImageDataUrl) {
            alert('Por favor, tome o suba una foto de la prenda de oro.');
            return;
        }

        const profit = sale - cost;
        const profitPercentage = cost > 0 ? ((profit / cost) * 100).toFixed(2) : 100;

        const saleData = {
            id: Date.now().toString(),
            name,
            karat,
            weight,
            cost,
            sale,
            profit,
            profitPercentage,
            image: currentImageDataUrl,
            date: date
        };

        try {
            saveSale(saleData);
        } catch (error) {
            if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                alert('Error: La memoria del navegador está llena. No se puede guardar la venta. Intente borrar el historial.');
                return;
            } else {
                alert('Error al guardar la venta: ' + error.message);
                return;
            }
        }

        // Reset form
        form.reset();
        resetImageInput();
        setDefaultDate();

        // Notify and switch to history
        alert('¡Venta registrada con éxito!');
        document.querySelector('[data-target="view-history"]').click();
    });

    // --- Data Management (LocalStorage) ---
    function saveSale(saleData) {
        let sales = getSales();
        sales.push(saleData);
        // Sort descending by date
        sales.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem('aurumSales', JSON.stringify(sales));
    }

    function getSales() {
        return JSON.parse(localStorage.getItem('aurumSales')) || [];
    }

    function deleteSale(id) {
        let sales = getSales();
        sales = sales.filter(sale => sale.id !== id);
        localStorage.setItem('aurumSales', JSON.stringify(sales));
        loadSales(searchInput.value);
        generateReports();
    }

    // --- History View ---
    function loadSales(searchTerm = '') {
        salesList.innerHTML = '';
        const sales = getSales();

        let filteredSales = sales;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredSales = sales.filter(s => s.name.toLowerCase().includes(term));
        }

        if (filteredSales.length === 0) {
            emptyHistory.classList.remove('hidden');
        } else {
            emptyHistory.classList.add('hidden');
            filteredSales.forEach(renderSale);
        }
    }

    function renderSale(sale) {
        const card = document.createElement('div');
        card.className = 'sale-card';

        const profitClass = sale.profit >= 0 ? 'profit-pos' : 'profit-neg';
        const profitSign = sale.profit >= 0 ? '+' : '';

        // Format Date (YYYY-MM-DD to DD/MM/YYYY)
        const dateParts = sale.date.split('-');
        const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : sale.date;

        card.innerHTML = `
            <div class="sale-image-container">
                <span class="sale-date-badge">${formattedDate}</span>
                <img src="${sale.image}" alt="${sale.name}" class="history-img" data-src="${sale.image}">
            </div>
            <div class="sale-content">
                <div class="sale-title" title="${sale.name}">${sale.name}</div>
                <div class="sale-specs">
                    <span><i class="fas fa-award"></i> ${sale.karat.toUpperCase()}</span>
                    <span><i class="fas fa-balance-scale"></i> ${sale.weight}g</span>
                </div>
                <div class="sale-financials">
                    <span class="fin-label">Costo:</span>
                    <span class="fin-val">$${sale.cost.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>

                    <span class="fin-label">Venta:</span>
                    <span class="fin-val">$${sale.sale.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>

                    <div class="profit-row ${profitClass}">
                        <span>Ganancia:</span>
                        <span>${profitSign}$${sale.profit.toLocaleString('en-US', {minimumFractionDigits: 2})} (${profitSign}${sale.profitPercentage}%)</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-danger btn-large delete-btn" data-id="${sale.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;

        salesList.appendChild(card);
    }

    // --- Search ---
    searchInput.addEventListener('input', (e) => {
        loadSales(e.target.value);
    });

    // --- Delete Actions ---
    salesList.addEventListener('click', function(e) {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            const id = deleteBtn.getAttribute('data-id');
            if(confirm('¿Está seguro de eliminar este registro? Esta acción no se puede deshacer.')) {
                deleteSale(id);
            }
        }

        // Image Modal logic
        if (e.target.classList.contains('history-img')) {
            modal.style.display = "block";
            modalImg.src = e.target.getAttribute('data-src');
        }
    });

    clearAllBtn.addEventListener('click', () => {
        if (confirm('⚠️ PELIGRO: ¿Está seguro de borrar TODO el historial? Se perderán todos los datos.')) {
            localStorage.removeItem('aurumSales');
            loadSales();
            generateReports();
        }
    });

    // --- Reports View ---
    function generateReports() {
        reportsContainer.innerHTML = '';
        const sales = getSales();

        if (sales.length === 0) {
            emptyReports.classList.remove('hidden');
            return;
        }
        emptyReports.classList.add('hidden');

        // Group by Month/Year
        const monthlyData = {};

        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

        sales.forEach(sale => {
            // sale.date is YYYY-MM-DD
            const date = new Date(sale.date + 'T00:00:00'); // Prevent timezone shift
            const month = date.getMonth();
            const year = date.getFullYear();
            const key = `${year}-${month}`; // e.g., "2023-9"

            if (!monthlyData[key]) {
                monthlyData[key] = {
                    label: `${monthNames[month]} ${year}`,
                    items: 0,
                    totalWeight: 0,
                    totalCost: 0,
                    totalSales: 0,
                    totalProfit: 0,
                    sortKey: year * 100 + month // for sorting
                };
            }

            monthlyData[key].items += 1;
            monthlyData[key].totalWeight += sale.weight;
            monthlyData[key].totalCost += sale.cost;
            monthlyData[key].totalSales += sale.sale;
            monthlyData[key].totalProfit += sale.profit;
        });

        // Convert to array and sort (newest first)
        const reportsArray = Object.values(monthlyData).sort((a, b) => b.sortKey - a.sortKey);

        reportsArray.forEach(report => {
            const card = document.createElement('div');
            card.className = 'report-card';

            const profitClass = report.totalProfit >= 0 ? 'profit-pos' : 'profit-neg';

            card.innerHTML = `
                <div class="report-month">${report.label}</div>
                <div class="report-stats">
                    <div class="stat-row">
                        <span class="stat-label">Piezas Vendidas:</span>
                        <span class="stat-value">${report.items}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Peso Total Vendido:</span>
                        <span class="stat-value">${report.totalWeight.toFixed(2)}g</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Inversión Total:</span>
                        <span class="stat-value">$${report.totalCost.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Ingresos Brutos:</span>
                        <span class="stat-value">$${report.totalSales.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div class="stat-row stat-total ${profitClass}">
                        <span class="stat-label" style="color: inherit">Ganancia Neta:</span>
                        <span class="stat-value">$${report.totalProfit.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                    </div>
                </div>
            `;
            reportsContainer.appendChild(card);
        });
    }

    // --- Modal actions ---
    closeModal.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});
