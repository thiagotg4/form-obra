let qrCode = '';
let savedEntries = [];

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}

// QR code scanning
const codeReader = new ZXing.BrowserQRCodeReader();
codeReader.decodeFromVideoDevice(null, 'video', (result, err) => {
    if (result) {
        qrCode = result.getText();
        document.getElementById('placa').value = qrCode;
    }
});

// Form submission
document.getElementById('form').addEventListener('submit', (e) => {
    e.preventDefault();

    const local = document.getElementById('local').value;
    const dataRetirada = document.getElementById('dataRetirada').value;
    const hora = document.getElementById('hora').value;

    const entry = {
        qrCode,
        local,
        dataRetirada,
        hora,
        timestamp: new Date().toISOString()
    };

    savedEntries.push(entry);
    localStorage.setItem('entries', JSON.stringify(savedEntries));
    showEntries();
    e.target.reset();
    document.getElementById('placa').value = '';
    qrCode = '';
    alert('Salvo localmente!');
});

function showEntries() {
    const div = document.getElementById('entries');
    div.innerHTML = '';
    savedEntries.forEach((e, i) => {
        div.innerHTML += `<div class="entry">
      <strong>${i + 1}.</strong> ${e.qrCode} - ${e.local} - ${e.dataRetirada} - ${e.hora}
    </div>`;
    });
}

function exportCSV() {
    if (savedEntries.length === 0) {
        alert("Nenhum dado salvo.");
        return;
    }

    const rows = [
        ['QR Code', 'Local', 'Data de Retirada', 'Hora', 'Timestamp'],
        ...savedEntries.map(e => [e.qrCode, e.local, e.dataRetirada, e.hora, e.timestamp])
    ];

    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'dados_formulario.csv';
    a.click();
}

window.onload = () => {
    const stored = localStorage.getItem('entries');
    if (stored) {
        savedEntries = JSON.parse(stored);
        showEntries();
    }
};
