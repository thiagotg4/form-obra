let leitorRetirada, leitorMacico;
let registros = [];

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

window.onload = () => {
  const salvo = localStorage.getItem('registros');
  if (salvo) registros = JSON.parse(salvo);
};

function abrirFormulario(tipo) {
  document.getElementById('menu-inicial').classList.add('hidden');

  if (tipo === 'retirada') {
    limparFormularioRetirada();
    document.getElementById('form-retirada').classList.remove('hidden');
    leitorRetirada = new ZXing.BrowserQRCodeReader();
    leitorRetirada.decodeFromVideoDevice(null, 'video-retirada', (result, err) => {
      if (result) document.getElementById('placa-retirada').value = result.getText();
    });
  } else {
    limparFormularioMacico();
    document.getElementById('form-macico').classList.remove('hidden');
    leitorMacico = new ZXing.BrowserQRCodeReader();
    leitorMacico.decodeFromVideoDevice(null, 'video-macico', (result, err) => {
      if (result) document.getElementById('placa-macico').value = result.getText();
    });
  }
}

function voltarMenu() {
  document.getElementById('menu-inicial').classList.remove('hidden');
  document.getElementById('form-retirada').classList.add('hidden');
  document.getElementById('form-macico').classList.add('hidden');

  if (leitorRetirada) leitorRetirada.reset();
  if (leitorMacico) leitorMacico.reset();

  limparFormularioRetirada();
  limparFormularioMacico();
}

function limparFormularioRetirada() {
  document.getElementById('placa-retirada').value = '';
  document.getElementById('dataRetirada').value = '';
  document.getElementById('escavadeira').value = '';
  document.getElementById('origem-retirada').value = '';
  document.getElementById('horaInicial').value = '';
  document.getElementById('kmInicial').value = '';
  document.getElementById('obsRetirada').value = '';
}

function limparFormularioMacico() {
  document.getElementById('placa-macico').value = '';
  document.getElementById('dataMacico').value = '';
  document.getElementById('origem-macico').value = '';
  document.getElementById('horaFinal').value = '';
  document.getElementById('kmFinal').value = '';
}

function salvarRetirada() {
  const entrada = {
    tipo: "jazida",
    placa: document.getElementById('placa-retirada').value,
    data: document.getElementById('dataRetirada').value,
    escavadeira: document.getElementById('escavadeira').value,
    origem: document.getElementById('origem-retirada').value,
    destino: "Maçiço",
    horaInicial: document.getElementById('horaInicial').value,
    kmInicial: document.getElementById('kmInicial').value,
    observacao: document.getElementById('obsRetirada').value,
    timestamp: new Date().toISOString()
  };

  registros.push(entrada);
  localStorage.setItem('registros', JSON.stringify(registros));
  alert('Registro salvo!');
  limparFormularioRetirada();
}

function salvarMacico() {
  const entrada = {
    tipo: "macico",
    placa: document.getElementById('placa-macico').value,
    data: document.getElementById('dataMacico').value,
    origem: document.getElementById('origem-macico').value,
    horaFinal: document.getElementById('horaFinal').value,
    kmFinal: document.getElementById('kmFinal').value,
    timestamp: new Date().toISOString()
  };

  registros.push(entrada);
  localStorage.setItem('registros', JSON.stringify(registros));
  alert('Registro salvo!');
  limparFormularioMacico();
}

function exportarCSV() {
  if (registros.length === 0) {
    alert("Nenhum dado para exportar.");
    return;
  }

  const cabecalho = [
    'Tipo', 'Placa', 'Data', 'Escavadeira', 'Origem', 'Destino',
    'Hora Inicial', 'KM Inicial', 'Hora Final', 'KM Final', 'Observações', 'Timestamp'
  ];

  const linhas = registros.map(r => [
    r.tipo || '',
    r.placa || '',
    r.data || '',
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
