let leitorRetirada, leitorMacico;
let registros = [];
let exportados = [];

const escavadeirasValidas = [];
for (let i = 1; i <= 20; i++) {
  escavadeirasValidas.push(`EHE-${String(i).padStart(3, '0')}`);
  escavadeirasValidas.push(`EHS-${String(i).padStart(3, '0')}`);
}

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
      if (result) {
        document.getElementById('placa-retirada').value = result.getText();
        setTimeout(() => preencherDataHora('dataRetirada', 'horaInicial'), 100);
      }
    });
  } else if (tipo === 'macico') {
    limparFormularioMacico();
    document.getElementById('form-macico').classList.remove('hidden');
    leitorMacico = new ZXing.BrowserQRCodeReader();
    leitorMacico.decodeFromVideoDevice(null, 'video-macico', (result, err) => {
      if (result) {
        document.getElementById('placa-macico').value = result.getText();
        setTimeout(() => preencherDataHora('dataMacico', 'horaFinal'), 100);
      }
    });
  }
}

function preencherDataHora(idData, idHora) {
  const agora = new Date();
  document.getElementById(idData).value = agora.toISOString().split('T')[0];
  document.getElementById(idHora).value = agora.toTimeString().slice(0, 5);
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
  document.getElementById('horaInicial').value = '';
  document.getElementById('escavadeira').value = '';
  document.getElementById('origem-retirada').value = '';
  document.getElementById('destino-retirada').value = 'Maçiço';
  document.getElementById('obsRetirada').value = '';
  document.getElementById('sugestoes-escavadeira').classList.add('hidden');
}

function limparFormularioMacico() {
  document.getElementById('placa-macico').value = '';
  document.getElementById('dataMacico').value = '';
  document.getElementById('horaFinal').value = '';
  document.getElementById('origem-macico').value = '';
  document.getElementById('destino-macico').value = 'Maçiço';
}

function salvarRetirada() {
  const placa = document.getElementById('placa-retirada').value.trim();
  const data = document.getElementById('dataRetirada').value;
  const horaInicial = document.getElementById('horaInicial').value;
  const escavadeira = document.getElementById('escavadeira').value.trim().toUpperCase();
  const origem = document.getElementById('origem-retirada').value;
  const destino = document.getElementById('destino-retirada').value;
  const observacao = document.getElementById('obsRetirada').value;

  if (!placa || !data || !horaInicial || !escavadeira || !origem || !destino) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  if (!escavadeirasValidas.includes(escavadeira)) {
    alert("Por favor, selecione uma escavadeira válida.");
    return;
  }

  const entrada = {
    tipo: "jazida",
    placa,
    data,
    horaInicial,
    escavadeira,
    origem,
    destino,
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
  const horaFinal = document.getElementById('horaFinal').value;
  const origem = document.getElementById('origem-macico').value;
  const destino = document.getElementById('destino-macico').value;

  if (!placa || !data || !horaFinal || !origem || !destino) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  const tipoForm = destino.toLowerCase().replace(' ', '_'); // "Maçiço" -> "maçiço", "Bota Fora" -> "bota_fora"

  const entrada = {
    tipo: tipoForm,
    placa,
    data,
    horaFinal,
    origem,
    destino
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

  let registrosParaExportar = incluirAnteriores ? [...exportados, ...registros] : [...registros];
  if (!incluirAnteriores) exportados = [];

  const dados = [
    [
      'Tipo de Formulário', 'Data', 'Escavadeira', 'Caminhão',
      'Origem', 'Hora Inicial', 'Destino', 'Hora Final', 'Observação'
    ],
    ...registrosParaExportar.map(r => [
      r.tipo || '', r.data || '', r.escavadeira || '', r.placa || '',
      r.origem || '', r.horaInicial || '', r.destino || '', r.horaFinal || '', r.observacao || ''
    ])
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(dados);
  XLSX.utils.book_append_sheet(wb, ws, "Registros");
  XLSX.writeFile(wb, 'registros_caminhoes.xlsx');

  exportados = [...exportados, ...registros];
  localStorage.setItem('exportados', JSON.stringify(exportados));
  registros = [];
  localStorage.setItem('registros', JSON.stringify(registros));

  alert("Exportação concluída.");
}

// Autocompletar sugestões
const inputEscavadeira = document.getElementById('escavadeira');
const listaSugestoes = document.getElementById('sugestoes-escavadeira');

inputEscavadeira.addEventListener('input', () => {
  const valor = inputEscavadeira.value.toUpperCase();
  listaSugestoes.innerHTML = '';
  if (!valor) {
    listaSugestoes.classList.add('hidden');
    return;
  }

  const filtradas = escavadeirasValidas.filter(e => e.startsWith(valor));
  if (filtradas.length === 0) {
    listaSugestoes.classList.add('hidden');
    return;
  }

  filtradas.forEach(opcao => {
    const item = document.createElement('li');
    item.textContent = opcao;
    item.addEventListener('click', () => {
      inputEscavadeira.value = opcao;
      listaSugestoes.innerHTML = '';
      listaSugestoes.classList.add('hidden');
    });
    listaSugestoes.appendChild(item);
  });

  listaSugestoes.classList.remove('hidden');
});

document.addEventListener('click', (e) => {
  if (!inputEscavadeira.contains(e.target) && !listaSugestoes.contains(e.target)) {
    listaSugestoes.classList.add('hidden');
  }
});
