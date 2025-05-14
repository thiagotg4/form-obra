let leitorRetirada, leitorMacico;
let registros = [];
let exportados = [];

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

window.onload = () => {
  const salvo = localStorage.getItem('registros');
  const prev = localStorage.getItem('exportados');
  if (salvo) registros = JSON.parse(salvo);
  if (prev) exportados = JSON.parse(prev);
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
  const placa = document.getElementById('placa-retirada').value.trim();
  const data = document.getElementById('dataRetirada').value;
  const escavadeira = document.getElementById('escavadeira').value.trim();
  const origem = document.getElementById('origem-retirada').value;
  const horaInicial = document.getElementById('horaInicial').value;
  const kmInicial = document.getElementById('kmInicial').value;
  const observacao = document.getElementById('obsRetirada').value;

  if (!placa || !data || !escavadeira || !origem || !horaInicial || !kmInicial) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  const entrada = {
    tipo: "jazida",
    placa,
    data,
    escavadeira,
    origem,
    destino: "Maçiço",
    horaInicial,
    kmInicial,
    observacao
  };

  registros.push(entrada);
  localStorage.setItem('registros', JSON.stringify(registros));
  alert('Registro salvo!');
  limparFormularioRetirada();
}

function salvarMacico() {
  const placa = document.getElementById('placa-macico').value.trim();
  const data = document.getElementById('dataMacico').value;
  const origem = document.getElementById('origem-macico').value;
  const horaFinal = document.getElementById('horaFinal').value;
  const kmFinal = document.getElementById('kmFinal').value;

  if (!placa || !data || !origem || !horaFinal || !kmFinal) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  const entrada = {
    tipo: "macico",
    placa,
    data,
    origem,
    horaFinal,
    kmFinal
  };

  registros.push(entrada);
  localStorage.setItem('registros', JSON.stringify(registros));
  alert('Registro salvo!');
  limparFormularioMacico();
}

function exportarXLSX() {
  if (registros.length === 0) {
    alert("Nenhum dado para exportar.");
    return;
  }

  const temExportados = exportados.length > 0;
  let incluirAnteriores = true;

  if (temExportados) {
    incluirAnteriores = confirm("Deseja incluir registros já exportados?");
  }

  let registrosParaExportar;

  if (incluirAnteriores) {
    registrosParaExportar = [...exportados, ...registros];
  } else {
    registrosParaExportar = [...registros];
    exportados = []; // limpa os antigos
  }

  const dados = [
    [
      'Tipo de Formulário',
      'Data',
      'Escavadeira',
      'Caminhão',
      'Origem',
      'Hora Inicial',
      'Km Inicial',
      'Destino',
      'Hora Final',
      'Km Final',
      'Observação'
    ],
    ...registrosParaExportar.map(r => [
      r.tipo || '',
      r.data || '',
      r.escavadeira || '',
      r.placa || '',
      r.origem || '',
      r.horaInicial || '',
      r.kmInicial || '',
      r.destino || '',
      r.horaFinal || '',
      r.kmFinal || '',
      r.observacao || ''
    ])
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(dados);

  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cell]) continue;
    ws[cell].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "DDDDDD" } }
    };
  }

  ws['!cols'] = Array(dados[0].length).fill({ wch: 20 });
  XLSX.utils.book_append_sheet(wb, ws, "Registros");
  XLSX.writeFile(wb, 'registros_caminhoes.xlsx');

  // Atualiza os registros exportados
  exportados = [...exportados, ...registros];
  localStorage.setItem('exportados', JSON.stringify(exportados));

  // Limpa os registros atuais
  registros = [];
  localStorage.setItem('registros', JSON.stringify(registros));

  alert("Exportação concluída.");
}
