// VARIÁVEIS GLOBAIS
let rendas = [];
let gastos = [];
let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();
let itemEditando = null;
let tipoAtual = 'renda';
let iconeSelecionado = null;

// ÍCONES SEPARADOS POR TIPO
const iconesRendas = ['💰', '💳', '🏦', '💼', '👨‍💼', '👩‍💼', '🏠',  '🚗', '🎓', '💡', '🏆', '⭐', '🎯', '📈', '💵', '💎', '🏅'];
const iconesGastos = ['💸', '🛒', '🍔', '🏥', '🎬', '🎮', '🍽️', '🛍️', '✂️', '🔧', '⚡', '💧', '📱', '✈️', '📚','🚌', '⛽', '💊', '📺', '🎵', '🎨', '⚽', '🎭', '🧹', '🧴', '💈', '🎁'];
const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// ─── CHAVE DO MÊS ATUAL ────────────────────────────────────────────────────
function chaveMes(mes, ano) {
    return `cashly_${ano}_${String(mes).padStart(2, '0')}`;
}

// ─── CARREGAR DADOS DO MÊS/ANO ────────────────────────────────────────────
function carregarDadosMes(mes, ano) {
    try {
        const raw = localStorage.getItem(chaveMes(mes, ano));
        if (raw) {
            const parsed = JSON.parse(raw);
            rendas = parsed.rendas || [];
            gastos = parsed.gastos || [];
        } else {
            // Mês sem dados ainda → começa vazio
            rendas = [];
            gastos = [];
        }
    } catch (e) {
        console.error('Erro ao carregar dados do mês:', e);
        rendas = [];
        gastos = [];
    }
}

// ─── SALVAR DADOS DO MÊS ATUAL ────────────────────────────────────────────
function salvarDados() {
    const dados = {
        rendas,
        gastos,
        dataSalvamento: new Date().toISOString()
    };
    localStorage.setItem(chaveMes(mesAtual, anoAtual), JSON.stringify(dados));
}

// ─── BACKUP COMPLETO (todos os meses) ────────────────────────────────────
function fazerBackup() {
    const tudo = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cashly_')) {
            try { tudo[key] = JSON.parse(localStorage.getItem(key)); } catch (_) {}
        }
    }

    const blob = new Blob([JSON.stringify(tudo, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashly-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Backup criado com sucesso! Todos os meses foram exportados.');
}

// ─── LIMPAR APENAS O MÊS ATUAL ────────────────────────────────────────────
function limparDados() {
    if (confirm(`Tem certeza que deseja limpar os dados de ${meses[mesAtual]} ${anoAtual}? Esta ação não pode ser desfeita.`)) {
        rendas = [];
        gastos = [];
        localStorage.removeItem(chaveMes(mesAtual, anoAtual));
        atualizarTudo();
        alert(`Dados de ${meses[mesAtual]} ${anoAtual} foram limpos!`);
    }
}

// ─── QUANDO A PÁGINA CARREGAR ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
    console.log('Cashly iniciado!');
    carregarDadosMes(mesAtual, anoAtual);
    configurarEventos();
    inicializarAnos();
    atualizarTudo();
});

// ─── CONFIGURAR TODOS OS EVENTOS ──────────────────────────────────────────
function configurarEventos() {
    // MENU
    document.getElementById('btnMenuInicio').onclick = () => mostrarTela('principal');
    document.getElementById('btnMenuResumo').onclick = () => mostrarTela('resumo');
    document.getElementById('btnMenuAjustes').onclick = () => mostrarTela('ajustes');

    // BOTÕES PRINCIPAIS
    document.getElementById('btnRendas').onclick = () => mostrarTela('rendas');
    document.getElementById('btnGastos').onclick = () => mostrarTela('gastos');

    // BOTÕES VOLTAR
    document.getElementById('btnVoltarRendas').onclick = () => mostrarTela('principal');
    document.getElementById('btnVoltarGastos').onclick = () => mostrarTela('principal');
    document.getElementById('btnVoltarResumo').onclick = () => mostrarTela('principal');
    document.getElementById('btnVoltarAjustes').onclick = () => mostrarTela('principal');

    // BOTÕES ADICIONAR
    document.getElementById('btnAddRenda').onclick = () => {
        tipoAtual = 'renda';
        itemEditando = null;
        abrirModal();
    };

    document.getElementById('btnAddGasto').onclick = () => {
        tipoAtual = 'gasto';
        itemEditando = null;
        abrirModal();
    };

    // SELEÇÃO DE MÊS
    document.getElementById('btnMes').onclick = () => {
        document.getElementById('selectMes').value = mesAtual;
        document.getElementById('selectAno').value = anoAtual;
        document.getElementById('modalMes').style.display = 'flex';
    };

    document.getElementById('btnCancelarMes').onclick = () => {
        document.getElementById('modalMes').style.display = 'none';
    };

    document.getElementById('btnSalvarMes').onclick = () => {
        const novoMes = parseInt(document.getElementById('selectMes').value);
        const novoAno = parseInt(document.getElementById('selectAno').value);

        // Troca de mês → carrega dados do novo período
        mesAtual = novoMes;
        anoAtual = novoAno;
        carregarDadosMes(mesAtual, anoAtual);

        document.getElementById('btnMes').innerHTML = `${meses[mesAtual]} ${anoAtual} ▼`;
        document.getElementById('modalMes').style.display = 'none';
        atualizarTudo();
    };

    // AJUSTES
    document.getElementById('btnBackup').onclick = fazerBackup;
    document.getElementById('btnLimpar').onclick = limparDados;
    document.getElementById('btnInstalar').onclick = instalarApp;

    // MODAL TRANSAÇÃO
    document.getElementById('btnFecharModal').onclick = fecharModal;
    document.getElementById('btnCancelarModal').onclick = fecharModal;

    document.getElementById('formTransacao').onsubmit = function (e) {
        e.preventDefault();
        salvarTransacao();
    };
}

// ─── INICIALIZAR ANOS ─────────────────────────────────────────────────────
function inicializarAnos() {
    const selectAno = document.getElementById('selectAno');
    selectAno.innerHTML = '';
    const anoBase = new Date().getFullYear();
    for (let ano = anoBase - 2; ano <= anoBase + 3; ano++) {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        if (ano === anoAtual) option.selected = true;
        selectAno.appendChild(option);
    }
}

// ─── MOSTRAR TELA ─────────────────────────────────────────────────────────
function mostrarTela(telaNome) {
    document.querySelectorAll('.tela').forEach(tela => { tela.style.display = 'none'; });

    const id = 'tela' + telaNome.charAt(0).toUpperCase() + telaNome.slice(1);
    const tela = document.getElementById(id);
    if (tela) tela.style.display = 'flex';

    // Atualizar menu ativo
    document.querySelectorAll('#btnMenuInicio, #btnMenuResumo, #btnMenuAjustes').forEach(btn => {
        btn.style.color = '#666';
        btn.style.fontWeight = 'normal';
    });

    if (telaNome === 'principal') {
        document.getElementById('btnMenuInicio').style.color = '#8a2be2';
        document.getElementById('btnMenuInicio').style.fontWeight = 'bold';
        atualizarUltimas();
    } else if (telaNome === 'resumo') {
        document.getElementById('btnMenuResumo').style.color = '#8a2be2';
        document.getElementById('btnMenuResumo').style.fontWeight = 'bold';
        atualizarResumoDetalhado();
    } else if (telaNome === 'ajustes') {
        document.getElementById('btnMenuAjustes').style.color = '#8a2be2';
        document.getElementById('btnMenuAjustes').style.fontWeight = 'bold';
    } else if (telaNome === 'rendas') {
        renderizarLista('rendas');
    } else if (telaNome === 'gastos') {
        renderizarLista('gastos');
    }
}

// ─── ATUALIZAR TUDO ───────────────────────────────────────────────────────
function atualizarTudo() {
    const totalRendas = rendas.reduce((t, i) => t + i.valor, 0);
    const totalGastos = gastos.reduce((t, i) => t + i.valor, 0);
    const saldo = totalRendas - totalGastos;

    document.getElementById('totalRendas').textContent = formatarMoeda(totalRendas);
    document.getElementById('totalGastos').textContent = formatarMoeda(totalGastos);
    document.getElementById('saldoTotal').textContent = formatarMoeda(saldo);
    document.getElementById('saldoTotal').style.color = saldo >= 0 ? '#34c759' : '#ff3b30';
    document.getElementById('btnMes').innerHTML = `${meses[mesAtual]} ${anoAtual} ▼`;

    atualizarUltimas();
}

function formatarMoeda(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

// ─── ÚLTIMAS TRANSAÇÕES ───────────────────────────────────────────────────
function atualizarUltimas() {
    const container = document.getElementById('ultimasLista');
    const todas = [
        ...rendas.map(i => ({ ...i, tipo: 'renda' })),
        ...gastos.map(i => ({ ...i, tipo: 'gasto' }))
    ].sort((a, b) => b.id - a.id).slice(0, 10);

    if (todas.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#999;padding:20px;">Nenhuma transação adicionada</div>';
        return;
    }

    container.innerHTML = todas.map(item => {
        const cor = item.tipo === 'renda' ? '#34c759' : '#ff3b30';
        const d = new Date(item.data);
        const dataFmt = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
        return `
            <div style="display:flex;align-items:center;padding:10px 0;border-bottom:1px solid #f0f0f0;">
                <div style="font-size:22px;width:35px;text-align:center;">${item.icone || '💰'}</div>
                <div style="flex:1;">
                    <div style="font-weight:bold;font-size:14px;">${item.nome}</div>
                    <div style="color:${cor};font-weight:bold;font-size:14px;">${formatarMoeda(item.valor)}</div>
                    <div style="color:#999;font-size:11px;margin-top:2px;">${dataFmt}</div>
                </div>
            </div>`;
    }).join('');
}

// ─── RESUMO DETALHADO ─────────────────────────────────────────────────────
function atualizarResumoDetalhado() {
    const totalRendas = rendas.reduce((t, i) => t + i.valor, 0);
    const totalGastos = gastos.reduce((t, i) => t + i.valor, 0);
    const saldo = totalRendas - totalGastos;

    document.getElementById('resumoRendas').textContent = formatarMoeda(totalRendas);
    document.getElementById('resumoGastos').textContent = formatarMoeda(totalGastos);
    document.getElementById('resumoSaldo').textContent = formatarMoeda(saldo);
    document.getElementById('resumoSaldo').style.color = saldo >= 0 ? '#34c759' : '#ff3b30';
}

// ─── RENDERIZAR LISTA ─────────────────────────────────────────────────────
function renderizarLista(tipo) {
    const lista = tipo === 'rendas' ? rendas : gastos;
    const container = document.getElementById(`lista${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    const cor = tipo === 'rendas' ? '#34c759' : '#ff3b30';

    if (lista.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">Nenhum item adicionado</div>';
        return;
    }

    container.innerHTML = lista.map(item => {
        const d = new Date(item.data);
        const dataFmt = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
        return `
            <div style="background:white;border-radius:12px;padding:12px;margin-bottom:10px;border:1px solid #e0e0e0;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                    <div style="display:flex;align-items:center;gap:12px;flex:1;">
                        <div style="font-size:24px;width:35px;text-align:center;">${item.icone || '💰'}</div>
                        <div style="flex:1;">
                            <div style="font-weight:bold;font-size:15px;margin-bottom:3px;">${item.nome}</div>
                            <div style="color:${cor};font-weight:bold;font-size:15px;">${formatarMoeda(item.valor)}</div>
                            <div style="color:#999;font-size:11px;margin-top:2px;">${dataFmt}</div>
                            ${item.fixo ? '<div style="font-size:10px;color:#ff9800;margin-top:3px;background:#fff3e0;padding:2px 6px;border-radius:8px;display:inline-block;">FIXO</div>' : ''}
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button onclick="editarItem('${tipo.slice(0,-1)}', ${item.id})" style="background:none;border:none;font-size:18px;color:#8a2be2;padding:5px;width:36px;height:36px;">✏️</button>
                        <button onclick="excluirItem('${tipo.slice(0,-1)}', ${item.id})" style="background:none;border:none;font-size:18px;color:#ff3b30;padding:5px;width:36px;height:36px;">🗑️</button>
                    </div>
                </div>
            </div>`;
    }).join('');
}

// ─── MODAL ────────────────────────────────────────────────────────────────
function inicializarIcones(tipo) {
    const container = document.getElementById('iconesContainer');
    container.innerHTML = '';
    const icones = tipo === 'renda' ? iconesRendas : iconesGastos;

    icones.forEach(icone => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.style.cssText = 'width:44px;height:44px;font-size:20px;background:#f0f0f0;border:2px solid transparent;border-radius:8px;cursor:pointer;';
        btn.textContent = icone;
        btn.dataset.icone = icone;
        btn.onclick = function () {
            container.querySelectorAll('button').forEach(b => { b.style.background = '#f0f0f0'; b.style.borderColor = 'transparent'; });
            this.style.background = '#e6d4ff';
            this.style.borderColor = '#8a2be2';
            iconeSelecionado = this.textContent;
        };
        container.appendChild(btn);
    });

    setTimeout(() => {
        const primeiro = container.querySelector('button');
        if (primeiro) { primeiro.style.background = '#e6d4ff'; primeiro.style.borderColor = '#8a2be2'; iconeSelecionado = primeiro.textContent; }
    }, 100);
}

function abrirModal() {
    document.getElementById('formTransacao').reset();

    if (tipoAtual === 'renda') {
        document.getElementById('modalTitulo').textContent = itemEditando ? 'Editar Renda' : 'Nova Renda';
        document.getElementById('divFixo').style.display = 'none';
    } else {
        document.getElementById('modalTitulo').textContent = itemEditando ? 'Editar Despesa' : 'Nova Despesa';
        document.getElementById('divFixo').style.display = 'block';
    }

    inicializarIcones(tipoAtual);

    if (itemEditando) {
        document.getElementById('inputNome').value = itemEditando.nome;
        document.getElementById('inputValor').value = itemEditando.valor;
        document.getElementById('inputId').value = itemEditando.id;
        if (tipoAtual === 'gasto') document.getElementById('inputFixo').checked = itemEditando.fixo || false;

        setTimeout(() => {
            const container = document.getElementById('iconesContainer');
            container.querySelectorAll('button').forEach(btn => {
                btn.style.background = '#f0f0f0'; btn.style.borderColor = 'transparent';
                if (btn.textContent === itemEditando.icone) {
                    btn.style.background = '#e6d4ff'; btn.style.borderColor = '#8a2be2';
                    iconeSelecionado = btn.textContent;
                }
            });
        }, 50);
    } else {
        document.getElementById('inputId').value = '';
    }

    document.getElementById('modal').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal').style.display = 'none';
    itemEditando = null;
    iconeSelecionado = null;
}

function salvarTransacao() {
    const nome = document.getElementById('inputNome').value.trim();
    const valor = parseFloat(document.getElementById('inputValor').value);
    const id = document.getElementById('inputId').value;

    if (!iconeSelecionado) { alert('Selecione um ícone!'); return; }
    if (!nome || isNaN(valor) || valor <= 0) { alert('Preencha todos os campos corretamente!'); return; }

    const fixo = tipoAtual === 'gasto' ? document.getElementById('inputFixo').checked : false;
    const transacao = { id: id ? parseInt(id) : Date.now(), nome, valor, icone: iconeSelecionado, fixo, data: new Date().toISOString() };

    if (tipoAtual === 'renda') {
        if (id) { const idx = rendas.findIndex(r => r.id === parseInt(id)); idx !== -1 ? rendas[idx] = transacao : rendas.push(transacao); }
        else rendas.push(transacao);
    } else {
        if (id) { const idx = gastos.findIndex(g => g.id === parseInt(id)); idx !== -1 ? gastos[idx] = transacao : gastos.push(transacao); }
        else gastos.push(transacao);
    }

    salvarDados();
    atualizarTudo();
    if (tipoAtual === 'renda') renderizarLista('rendas'); else renderizarLista('gastos');
    fecharModal();
    alert('Transação salva com sucesso!');
}

// ─── EDITAR / EXCLUIR ─────────────────────────────────────────────────────
function editarItem(tipo, id) {
    const lista = tipo === 'renda' ? rendas : gastos;
    itemEditando = lista.find(item => item.id === id);
    if (!itemEditando) { alert('Item não encontrado!'); return; }
    tipoAtual = tipo;
    abrirModal();
}

function excluirItem(tipo, id) {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    if (tipo === 'renda') rendas = rendas.filter(i => i.id !== id);
    else gastos = gastos.filter(i => i.id !== id);
    salvarDados();
    atualizarTudo();
    renderizarLista(tipo === 'renda' ? 'rendas' : 'gastos');
    alert('Item excluído com sucesso!');
}

// ─── INSTALAR APP ─────────────────────────────────────────────────────────
function instalarApp() {
    alert('Para instalar o app no iPhone:\n\n1. Abra no Safari\n2. Toque no botão de compartilhar (📤)\n3. Role para baixo\n4. Toque em "Adicionar à Tela de Início"\n5. Toque em "Adicionar"');
}
