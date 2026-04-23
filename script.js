// VARIÁVEIS GLOBAIS
let rendas = [];
let gastos = [];
let mesAtual = 0; // Janeiro
let anoAtual = 2026;
let itemEditando = null;
let tipoAtual = 'renda';
let iconeSelecionado = null;

// ÍCONES SEPARADOS POR TIPO
const iconesRendas = ['💰', '💳', '🏦', '💼', '👨‍💼', '👩‍💼', '🏠', '⚡', '💧', '📱', '✈️', '📚', '🚗', '🎓', '💡', '🏆', '⭐', '🎯', '📈', '💵', '💎', '🏅'];
const iconesGastos = ['💸', '🛒', '🍔', '🏥', '🎬', '🎮', '🍽️', '🛍️', '✂️', '🔧', '🚌', '⛽', '💊', '📺', '🎵', '🎨', '⚽', '🎭', '🧹', '🧴', '💈', '🎁'];
const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// QUANDO A PÁGINA CARREGAR
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cashly iniciado!');
    
    // CARREGAR DADOS
    carregarDados();
    
    // CONFIGURAR EVENTOS
    configurarEventos();
    
    // INICIALIZAR ANOS
    inicializarAnos();
    
    // ATUALIZAR TUDO
    atualizarTudo();
});

// CARREGAR DADOS DO LOCALSTORAGE
function carregarDados() {
    try {
        const dados = localStorage.getItem('cashlyData');
        if (dados) {
            const parsed = JSON.parse(dados);
            rendas = parsed.rendas || [];
            gastos = parsed.gastos || [];
        }
    } catch (e) {
        console.log('Erro ao carregar dados');
    }
}

// SALVAR DADOS NO LOCALSTORAGE
function salvarDados() {
    const dados = {
        rendas: rendas,
        gastos: gastos,
        dataSalvamento: new Date().toISOString()
    };
    localStorage.setItem('cashlyData', JSON.stringify(dados));
}

// CONFIGURAR TODOS OS EVENTOS
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
    
    // MODAL MÊS
    document.getElementById('btnCancelarMes').onclick = () => {
        document.getElementById('modalMes').style.display = 'none';
    };
    
    document.getElementById('btnSalvarMes').onclick = () => {
        mesAtual = parseInt(document.getElementById('selectMes').value);
        anoAtual = parseInt(document.getElementById('selectAno').value);
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
    
    document.getElementById('formTransacao').onsubmit = function(e) {
        e.preventDefault();
        salvarTransacao();
    };
}

// INICIALIZAR ÍCONES NO MODAL
function inicializarIcones(tipo) {
    const container = document.getElementById('iconesContainer');
    container.innerHTML = '';
    
    const icones = tipo === 'renda' ? iconesRendas : iconesGastos;
    
    icones.forEach(icone => {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.style.cssText = 'width: 44px; height: 44px; font-size: 20px; background: #f0f0f0; border: 2px solid transparent; border-radius: 8px; cursor: pointer;';
        botao.textContent = icone;
        botao.dataset.icone = icone;
        
        botao.onclick = function() {
            // Remover seleção anterior
            container.querySelectorAll('button').forEach(b => {
                b.style.background = '#f0f0f0';
                b.style.borderColor = 'transparent';
            });
            // Selecionar este
            this.style.background = '#e6d4ff';
            this.style.borderColor = '#8a2be2';
            iconeSelecionado = this.textContent;
        };
        
        container.appendChild(botao);
    });
    
    // Selecionar primeiro ícone
    setTimeout(() => {
        const primeiro = container.querySelector('button');
        if (primeiro) {
            primeiro.style.background = '#e6d4ff';
            primeiro.style.borderColor = '#8a2be2';
            iconeSelecionado = primeiro.textContent;
        }
    }, 100);
}

// INICIALIZAR ANOS (2026-2030)
function inicializarAnos() {
    const selectAno = document.getElementById('selectAno');
    selectAno.innerHTML = '';
    
    for (let ano = 2026; ano <= 2030; ano++) {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        if (ano === anoAtual) option.selected = true;
        selectAno.appendChild(option);
    }
}

// MOSTRAR TELA
function mostrarTela(telaNome) {
    // Esconder todas as telas
    document.querySelectorAll('.tela').forEach(tela => {
        tela.style.display = 'none';
    });
    
    // Mostrar tela selecionada
    const tela = document.getElementById('tela' + telaNome.charAt(0).toUpperCase() + telaNome.slice(1));
    if (tela) {
        tela.style.display = 'flex';
    }
    
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

// ATUALIZAR TUDO
function atualizarTudo() {
    // Calcular totais
    const totalRendas = rendas.reduce((total, item) => total + item.valor, 0);
    const totalGastos = gastos.reduce((total, item) => total + item.valor, 0);
    const saldo = totalRendas - totalGastos;
    
    // Atualizar display
    document.getElementById('totalRendas').textContent = formatarMoeda(totalRendas);
    document.getElementById('totalGastos').textContent = formatarMoeda(totalGastos);
    document.getElementById('saldoTotal').textContent = formatarMoeda(saldo);
    
    // Cor do saldo
    document.getElementById('saldoTotal').style.color = saldo >= 0 ? '#34c759' : '#ff3b30';
    
    // Atualizar mês
    document.getElementById('btnMes').innerHTML = `${meses[mesAtual]} ${anoAtual} ▼`;
    
    // Atualizar últimas
    atualizarUltimas();
}

function formatarMoeda(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

// ATUALIZAR ÚLTIMAS TRANSAÇÕES
function atualizarUltimas() {
    const container = document.getElementById('ultimasLista');
    const todasTransacoes = [
        ...rendas.map(item => ({...item, tipo: 'renda'})),
        ...gastos.map(item => ({...item, tipo: 'gasto'}))
    ].sort((a, b) => b.id - a.id).slice(0, 10);
    
    if (todasTransacoes.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">Nenhuma transação adicionada</div>';
        return;
    }
    
    let html = '';
    todasTransacoes.forEach(item => {
        const cor = item.tipo === 'renda' ? '#34c759' : '#ff3b30';
        const data = new Date(item.data);
        const dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}`;
        
        html += `
            <div style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
                <div style="font-size: 22px; width: 35px; text-align: center;">${item.icone || '💰'}</div>
                <div style="flex: 1;">
                    <div style="font-weight: bold; font-size: 14px;">${item.nome}</div>
                    <div style="color: ${cor}; font-weight: bold; font-size: 14px;">${formatarMoeda(item.valor)}</div>
                    <div style="color: #999; font-size: 11px; margin-top: 2px;">${dataFormatada}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ATUALIZAR RESUMO DETALHADO
function atualizarResumoDetalhado() {
    const totalRendas = rendas.reduce((total, item) => total + item.valor, 0);
    const totalGastos = gastos.reduce((total, item) => total + item.valor, 0);
    const saldo = totalRendas - totalGastos;
    
    document.getElementById('resumoRendas').textContent = formatarMoeda(totalRendas);
    document.getElementById('resumoGastos').textContent = formatarMoeda(totalGastos);
    document.getElementById('resumoSaldo').textContent = formatarMoeda(saldo);
    document.getElementById('resumoSaldo').style.color = saldo >= 0 ? '#34c759' : '#ff3b30';
}

// RENDERIZAR LISTA DE RENDAS OU GASTOS
function renderizarLista(tipo) {
    const lista = tipo === 'rendas' ? rendas : gastos;
    const container = document.getElementById(`lista${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    const cor = tipo === 'rendas' ? '#34c759' : '#ff3b30';
    
    if (lista.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;">Nenhum item adicionado</div>';
        return;
    }
    
    let html = '';
    lista.forEach(item => {
        const data = new Date(item.data);
        const dataFormatada = `${data.getDate().toString().padStart(2, '0')}/${(data.getMonth() + 1).toString().padStart(2, '0')}/${data.getFullYear()}`;
        
        html += `
            <div style="background: white; border-radius: 12px; padding: 12px; margin-bottom: 10px; border: 1px solid #e0e0e0;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                        <div style="font-size: 24px; width: 35px; text-align: center;">${item.icone || '💰'}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: bold; font-size: 15px; margin-bottom: 3px;">${item.nome}</div>
                            <div style="color: ${cor}; font-weight: bold; font-size: 15px;">${formatarMoeda(item.valor)}</div>
                            <div style="color: #999; font-size: 11px; margin-top: 2px;">${dataFormatada}</div>
                            ${item.fixo ? '<div style="font-size: 10px; color: #ff9800; margin-top: 3px; background: #fff3e0; padding: 2px 6px; border-radius: 8px; display: inline-block;">FIXO</div>' : ''}
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="editarItem('${tipo.slice(0, -1)}', ${item.id})" style="background: none; border: none; font-size: 18px; color: #8a2be2; padding: 5px; width: 36px; height: 36px;">✏️</button>
                        <button onclick="excluirItem('${tipo.slice(0, -1)}', ${item.id})" style="background: none; border: none; font-size: 18px; color: #ff3b30; padding: 5px; width: 36px; height: 36px;">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// MODAL
function abrirModal() {
    // Resetar formulário
    document.getElementById('formTransacao').reset();
    
    // Configurar título e opções baseadas no tipo
    if (tipoAtual === 'renda') {
        document.getElementById('modalTitulo').textContent = itemEditando ? 'Editar Renda' : 'Nova Renda';
        document.getElementById('divFixo').style.display = 'none';
    } else {
        document.getElementById('modalTitulo').textContent = itemEditando ? 'Editar Despesa' : 'Nova Despesa';
        document.getElementById('divFixo').style.display = 'block';
    }
    
    // Inicializar ícones do tipo correto
    inicializarIcones(tipoAtual);
    
    // Se estiver editando, preencher dados
    if (itemEditando) {
        document.getElementById('inputNome').value = itemEditando.nome;
        document.getElementById('inputValor').value = itemEditando.valor;
        document.getElementById('inputId').value = itemEditando.id;
        
        if (tipoAtual === 'gasto') {
            document.getElementById('inputFixo').checked = itemEditando.fixo || false;
        }
        
        // Selecionar ícone correto
        setTimeout(() => {
            const container = document.getElementById('iconesContainer');
            container.querySelectorAll('button').forEach(botao => {
                botao.style.background = '#f0f0f0';
                botao.style.borderColor = 'transparent';
                
                if (botao.textContent === itemEditando.icone) {
                    botao.style.background = '#e6d4ff';
                    botao.style.borderColor = '#8a2be2';
                    iconeSelecionado = botao.textContent;
                }
            });
        }, 50);
    } else {
        // Limpar ID para nova transação
        document.getElementById('inputId').value = '';
    }
    
    // Mostrar modal
    document.getElementById('modal').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal').style.display = 'none';
    itemEditando = null;
    iconeSelecionado = null;
}

function salvarTransacao() {
    // Obter valores
    const nome = document.getElementById('inputNome').value.trim();
    const valor = parseFloat(document.getElementById('inputValor').value);
    const id = document.getElementById('inputId').value;
    
    // Verificar se ícone foi selecionado
    if (!iconeSelecionado) {
        alert('Selecione um ícone!');
        return;
    }
    
    // Obter fixo (apenas para gastos)
    const fixo = tipoAtual === 'gasto' ? document.getElementById('inputFixo').checked : false;
    
    // Validar
    if (!nome || isNaN(valor) || valor <= 0) {
        alert('Preencha todos os campos corretamente!');
        return;
    }
    
    // Criar/atualizar transação
    const transacao = {
        id: id ? parseInt(id) : Date.now(),
        nome: nome,
        valor: valor,
        icone: iconeSelecionado,
        fixo: fixo,
        data: new Date().toISOString()
    };
    
    // Salvar na lista correta
    if (tipoAtual === 'renda') {
        if (id) {
            // Atualizar existente
            const index = rendas.findIndex(r => r.id === parseInt(id));
            if (index !== -1) {
                rendas[index] = transacao;
            } else {
                rendas.push(transacao);
            }
        } else {
            // Adicionar nova
            rendas.push(transacao);
        }
    } else {
        if (id) {
            // Atualizar existente
            const index = gastos.findIndex(g => g.id === parseInt(id));
            if (index !== -1) {
                gastos[index] = transacao;
            } else {
                gastos.push(transacao);
            }
        } else {
            // Adicionar nova
            gastos.push(transacao);
        }
    }
    
    // Salvar no localStorage
    salvarDados();
    
    // Atualizar interface
    atualizarTudo();
    
    // Atualizar lista se estiver visível
    if (tipoAtual === 'renda') {
        renderizarLista('rendas');
    } else {
        renderizarLista('gastos');
    }
    
    // Fechar modal
    fecharModal();
    
    alert('Transação salva com sucesso!');
}

// EDITAR ITEM
function editarItem(tipo, id) {
    const lista = tipo === 'renda' ? rendas : gastos;
    itemEditando = lista.find(item => item.id === id);
    
    if (!itemEditando) {
        alert('Item não encontrado!');
        return;
    }
    
    // Definir tipo atual
    tipoAtual = tipo;
    
    // Abrir modal
    abrirModal();
}

// EXCLUIR ITEM
function excluirItem(tipo, id) {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    
    if (tipo === 'renda') {
        rendas = rendas.filter(item => item.id !== id);
    } else {
        gastos = gastos.filter(item => item.id !== id);
    }
    
    // Salvar no localStorage
    salvarDados();
    
    // Atualizar interface
    atualizarTudo();
    
    // Atualizar lista
    renderizarLista(tipo === 'renda' ? 'rendas' : 'gastos');
    
    alert('Item excluído com sucesso!');
}

// BACKUP
function fazerBackup() {
    const dados = {
        rendas: rendas,
        gastos: gastos,
        dataBackup: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashly-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Backup criado com sucesso!');
}

// LIMPAR DADOS
function limparDados() {
    if (confirm('Tem certeza que deseja limpar TODOS os dados? Isso não pode ser desfeito.')) {
        rendas = [];
        gastos = [];
        localStorage.removeItem('cashlyData');
        atualizarTudo();
        alert('Todos os dados foram limpos!');
    }
}

// INSTALAR APP
function instalarApp() {
    alert('Para instalar o app no iPhone:\n\n1. Abra no Safari\n2. Toque no botão de compartilhar (📤)\n3. Role para baixo\n4. Toque em "Adicionar à Tela de Início"\n5. Toque em "Adicionar"');
}
