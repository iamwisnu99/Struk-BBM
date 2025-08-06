document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    const fab = document.getElementById('fab');
    const settingsBtn = document.getElementById('settings-btn');
    const navItems = document.querySelectorAll('.nav-item');

    const defaultPrices = {
        pertalite: { nonSubsidi: 10818, subsidi: 818, jual: 10000 },
        biosolar: { nonSubsidi: 10821, subsidi: 4021, jual: 6800 }
    };

    const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // Ganti dengan kode Base64 Anda

    let currentMenu = '';
    let productName = '';

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
        }).format(number);
    };

    // PERUBAHAN: Fungsi helper untuk format tanggal dan waktu
    const formatDateForInput = (date) => {
        const pad = (num) => num.toString().padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const clearContent = () => {
        contentArea.innerHTML = '';
    };

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentMenu = item.dataset.menu;
            productName = item.querySelector('span').textContent;
            clearContent();
            contentArea.innerHTML = `<p class="placeholder-text">Anda memilih menu ${productName}. Tekan tombol '+' untuk memulai.</p>`;
            fab.style.display = 'block';
            settingsBtn.style.display = 'none';
        });
    });

    fab.addEventListener('click', () => {
        clearContent();
        fab.style.display = 'none';
        
        const now = new Date();
        const formattedDateTime = formatDateForInput(now);

        if (currentMenu === 'pertalite' || currentMenu === 'biosolar') {
            const formTemplate = document.getElementById('form-subsidi-template').innerHTML;
            contentArea.innerHTML = formTemplate;
            
            // Isi form otomatis
            document.getElementById('waktu-subsidi').value = formattedDateTime;
            const prices = defaultPrices[currentMenu];
            document.getElementById('harga-nonsubsidi').value = prices.nonSubsidi;
            document.getElementById('subsidi-pemerintah').value = prices.subsidi;
            document.getElementById('harga-jual-display').value = prices.jual;
            settingsBtn.style.display = 'block';

            document.getElementById('form-subsidi').addEventListener('submit', handleSubsidiSubmit);
            
            document.querySelectorAll('input[name="volume_choice_subsidi"]').forEach(radio => {
                radio.addEventListener('change', function() {
                    const manualContainer = document.getElementById('manual-volume-container-subsidi');
                    manualContainer.style.display = this.value === 'manual' ? 'block' : 'none';
                    document.getElementById('volume-subsidi-manual').required = this.value === 'manual';
                });
            });

        } else {
            const formTemplate = document.getElementById('form-nonsubsidi-template').innerHTML;
            contentArea.innerHTML = formTemplate;
            // Isi waktu otomatis
            document.getElementById('waktu-nonsubsidi').value = formattedDateTime;

            document.getElementById('form-nonsubsidi').addEventListener('submit', handleNonSubsidiSubmit);

            document.querySelectorAll('input[name="volume_choice_nonsubsidi"]').forEach(radio => {
                radio.addEventListener('change', function() {
                    const manualContainer = document.getElementById('manual-volume-container-nonsubsidi');
                    manualContainer.style.display = this.value === 'manual' ? 'block' : 'none';
                    document.getElementById('volume-nonsubsidi-manual').required = this.value === 'manual';
                });
            });
        }
    });

    settingsBtn.addEventListener('click', () => {
        const priceInputs = [
            document.getElementById('harga-nonsubsidi'),
            document.getElementById('subsidi-pemerintah'),
            document.getElementById('harga-jual-display')
        ];
        priceInputs.forEach(input => {
            if (input) {
                input.readOnly = false;
                input.style.cursor = 'text';
                input.style.backgroundColor = '#fff';
            }
        });
        settingsBtn.style.display = 'none';
    });

    // PERUBAHAN: Membaca nilai waktu dari input
    const handleSubsidiSubmit = (e) => {
        e.preventDefault();
        const inputs = {
            shift: document.getElementById('shift-subsidi').value,
            waktu: document.getElementById('waktu-subsidi').value, // Baca waktu dari form
            pulau: document.getElementById('pulau-subsidi').value,
            operator: document.getElementById('operator-subsidi').value,
            hargaNonSubsidi: parseFloat(document.getElementById('harga-nonsubsidi').value),
            subsidiPemerintah: parseFloat(document.getElementById('subsidi-pemerintah').value),
            pembayaran: document.getElementById('pembayaran-subsidi').value.toUpperCase(),
            totalHarga: parseFloat(document.getElementById('total-harga-subsidi').value),
            plat: document.getElementById('plat-subsidi').value.toUpperCase(),
        };

        const volumeChoice = document.querySelector('input[name="volume_choice_subsidi"]:checked').value;
        const hargaJual = inputs.hargaNonSubsidi - inputs.subsidiPemerintah;
        
        if (volumeChoice === 'manual') {
            inputs.volume = parseFloat(document.getElementById('volume-subsidi-manual').value);
        } else {
            inputs.volume = inputs.totalHarga / hargaJual;
        }
        generateStrukSubsidi(inputs);
    };

    // PERUBAHAN: Membaca nilai waktu dari input
    const handleNonSubsidiSubmit = (e) => {
        e.preventDefault();
        const inputs = {
            shift: document.getElementById('shift-nonsubsidi').value,
            waktu: document.getElementById('waktu-nonsubsidi').value, // Baca waktu dari form
            pulau: document.getElementById('pulau-nonsubsidi').value,
            operator: document.getElementById('operator-nonsubsidi').value,
            hargaLiter: parseFloat(document.getElementById('harga-liter-nonsubsidi').value),
            pembayaran: document.getElementById('pembayaran-nonsubsidi').value.toUpperCase(),
            totalHarga: parseFloat(document.getElementById('total-harga-nonsubsidi').value),
        };

        const volumeChoice = document.querySelector('input[name="volume_choice_nonsubsidi"]:checked').value;
        if (volumeChoice === 'manual') {
            inputs.volume = parseFloat(document.getElementById('volume-nonsubsidi-manual').value);
        } else { 
            inputs.volume = inputs.totalHarga / inputs.hargaLiter;
        }

        generateStrukNonSubsidi(inputs);
    };

    const generateStrukSubsidi = (data) => {
        clearContent();
        settingsBtn.style.display = 'none';
        const wrapperTemplate = document.getElementById('struk-wrapper-template').innerHTML;
        contentArea.innerHTML = wrapperTemplate;

        const strukResult = document.getElementById('struk-result');
        const transactionId = '729' + Math.floor(1000 + Math.random() * 9000);
        
        // PERUBAHAN: Format waktu dari data input
        const transactionTime = new Date(data.waktu);
        const formattedTransactionTime = transactionTime.toLocaleString('id-ID', {
            day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
        }).replace(/\./g, ':').replace(',', '');

        const hargaJual = data.hargaNonSubsidi - data.subsidiPemerintah;
        const totalTanpaSubsidi = Math.round(data.hargaNonSubsidi * data.volume);
        const totalSubsidi = Math.round(data.subsidiPemerintah * data.volume);
        const dibayarKonsumen = totalTanpaSubsidi - totalSubsidi;
        const change = data.totalHarga - dibayarKonsumen;

        let changeHTML = '';
        if (change > 0) {
            changeHTML = `<div class="struk-line-split"><span>CHANGE</span><span><br>${change.toLocaleString('id-ID')}</br></span></div>`;
        }
        
        const strukHTML = `
            <img src="img/logo.png" alt="Logo" class="logo">
            <div class="spbu-code">3411506</div>
            <div class="center">SPBU KEDOYA KEBON JERUK</div>
            <div class="center">Jl KEDOYA KEBON JERUK</div>
            <div class="struk-line-split"><span>Shift: ${data.shift}</span><span>No.Trans: ${transactionId}</span></div>
            <div>Waktu: ${formattedTransactionTime}</div><hr>
            <div class="grid-section values-left">
                <span class="label">Pulau/Pompa</span><span class="separator">:</span><span class="value">${data.pulau}</span>
                <span class="label">Operator</span><span class="separator">:</span><span class="value">${data.operator}</span>
                <span class="label">Jenis BBM</span><span class="separator">:</span><span class="value">${productName}</span>
                <span class="label">Volume</span><span class="separator">:</span><span class="value">${data.volume.toFixed(2)} L</span>
            </div><hr>
            <div>Informasi Harga (Rp/Liter)</div>
            <div class="grid-section">
                <span class="label">Harga Non Subsidi</span><span class="separator">:</span><span class="value">${data.hargaNonSubsidi.toLocaleString('id-ID')}</span>
                <span class="label">Subsidi Pemerintah</span><span class="separator">:</span><span class="value">${data.subsidiPemerintah.toLocaleString('id-ID')}</span>
                <span class="label">Harga Jual</span><span class="separator">:</span><span class="value">${hargaJual.toLocaleString('id-ID')}</span>
            </div><hr>
            <div>Total Penjualan (Rp)</div>
            <div class="grid-section">
                <span class="label">Tanpa Subsidi</span><span class="separator">:</span><span class="value">${totalTanpaSubsidi.toLocaleString('id-ID')}</span>
                <span class="label">Total Subsidi</span><span class="separator">:</span><span class="value">${totalSubsidi.toLocaleString('id-ID')}</span>
                <span class="label">Dibayar Konsumen</span><span class="separator">:</span><span class="value">${dibayarKonsumen.toLocaleString('id-ID')}</span>
            </div><hr>
            <div class="struk-line-split"><span>${data.pembayaran}</span><span><br>${data.totalHarga.toLocaleString('id-ID')}</br></span></div>
            ${changeHTML}<hr>
            <div class="grid-section values-left"><span class="label">No. Plat</span><span class="separator">:</span><span class="value">${data.plat}</span></div><hr>
            <div class="center">Anda mendapat subsidi dari Pemerintah sebesar ${formatRupiah(totalSubsidi)} (Perhitungan Subsidi Unaudited atau Estimasi). Gunakan BBM Subsidi Secara Bijak.</div>`;
        strukResult.innerHTML = strukHTML;
        attachActionButtons();
    };

    const generateStrukNonSubsidi = (data) => {
        clearContent();
        settingsBtn.style.display = 'none';
        const wrapperTemplate = document.getElementById('struk-wrapper-template').innerHTML;
        contentArea.innerHTML = wrapperTemplate;

        const strukResult = document.getElementById('struk-result');
        const transactionId = '729' + Math.floor(1000 + Math.random() * 9000);
        
        // PERUBAHAN: Format waktu dari data input
        const transactionTime = new Date(data.waktu);
        const formattedTransactionTime = transactionTime.toLocaleString('id-ID', {
            day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
        }).replace(/\./g, ':').replace(',', '');

        const totalHarga = Math.round(data.hargaLiter * data.volume);
        const change = data.totalHarga - totalHarga;

        let changeHTML = '';
        if (change > 0) {
            changeHTML = `<div class="struk-line-split"><span>CHANGE</span><span><br>${change.toLocaleString('id-ID')}</br></span></div>`;
        }
        
        const strukHTML = `
            <img src="img/logo.png" alt="Logo" class="logo">
            <div class="spbu-code">3411506</div>
            <div class="center">SPBU KEDOYA KEBON JERUK</div>
            <div class="center">Jl KEDOYA KEBON JERUK</div>
            <div class="struk-line-split"><span>Shift: ${data.shift}</span><span>No.Trans: ${transactionId}</span></div>
            <div>Waktu: ${formattedTransactionTime}</div><hr>
            <div class="grid-section values-left">
                <span class="label">Pulau/Pompa</span><span class="separator">:</span><span class="value">${data.pulau}</span>
                <span class="label">Nama Produk</span><span class="separator">:</span><span class="value">${productName}</span>
                <span class="label">Harga/Liter</span><span class="separator">:</span><span class="value">Rp ${data.hargaLiter.toLocaleString('id-ID')}</span>
                <span class="label">Volume</span><span class="separator">:</span><span class="value">${data.volume.toFixed(2)} L</span>
                <span class="label">Total Harga</span><span class="separator">:</span><span class="value">Rp ${totalHarga.toLocaleString('id-ID')}</span>
                <span class="label">Operator</span><span class="separator">:</span><span class="value">${data.operator}</span>
            </div><hr>
            <div class="struk-line-split"><span>${data.pembayaran}</span><span><br>${data.totalHarga.toLocaleString('id-ID')}</br></span></div>
            ${changeHTML}<hr>`;
        strukResult.innerHTML = strukHTML;
        attachActionButtons();
    };
    
    function attachActionButtons() {
        document.getElementById('save-btn').addEventListener('click', () => {
            const strukElement = document.getElementById('struk-result');
            const options = { useCORS: true, backgroundColor: '#ffffff' };
            html2canvas(strukElement, options).then(canvas => {
                const link = document.createElement('a');
                link.download = `struk-${currentMenu}-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            });
        });

        document.getElementById('print-btn').addEventListener('click', () => {
            window.print();
        });
    }
});