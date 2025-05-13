let leitorRetirada, leitorMacico;
let registros = [];

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

function abrirFormulario(tipo) {
  document.getElementById('menu-inicial').classList.add('hidden');
  if (tipo === 'retirada') {
    document.getElementById('form-retirada').classList.remove('hidden');
    leitorRetirada = new ZXing.BrowserQRCodeReader();
    leitorRetirada.decodeFromVideoDevice(null, 'video-retirada', (result, err) => {
      if (result) document.getElementById('placa-retirada').value = result.getText();
    });
  } else {
    document.getElementById('form-macico').classList.remove('hidden');
    leitorMacico = new ZXing.BrowserQRCodeReader();
    leitorMacico.decodeFromVideoDevice(null, 'video-macico', (result, err) => {
      if (result) document.getElementById('placa-macico').value = result.getText();
    });
  }
}

function salvarRetirada() {
  const entrada = {
    tipo: "retirada",
    placa: document.getElementById('placa-retirada').value,
    escavadeira: document.getElementById('escavadeira').value,
    origem: document.getElementById('origem-retirada').value,
    destino: document.getElementById('destino-retirada').value,
    horaInicial: document.getElementById('horaInicial').value,
    kmInicial: document.getElementById('kmInicial').value,
    observacao: document.getElementById('obsRetirada').value,
    timestamp: new Date().toISOString()
  };
  registros.push(entrada);
  localStorage.setItem('registros', JSON.stringify(registros));
  alert('Registro salvo!');
  document.getElementById('form-retirada').reset();
  document.getElementById('placa-retirada').value = '';
}

function salvarMacico() {
  const entrada = {
    tipo: "macico",
    placa: document.getElementById('placa-macico').value,
    origem: document.getElementById('origem-macico').value,
    horaFinal: document.getElementById('horaFinal').value,
    kmFinal: document.getElementById('kmFinal').value,
    timestamp: new Date().toISOString()
  };
  registros.push(entrada);
  localStorage.setItem('registros', JSON.stringify(registros));
  alert('Registro salvo!');
  document.getElementById('form-macico').reset();
  document.getElementById('placa-macico').value = '';
}

function exportarCSV() {
  if (registros.length === 0) return alert("Nenhum dado para exportar.");

  const cabecalho = [
    'Tipo', 'Placa', 'Escavadeira', 'Origem', 'Destino',
    'Hora Inicial', 'KM Inicial', 'Hora Final', 'KM Final', 'Observações', 'Timestamp'
  ];

  const linhas = registros.map(r => [
    r.tipo || '',
    r.placa || '',
    r.escavadeira || '',
    r.origem || '',
    r.destino || '',
    r.horaInicial || '',
    r.kmInicial || '',
    r.horaFinal || '',
    r.kmFinal || '',
    r.observacao || '',
    r.timestamp || ''
  ]);

  const conteudo = [cabecalho, ...linhas].map(l => l.join(';')).join('\n');
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'registros_caminhoes.csv';
  a.click();
}

window.onload = () => {
  const salvo = localStorage.getItem('registros');
  if (salvo) registros = JSON.parse(salvo);
};
